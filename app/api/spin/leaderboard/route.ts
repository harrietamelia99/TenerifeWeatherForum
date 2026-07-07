import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerClient();

    // Current month top 10 — sorted by monthly_points
    const { data: top10, error } = await supabase
      .from("spin_users")
      .select("id, email, display_name, monthly_points")
      .order("monthly_points", { ascending: false })
      .limit(10);

    if (error) throw error;

    const leaderboard = top10
      .filter((u) => u.monthly_points > 0)
      .map((u, i) => ({
        rank:        i + 1,
        displayName: u.display_name ?? u.email.split("@")[0],
        points:      u.monthly_points,
      }));

    // Previous month's top-3 archive
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;

    const { data: prevWinners } = await supabase
      .from("spin_leaderboard_archive")
      .select("rank, display_name, email, points, month")
      .eq("month", prevMonthKey)
      .order("rank");

    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    return NextResponse.json({
      currentMonth,
      leaderboard,
      previousWinners: (prevWinners ?? []).map((w) => ({
        rank:        w.rank,
        displayName: w.display_name ?? w.email?.split("@")[0] ?? "Anonymous",
        points:      w.points,
        month:       w.month,
      })),
    });
  } catch (err) {
    console.error("[api/spin/leaderboard]", err);
    return NextResponse.json({ error: "Failed to load leaderboard." }, { status: 500 });
  }
}
