"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import SpinWheel from "@/components/spin/SpinWheel";
import WinModal, { type WinResult } from "@/components/spin/WinModal";
import SpinCountdown from "@/components/spin/SpinCountdown";
import SpinLeaderboard from "@/components/spin/SpinLeaderboard";

// ─── Responsive wheel size ────────────────────────────────────────────────────
function useWheelSize() {
  const [size, setSize] = useState(460);
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      if (vw < 480)  setSize(Math.min(vw - 32, 320));
      else if (vw < 768)  setSize(380);
      else if (vw < 1024) setSize(420);
      else setSize(460);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

interface UserData {
  email:              string;
  displayName:        string | null;
  totalPoints:        number;
  monthlyPoints:      number;
  canSpin:            boolean;
  nextSpinAt:         string | null;
  bonusSpinAvailable: boolean;
}

export default function SpinPage() {
  const { data: session, status } = useSession();
  const router    = useRouter();
  const wheelSize = useWheelSize();

  const [userData,  setUserData]  = useState<UserData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [rotation,  setRotation]  = useState(0);
  const [spinning,  setSpinning]  = useState(false);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const [modal,     setModal]     = useState<WinResult | null>(null);
  const [lastWin,   setLastWin]   = useState<WinResult | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const rotRef = useRef(0);

  // ─── Auth & load ───────────────────────────────────────────────────────────
  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch("/api/spin/me");
      if (res.ok) setUserData(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/preview/spin/login");
    else if (status === "authenticated") fetchUserData();
  }, [status, router, fetchUserData]);

  // ─── Spin ──────────────────────────────────────────────────────────────────
  const spin = useCallback(async () => {
    if (!userData || spinning) return;
    if (!userData.canSpin && !userData.bonusSpinAvailable) return;
    setSpinning(true);
    setModal(null);
    setError(null);
    setWinnerIdx(null);

    try {
      const res  = await fetch("/api/spin", { method: "POST" });
      const data = await res.json();

      if (!res.ok) { setError(data.error ?? "Spin failed."); setSpinning(false); return; }

      const idx: number = data.segmentIndex;
      const targetMod = ((345 - idx * 30) % 360 + 360) % 360;
      const curMod    = rotRef.current % 360;
      let delta = (targetMod - curMod + 360) % 360;
      if (delta < 30) delta += 360;
      const newRot = rotRef.current + delta + 6 * 360;
      rotRef.current = newRot;
      setRotation(newRot);

      setTimeout(async () => {
        setWinnerIdx(idx);
        setSpinning(false);
        const result: WinResult = {
          segmentIndex: idx,
          label:        data.segment.label,
          points:       data.segment.points,
          isSpinAgain:  data.segment.isSpinAgain,
        };
        setModal(result);
        setLastWin(result);
        // Re-fetch fresh user state — avoids manual state patching bugs
        await fetchUserData();
      }, 6200);
    } catch {
      setError("Something went wrong. Please try again.");
      setSpinning(false);
    }
  }, [spinning, userData, fetchUserData]);

  const handleCountdownExpired = useCallback(() => {
    setUserData(prev => prev ? { ...prev, canSpin: true, nextSpinAt: null } : prev);
  }, []);

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background:"linear-gradient(160deg,#020f1e 0%,#0c2340 50%,#07101e 100%)" }}>
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || !userData) return null;

  const displayName = userData.displayName ?? session.user?.email?.split("@")[0] ?? "Player";
  const canPress    = (userData.canSpin || userData.bonusSpinAvailable) && !spinning;

  return (
    <div className="min-h-screen pt-[128px]"
      style={{ background:"linear-gradient(160deg,#020f1e 0%,#0c2340 55%,#07101e 100%)" }}>

      {modal && <WinModal result={modal} onDismiss={() => setModal(null)} />}

      {/* Preview banner */}
      <div className="w-full py-1.5 text-center text-xs font-bold uppercase tracking-widest"
        style={{ background:"#fbbf24", color:"#1a0500" }}>
        Preview — not live yet
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b"
        style={{ borderColor:"rgba(255,255,255,0.07)" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.4)" }}>
            Tenerife Weather Forum
          </p>
          <h1 className="text-base sm:text-lg font-black" style={{ color:"#fbbf24" }}>Lucky Spin ✦</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs" style={{ color:"rgba(255,255,255,0.45)" }}>Signed in as</p>
            <p className="text-sm font-semibold" style={{ color:"rgba(255,255,255,0.85)" }}>{displayName}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl:"/preview/spin/login" })}
            className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold"
            style={{ background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)", border:"1px solid rgba(255,255,255,0.12)" }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Layout ── */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-5 lg:gap-8 justify-center">

          {/* ── LEFT controls (desktop only) ── */}
          <div className="hidden lg:flex flex-col items-stretch gap-4 w-52 order-1 flex-shrink-0">
            {/* Monthly points */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color:"rgba(255,255,255,0.45)" }}>
                This Month
              </p>
              <p className="text-5xl font-black tabular-nums" style={{ color:"#fbbf24", textShadow:"0 0 28px rgba(251,191,36,0.55)" }}>
                {userData.monthlyPoints.toLocaleString()}
              </p>
              <p className="text-xs mt-1" style={{ color:"rgba(255,255,255,0.3)" }}>
                {userData.totalPoints.toLocaleString()} lifetime pts
              </p>
            </div>

            <button onClick={spin} disabled={!canPress}
              className="w-full py-4 rounded-2xl font-black text-xl uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              style={{
                background: canPress ? "linear-gradient(135deg,#f59e0b,#ea580c)" : "rgba(255,255,255,0.1)",
                color:      canPress ? "#0c0a08" : "rgba(255,255,255,0.4)",
                boxShadow:  canPress ? "0 0 40px rgba(245,158,11,0.55),0 4px 16px rgba(0,0,0,0.4)" : "none",
              }}>
              {spinning ? "Spinning…" : "SPIN!"}
            </button>

            {userData.bonusSpinAvailable && (
              <div className="rounded-xl px-3 py-2 text-center"
                style={{ background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.3)" }}>
                <p className="text-xs font-bold" style={{ color:"#34d399" }}>✦ Bonus spin available!</p>
              </div>
            )}

            {!userData.canSpin && !userData.bonusSpinAvailable && userData.nextSpinAt && (
              <SpinCountdown nextSpinAt={userData.nextSpinAt} bonusAvailable={false} onExpired={handleCountdownExpired} />
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
            )}

            {lastWin && !spinning && !modal && (
              <button onClick={() => setModal(lastWin)}
                className="w-full text-sm font-semibold px-3 py-2 rounded-xl text-center"
                style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.45)", border:"1px solid rgba(255,255,255,0.1)" }}>
                {lastWin.isSpinAgain ? "🎰 Spin Again" : `+${lastWin.points} pts`} — {lastWin.label}
                <span className="block text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.3)" }}>tap to view result</span>
              </button>
            )}

            <details className="w-full">
              <summary className="text-xs cursor-pointer font-semibold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.3)" }}>
                How it works ▾
              </summary>
              <div className="mt-2 space-y-1 text-xs pl-1" style={{ color:"rgba(255,255,255,0.45)" }}>
                <p>• One spin every 24 hours.</p>
                <p>• Points count for this month's leaderboard.</p>
                <p>• Top 3 each month win prizes.</p>
                <p>• Newsletter subscribers get a bonus spin.</p>
                <p>• Leaderboard resets on the 1st.</p>
              </div>
            </details>
          </div>

          {/* ── CENTRE: wheel ── */}
          <div className="flex flex-col items-center gap-4 order-1 lg:order-2 flex-shrink-0">
            <SpinWheel rotation={rotation} spinning={spinning} winnerIdx={winnerIdx} size={wheelSize} />

            {/* Mobile controls */}
            <div className="lg:hidden w-full max-w-sm space-y-3">
              <div className="flex items-center gap-3">
                {/* Monthly points */}
                <div className="flex-1 text-center rounded-2xl py-3"
                  style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>
                    This Month
                  </p>
                  <p className="text-3xl font-black tabular-nums" style={{ color:"#fbbf24", textShadow:"0 0 20px rgba(251,191,36,0.5)" }}>
                    {userData.monthlyPoints.toLocaleString()}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.3)" }}>
                    {userData.totalPoints.toLocaleString()} lifetime
                  </p>
                </div>
                <button onClick={spin} disabled={!canPress}
                  className="flex-1 py-5 rounded-2xl font-black text-xl uppercase tracking-wider disabled:opacity-40 active:scale-95 transition-all"
                  style={{
                    background: canPress ? "linear-gradient(135deg,#f59e0b,#ea580c)" : "rgba(255,255,255,0.08)",
                    color:      canPress ? "#0c0a08" : "rgba(255,255,255,0.35)",
                    boxShadow:  canPress ? "0 0 36px rgba(245,158,11,0.5)" : "none",
                  }}>
                  {spinning ? "…" : "SPIN!"}
                </button>
              </div>

              {userData.bonusSpinAvailable && (
                <div className="rounded-xl px-3 py-2 text-center"
                  style={{ background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.3)" }}>
                  <p className="text-xs font-bold" style={{ color:"#34d399" }}>✦ Bonus spin available!</p>
                </div>
              )}

              {!userData.canSpin && !userData.bonusSpinAvailable && userData.nextSpinAt && (
                <SpinCountdown nextSpinAt={userData.nextSpinAt} bonusAvailable={false} onExpired={handleCountdownExpired} />
              )}

              {error && (
                <p className="text-xs text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
              )}

              {lastWin && !spinning && !modal && (
                <button onClick={() => setModal(lastWin)}
                  className="w-full text-sm font-semibold px-3 py-2 rounded-xl text-center"
                  style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.45)", border:"1px solid rgba(255,255,255,0.1)" }}>
                  {lastWin.isSpinAgain ? "🎰" : `+${lastWin.points} pts`} — {lastWin.label}
                  <span className="block text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.3)" }}>tap to view result</span>
                </button>
              )}
            </div>
          </div>

          {/* ── RIGHT: leaderboard ── */}
          <div className="w-full sm:max-w-sm lg:max-w-none lg:w-72 order-3 flex-shrink-0">
            <MobileLeaderboard />
          </div>

        </div>
      </main>
    </div>
  );
}

// ─── Collapsible leaderboard wrapper ─────────────────────────────────────────
function MobileLeaderboard() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)" }}>
      <button
        className="flex items-center justify-between w-full px-5 py-4 lg:cursor-default"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-sm font-bold uppercase tracking-widest" style={{ color:"#fbbf24" }}>
          Leaderboard
        </span>
        <span className="text-xs lg:hidden" style={{ color:"rgba(255,255,255,0.4)" }}>
          {open ? "▲ hide" : "▼ show"}
        </span>
      </button>
      <div className={`px-5 pb-5 lg:block ${open ? "block" : "hidden"}`}>
        <SpinLeaderboard />
      </div>
    </div>
  );
}
