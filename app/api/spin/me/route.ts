import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { spinAuthOptions } from "@/lib/spinAuth";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getServerSession(spinAuthOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const supabase = createServerClient();
    const { data: user, error } = await supabase
      .from("spin_users")
      .select("email, display_name, total_points, last_spin_at, bonus_spin_available")
      .eq("id", session.user.id)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const now = Date.now();
    const lastSpin = user.last_spin_at ? new Date(user.last_spin_at).getTime() : 0;
    const cooldownMs = 24 * 60 * 60 * 1000;
    const msSinceLast = lastSpin ? now - lastSpin : Infinity;
    const canSpin = msSinceLast >= cooldownMs || user.bonus_spin_available;
    const nextSpinAt = msSinceLast < cooldownMs
      ? new Date(lastSpin + cooldownMs).toISOString()
      : null;

    return NextResponse.json({
      email:              user.email,
      displayName:        user.display_name,
      totalPoints:        user.total_points,
      canSpin,
      nextSpinAt,
      bonusSpinAvailable: user.bonus_spin_available,
    });
  } catch (err) {
    console.error("[api/spin/me]", err);
    return NextResponse.json({ error: "Failed to load user data." }, { status: 500 });
  }
}
