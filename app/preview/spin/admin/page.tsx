"use client";

import { useState, useCallback } from "react";

interface SpinUser {
  id:                    string;
  email:                 string;
  display_name:          string | null;
  total_points:          number;
  monthly_points:        number;
  last_spin_at:          string | null;
  bonus_spin_available:  boolean;
  created_at:            string;
}

interface ArchiveEntry {
  id:           string;
  month:        string;
  rank:         number;
  email:        string;
  display_name: string | null;
  points:       number;
}

type Tab = "leaderboard" | "users" | "winners";

function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1).toLocaleString("en-GB", { month: "long", year: "numeric" });
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function SpinAdminPage() {
  const [password, setPassword]       = useState("");
  const [authed, setAuthed]           = useState(false);
  const [authError, setAuthError]     = useState(false);
  const [activeTab, setActiveTab]     = useState<Tab>("leaderboard");
  const [users, setUsers]             = useState<SpinUser[]>([]);
  const [leaderboard, setLeaderboard] = useState<SpinUser[]>([]);
  const [winners, setWinners]         = useState<ArchiveEntry[]>([]);
  const [loading, setLoading]         = useState(false);
  const [adjustUser, setAdjustUser]   = useState<SpinUser | null>(null);
  const [adjustDelta, setAdjustDelta] = useState("");
  const [adjustMsg, setAdjustMsg]     = useState<string | null>(null);

  const headers = { "x-admin-password": password };

  async function tryLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/spin/admin?action=leaderboard", { headers: { "x-admin-password": password } });
    if (res.ok) {
      const data = await res.json();
      setLeaderboard(data.leaderboard);
      setAuthed(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  }

  const loadData = useCallback(async (tab: Tab) => {
    setLoading(true);
    setAdjustMsg(null);
    try {
      if (tab === "leaderboard") {
        const res = await fetch("/api/spin/admin?action=leaderboard", { headers });
        if (res.ok) setLeaderboard((await res.json()).leaderboard);
      } else if (tab === "users") {
        const res = await fetch("/api/spin/admin?action=users", { headers });
        if (res.ok) setUsers((await res.json()).users);
      } else if (tab === "winners") {
        const res = await fetch("/api/spin/admin?action=winners", { headers });
        if (res.ok) setWinners((await res.json()).winners);
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    loadData(tab);
  }

  async function handleAdjust() {
    if (!adjustUser || !adjustDelta) return;
    const delta = parseInt(adjustDelta, 10);
    if (isNaN(delta)) { setAdjustMsg("Enter a valid number (positive to add, negative to deduct)."); return; }

    const res = await fetch("/api/spin/admin", {
      method:  "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "adjust", userId: adjustUser.id, points: delta }),
    });
    const data = await res.json();
    if (res.ok) {
      setAdjustMsg(`Done! ${adjustUser.email} now has ${data.newPoints} points.`);
      setAdjustUser(null);
      setAdjustDelta("");
      loadData("users");
    } else {
      setAdjustMsg(data.error ?? "Failed.");
    }
  }

  async function handleArchive() {
    if (!confirm("Archive the current top-3 and reset everyone's monthly points to zero?\n\nDo this at the END of each month. It saves the winners then clears the board for next month.")) return;
    // Step 1: Archive
    const archiveRes = await fetch("/api/spin/admin", {
      method:  "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive" }),
    });
    const archiveData = await archiveRes.json();
    if (!archiveRes.ok) { alert(archiveData.error ?? "Archive failed."); return; }

    // Step 2: Reset monthly points
    const resetRes = await fetch("/api/spin/admin", {
      method:  "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset_monthly" }),
    });
    const resetData = await resetRes.json();
    if (!resetRes.ok) { alert(resetData.error ?? "Reset failed."); return; }

    alert(`Done! Archived ${archiveData.archived} winner(s) and reset all monthly points.`);
    loadData("leaderboard");
    loadData("winners");
  }

  async function handleGrantBonus(userId: string) {
    const res = await fetch("/api/spin/admin", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "grant_bonus", userId }),
    });
    if (res.ok) { loadData("users"); }
  }

  // ─── Auth wall ───────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(160deg, #020f1e 0%, #0c2340 55%, #07101e 100%)" }}
      >
        <div className="w-full max-w-xs">
          <h1 className="text-2xl font-black text-white text-center mb-2">Spin Admin</h1>
          <p className="text-sm text-center mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>Password protected</p>
          <form onSubmit={tryLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.07)", border: `1px solid ${authError ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.14)"}` }}
              placeholder="Admin password"
              autoFocus
            />
            {authError && <p className="text-sm text-red-400">Incorrect password.</p>}
            <button type="submit" className="w-full py-3 rounded-xl font-bold text-sm" style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "#0c0a08" }}>
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Admin panel ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-6" style={{ background: "linear-gradient(160deg, #020f1e 0%, #0c2340 55%, #07101e 100%)" }}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-black" style={{ color: "#fbbf24" }}>Lucky Spin Admin</h1>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Tenerife Weather Forum · Preview</p>
          </div>
          <div className="sm:text-right">
            <button
              onClick={handleArchive}
              className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.35)" }}
            >
              Archive &amp; Reset Month ↻
            </button>
            <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              Ties broken by who reached the score first
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["leaderboard", "users", "winners"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => switchTab(tab)}
              className="px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
              style={{
                background: activeTab === tab ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.05)",
                color:      activeTab === tab ? "#fbbf24" : "rgba(255,255,255,0.5)",
                border:     `1px solid ${activeTab === tab ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            Loading…
          </div>
        )}

        {/* Adjust points modal */}
        {adjustUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "#0c2340", border: "1px solid rgba(255,255,255,0.15)" }}>
              <h2 className="text-lg font-bold text-white mb-1">Adjust Points</h2>
              <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
                {adjustUser.email} · {adjustUser.monthly_points} pts this month · {adjustUser.total_points} lifetime
              </p>
              <input
                type="number"
                value={adjustDelta}
                onChange={(e) => setAdjustDelta(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none mb-3"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}
                placeholder="+50 or -100"
                autoFocus
              />
              {adjustMsg && <p className="text-sm text-amber-400 mb-3">{adjustMsg}</p>}
              <div className="flex gap-3">
                <button onClick={handleAdjust} className="flex-1 py-2.5 rounded-xl font-bold text-sm" style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "#0c0a08" }}>Apply</button>
                <button onClick={() => { setAdjustUser(null); setAdjustMsg(null); }} className="flex-1 py-2.5 rounded-xl font-bold text-sm" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard tab */}
        {activeTab === "leaderboard" && (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.09)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.06)" }}>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>#</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Email</th>
                  <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Monthly Pts</th>
                  <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Lifetime</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((u, i) => (
                  <tr key={u.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {MEDAL[i + 1] ?? <span style={{ color: "rgba(255,255,255,0.3)" }}>{i + 1}</span>}
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{u.display_name ?? "—"}</td>
                    <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.5)" }}>{u.email}</td>
                    <td className="px-4 py-3 text-right font-black tabular-nums" style={{ color: "#fbbf24" }}>{(u as SpinUser).monthly_points?.toLocaleString() ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: "rgba(255,255,255,0.4)" }}>{u.total_points.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users tab */}
        {activeTab === "users" && (
          <>
            {adjustMsg && !adjustUser && (
              <p className="text-sm text-green-400 mb-3">{adjustMsg}</p>
            )}
            <div className="rounded-2xl overflow-x-auto" style={{ border: "1px solid rgba(255,255,255,0.09)" }}>
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.06)" }}>
                    {["Email", "Display Name", "Monthly Pts", "Lifetime Pts", "Last Spin", "Bonus", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.75)" }}>{u.email}</td>
                      <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.55)" }}>{u.display_name ?? "—"}</td>
                      <td className="px-4 py-3 font-black tabular-nums" style={{ color: "#fbbf24" }}>{u.monthly_points.toLocaleString()}</td>
                      <td className="px-4 py-3 tabular-nums" style={{ color: "rgba(255,255,255,0.45)" }}>{u.total_points.toLocaleString()}</td>
                      <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {u.last_spin_at
                          ? new Date(u.last_spin_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                          : "Never"}
                      </td>
                      <td className="px-4 py-3">
                        {u.bonus_spin_available
                          ? <span className="text-xs font-bold text-green-400">Yes</span>
                          : <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>No</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setAdjustUser(u); setAdjustDelta(""); setAdjustMsg(null); }}
                            className="px-3 py-1 rounded-lg text-xs font-semibold"
                            style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}
                          >
                            Adjust pts
                          </button>
                          {!u.bonus_spin_available && (
                            <button
                              onClick={() => handleGrantBonus(u.id)}
                              className="px-3 py-1 rounded-lg text-xs font-semibold"
                              style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}
                            >
                              Grant bonus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Winners tab */}
        {activeTab === "winners" && (
          <div className="space-y-6">
            {Object.entries(
              winners.reduce<Record<string, ArchiveEntry[]>>((acc, w) => {
                if (!acc[w.month]) acc[w.month] = [];
                acc[w.month].push(w);
                return acc;
              }, {})
            )
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([month, entries]) => (
                <div key={month} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
                  <h3 className="font-bold text-sm mb-3" style={{ color: "#fbbf24" }}>{monthLabel(month)}</h3>
                  <ol className="space-y-2">
                    {entries.sort((a, b) => a.rank - b.rank).map((w) => (
                      <li key={w.id} className="flex items-center gap-3">
                        <span className="text-lg">{MEDAL[w.rank] ?? w.rank}</span>
                        <span className="flex-1 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                          {w.display_name ?? w.email}
                        </span>
                        <span className="text-sm font-black tabular-nums" style={{ color: "#fbbf24" }}>
                          {w.points.toLocaleString()} pts
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            {winners.length === 0 && !loading && (
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>No archived winners yet. Use the &ldquo;Archive this month&rsquo;s top 3&rdquo; button to save the current standings.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
