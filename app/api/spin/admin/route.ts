import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

function verifyAdmin(req: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD_WHEEL;
  const provided = req.headers.get("x-admin-password");
  return !!adminPassword && provided === adminPassword;
}

// GET /api/spin/admin?action=users|leaderboard|winners
export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const action = req.nextUrl.searchParams.get("action");
  const supabase = createServerClient();

  if (action === "users") {
    const { data, error } = await supabase
      .from("spin_users")
      .select("id, email, display_name, total_points, monthly_points, last_spin_at, bonus_spin_available, created_at")
      .order("monthly_points", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ users: data });
  }

  if (action === "leaderboard") {
    const { data, error } = await supabase
      .from("spin_users")
      .select("id, email, display_name, total_points, monthly_points")
      .order("monthly_points", { ascending: false })
      .limit(20);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ leaderboard: data });
  }

  if (action === "winners") {
    const { data, error } = await supabase
      .from("spin_leaderboard_archive")
      .select("*")
      .order("month", { ascending: false })
      .order("rank");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ winners: data });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}

// POST /api/spin/admin
export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json();
  const supabase = createServerClient();

  // ── Adjust a single user's points ───────────────────────────────────────────
  if (body.action === "adjust") {
    const { userId, points } = body;
    if (!userId || typeof points !== "number") {
      return NextResponse.json({ error: "userId and points are required." }, { status: 400 });
    }

    const { data: user, error: fetchErr } = await supabase
      .from("spin_users")
      .select("total_points, monthly_points")
      .eq("id", userId)
      .single();

    if (fetchErr || !user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const newTotal   = Math.max(0, user.total_points   + points);
    const newMonthly = Math.max(0, user.monthly_points + points);

    const { error } = await supabase
      .from("spin_users")
      .update({ total_points: newTotal, monthly_points: newMonthly })
      .eq("id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, newPoints: newTotal, newMonthlyPoints: newMonthly });
  }

  // ── Archive current top-3 (monthly_points) ───────────────────────────────────
  if (body.action === "archive") {
    const month: string = body.month ?? (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    })();

    const { data: top3, error: fetchErr } = await supabase
      .from("spin_users")
      .select("id, email, display_name, monthly_points")
      .order("monthly_points", { ascending: false })
      .gt("monthly_points", 0)
      .limit(3);

    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    if (!top3 || top3.length === 0) {
      return NextResponse.json({ error: "No players with points this month." }, { status: 400 });
    }

    for (let i = 0; i < top3.length; i++) {
      const u = top3[i];
      await supabase.from("spin_leaderboard_archive").upsert({
        month,
        rank:         i + 1,
        user_id:      u.id,
        email:        u.email,
        display_name: u.display_name,
        points:       u.monthly_points,
      }, { onConflict: "month,rank" });
    }

    return NextResponse.json({ success: true, archived: top3.length });
  }

  // ── Reset monthly points for all users (do AFTER archiving) ─────────────────
  if (body.action === "reset_monthly") {
    const { error } = await supabase
      .from("spin_users")
      .update({ monthly_points: 0 })
      .gte("monthly_points", 0); // matches all rows

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // ── Grant bonus spin ─────────────────────────────────────────────────────────
  if (body.action === "grant_bonus") {
    const { userId } = body;
    if (!userId) return NextResponse.json({ error: "userId required." }, { status: 400 });
    const { error } = await supabase
      .from("spin_users")
      .update({ bonus_spin_available: true })
      .eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
