"use client";

import { useEffect, useState, useCallback } from "react";

interface LeaderboardEntry {
  rank:        number;
  displayName: string;
  points:      number;
}

interface PreviousWinner extends LeaderboardEntry {
  month: string;
}

interface LeaderboardData {
  currentMonth:    string;
  leaderboard:     LeaderboardEntry[];
  previousWinners: PreviousWinner[];
}

function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1).toLocaleString("en-GB", { month: "long", year: "numeric" });
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function SpinLeaderboard() {
  const [data, setData]     = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/spin/leaderboard");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Current month */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#fbbf24" }}>
          {monthLabel(data.currentMonth)} Leaderboard
        </h3>
        {data.leaderboard.length === 0 ? (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            No spins yet this month — be the first!
          </p>
        ) : (
          <ol className="space-y-2">
            {data.leaderboard.map((entry) => (
              <li
                key={entry.rank}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                style={{
                  background: entry.rank <= 3
                    ? "rgba(251,191,36,0.1)"
                    : "rgba(255,255,255,0.04)",
                  border: entry.rank === 1
                    ? "1px solid rgba(251,191,36,0.35)"
                    : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span className="w-7 text-center text-lg leading-none">
                  {MEDAL[entry.rank] ?? (
                    <span className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {entry.rank}
                    </span>
                  )}
                </span>
                <span className="flex-1 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.88)" }}>
                  {entry.displayName}
                </span>
                <span className="text-sm font-black tabular-nums" style={{ color: "#fbbf24" }}>
                  {entry.points.toLocaleString()} pts
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Previous month winners */}
      {data.previousWinners.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            Last Month&apos;s Winners
          </h3>
          <ol className="space-y-1.5">
            {data.previousWinners.map((w) => (
              <li key={w.rank} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="text-base leading-none">{MEDAL[w.rank] ?? w.rank}</span>
                <span className="flex-1 text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {w.displayName}
                </span>
                <span className="text-xs font-bold tabular-nums" style={{ color: "rgba(251,191,36,0.7)" }}>
                  {w.points.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>
            {monthLabel(data.previousWinners[0].month)}
          </p>
        </div>
      )}

      <button
        onClick={load}
        className="text-xs font-semibold transition-opacity hover:opacity-80"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        ↻ Refresh
      </button>
    </div>
  );
}
