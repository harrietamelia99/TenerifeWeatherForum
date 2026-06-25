"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { SPIN_SEGMENTS } from "@/lib/spinSegments";
import SpinWheel from "@/components/spin/SpinWheel";
import WinModal, { type WinResult } from "@/components/spin/WinModal";
import SpinCountdown from "@/components/spin/SpinCountdown";
import SpinLeaderboard from "@/components/spin/SpinLeaderboard";

interface UserData {
  email:              string;
  displayName:        string | null;
  totalPoints:        number;
  canSpin:            boolean;
  nextSpinAt:         string | null;
  bonusSpinAvailable: boolean;
}

export default function SpinPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userData, setUserData]   = useState<UserData | null>(null);
  const [loading, setLoading]     = useState(true);

  // Wheel state
  const [rotation, setRotation]   = useState(0);
  const [spinning, setSpinning]   = useState(false);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const [modal, setModal]         = useState<WinResult | null>(null);
  const [lastWin, setLastWin]     = useState<WinResult | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const rotRef = useRef(0);

  // ─── Auth & initial load ────────────────────────────────────────────────────
  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch("/api/spin/me");
      if (res.ok) setUserData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/preview/spin/login");
    else if (status === "authenticated") fetchUserData();
  }, [status, router, fetchUserData]);

  // ─── Spin ───────────────────────────────────────────────────────────────────
  const spin = useCallback(async () => {
    if (!userData || spinning) return;
    if (!userData.canSpin && !userData.bonusSpinAvailable) return;

    setSpinning(true);
    setModal(null);
    setError(null);
    setWinnerIdx(null);

    try {
      const res = await fetch("/api/spin", { method: "POST" });
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

      setTimeout(() => {
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
        setUserData(prev => prev ? {
          ...prev,
          totalPoints: data.newTotalPoints,
          canSpin:     data.segment.isSpinAgain,
          nextSpinAt:  data.segment.isSpinAgain ? prev.nextSpinAt : data.nextSpinAt,
        } : prev);
      }, 6200);
    } catch {
      setError("Something went wrong. Please try again.");
      setSpinning(false);
    }
  }, [spinning, userData]);

  const handleCountdownExpired = useCallback(() => {
    setUserData(prev => prev ? { ...prev, canSpin: true, nextSpinAt: null } : prev);
  }, []);

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #020f1e 0%, #0c2340 50%, #07101e 100%)" }}>
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || !userData) return null;

  const displayName = userData.displayName ?? session.user?.email?.split("@")[0] ?? "Player";
  const canPress    = (userData.canSpin || userData.bonusSpinAvailable) && !spinning;

  return (
    <div className="min-h-screen pt-[128px]"
      style={{ background: "linear-gradient(160deg, #020f1e 0%, #0c2340 55%, #07101e 100%)" }}>

      {modal && <WinModal result={modal} onDismiss={() => setModal(null)} />}

      {/* Preview banner */}
      <div className="w-full py-1.5 text-center text-xs font-bold uppercase tracking-widest"
        style={{ background: "#fbbf24", color: "#1a0500" }}>
        Preview — not live
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
            Tenerife Weather Forum
          </p>
          <h1 className="text-lg font-black" style={{ color: "#fbbf24" }}>Lucky Spin ✦</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Signed in as</p>
            <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{displayName}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/preview/spin/login" })}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── 3-column layout ── */}
      <main className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8 justify-center">

          {/* ── LEFT: controls ── */}
          <div className="flex flex-col items-center lg:items-stretch gap-4 w-full lg:w-52 order-2 lg:order-1">

            {/* Points */}
            <div className="text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5"
                style={{ color: "rgba(255,255,255,0.45)" }}>Your Points</p>
              <p className="text-5xl font-black tabular-nums"
                style={{ color: "#fbbf24", textShadow: "0 0 28px rgba(251,191,36,0.55)" }}>
                {(userData.totalPoints).toLocaleString()}
              </p>
            </div>

            {/* Spin button */}
            <button
              onClick={spin}
              disabled={!canPress}
              className="w-full py-4 rounded-2xl font-black text-xl uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              style={{
                background: canPress ? "linear-gradient(135deg,#f59e0b,#ea580c)" : "rgba(255,255,255,0.1)",
                color:      canPress ? "#0c0a08" : "rgba(255,255,255,0.4)",
                boxShadow:  canPress ? "0 0 40px rgba(245,158,11,0.55),0 4px 16px rgba(0,0,0,0.4)" : "none",
              }}
            >
              {spinning ? "Spinning…" : "SPIN!"}
            </button>

            {/* Bonus spin badge */}
            {userData.bonusSpinAvailable && (
              <div className="rounded-xl px-3 py-2 text-center"
                style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)" }}>
                <p className="text-xs font-bold" style={{ color: "#34d399" }}>✦ Bonus spin available!</p>
              </div>
            )}

            {/* Countdown */}
            {!userData.canSpin && !userData.bonusSpinAvailable && userData.nextSpinAt && (
              <SpinCountdown
                nextSpinAt={userData.nextSpinAt}
                bonusAvailable={userData.bonusSpinAvailable}
                onExpired={handleCountdownExpired}
              />
            )}

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Last win pill */}
            {lastWin && !spinning && !modal && (
              <button
                onClick={() => setModal(lastWin)}
                className="w-full text-sm font-semibold px-3 py-2 rounded-xl text-center transition-opacity hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {lastWin.isSpinAgain ? "🎰 Spin Again" : `+${lastWin.points} pts`} — {lastWin.label}
                <span className="block text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>tap to view result</span>
              </button>
            )}

            {/* How it works */}
            <details className="w-full">
              <summary className="text-xs cursor-pointer font-semibold uppercase tracking-wider"
                style={{ color: "rgba(255,255,255,0.3)" }}>
                How it works ▾
              </summary>
              <div className="mt-2 space-y-1 text-xs pl-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                <p>• Spin once every 24 hours.</p>
                <p>• Points build on the leaderboard.</p>
                <p>• Top 3 each month win prizes.</p>
                <p>• Newsletter subscribers get a bonus spin.</p>
                <p>• Leaderboard resets on the 1st.</p>
              </div>
            </details>
          </div>

          {/* ── CENTRE: wheel ── */}
          <div className="flex-shrink-0 order-1 lg:order-2">
            <SpinWheel rotation={rotation} spinning={spinning} winnerIdx={winnerIdx} size={460} />
          </div>

          {/* ── RIGHT: leaderboard ── */}
          <div className="w-full lg:w-72 rounded-2xl p-5 order-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <SpinLeaderboard />
          </div>

        </div>
      </main>
    </div>
  );
}
