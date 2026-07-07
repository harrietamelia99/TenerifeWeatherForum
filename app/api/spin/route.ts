import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { spinAuthOptions } from "@/lib/spinAuth";
import { pickWeightedSegment, SPIN_SEGMENTS } from "@/lib/spinSegments";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(spinAuthOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const userId   = session.user.id;
    const supabase = createServerClient();

    // ── Fetch current user state ───────────────────────────────────────────────
    const { data: user, error: userErr } = await supabase
      .from("spin_users")
      .select("total_points, monthly_points, last_spin_at, bonus_spin_available")
      .eq("id", userId)
      .single();

    if (userErr || !user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const now         = new Date();
    const cooldownMs  = 24 * 60 * 60 * 1000;
    const lastSpin    = user.last_spin_at ? new Date(user.last_spin_at) : null;
    const msSinceLast = lastSpin ? now.getTime() - lastSpin.getTime() : Infinity;
    const canSpin     = msSinceLast >= cooldownMs;
    const hasBonus    = user.bonus_spin_available === true;

    if (!canSpin && !hasBonus) {
      const nextSpinAt = lastSpin
        ? new Date(lastSpin.getTime() + cooldownMs).toISOString()
        : null;
      return NextResponse.json({ error: "Spin not available yet.", nextSpinAt }, { status: 429 });
    }

    const usingBonus = !canSpin && hasBonus;

    // ── Atomic claim — prevents double-tab race condition ─────────────────────
    // We only update the row if it still matches the state we just read.
    // If a concurrent request already claimed the spin, 0 rows are returned
    // and we reject with 429.
    if (usingBonus) {
      const { data: claimed } = await supabase
        .from("spin_users")
        .update({ bonus_spin_available: false })
        .eq("id", userId)
        .eq("bonus_spin_available", true)       // only matches if bonus is still available
        .select("id")
        .maybeSingle();

      if (!claimed) {
        return NextResponse.json({ error: "Spin not available yet." }, { status: 429 });
      }
    } else {
      // Main spin: atomically set last_spin_at only if cooldown has passed
      const cooldownAgo = new Date(now.getTime() - cooldownMs).toISOString();
      const { data: claimed } = await supabase
        .from("spin_users")
        .update({ last_spin_at: now.toISOString() })
        .eq("id", userId)
        .or(`last_spin_at.is.null,last_spin_at.lte.${cooldownAgo}`) // matches only if canSpin
        .select("id")
        .maybeSingle();

      if (!claimed) {
        return NextResponse.json({ error: "Spin not available yet." }, { status: 429 });
      }
    }

    // ── Pick the winning segment ───────────────────────────────────────────────
    const segmentIndex = pickWeightedSegment();
    const segment      = SPIN_SEGMENTS[segmentIndex];
    const isSpinAgain  = segment.isSpinAgain === true;

    // ── Update points (and revert claim if Spin Again) ────────────────────────
    // Spin Again grants a free re-spin — restore whichever token was just consumed.
    const updates: Record<string, unknown> = {
      total_points:   user.total_points   + segment.points,
      monthly_points: user.monthly_points + segment.points,
    };

    if (isSpinAgain) {
      if (usingBonus) {
        updates.bonus_spin_available = true;          // restore bonus
      } else {
        updates.last_spin_at = user.last_spin_at;     // restore original timestamp
      }
    }

    const { error: updateErr } = await supabase
      .from("spin_users")
      .update(updates)
      .eq("id", userId);

    if (updateErr) throw updateErr;

    // ── Record spin history ────────────────────────────────────────────────────
    await supabase.from("spin_history").insert({
      user_id:       userId,
      segment_label: segment.label,
      points_won:    segment.points,
      is_bonus_spin: usingBonus,
    });

    return NextResponse.json({
      segmentIndex,
      segment: {
        label:       segment.label,
        points:      segment.points,
        isSpinAgain: isSpinAgain,
      },
      newTotalPoints:   user.total_points   + segment.points,
      newMonthlyPoints: user.monthly_points + segment.points,
      nextSpinAt: isSpinAgain
        ? null
        : usingBonus
          ? (lastSpin ? new Date(lastSpin.getTime() + cooldownMs).toISOString() : null)
          : new Date(now.getTime() + cooldownMs).toISOString(),
    });
  } catch (err) {
    console.error("[api/spin]", err);
    return NextResponse.json({ error: "Spin failed. Please try again." }, { status: 500 });
  }
}
