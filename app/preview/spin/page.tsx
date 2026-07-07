"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import SpinWheel from "@/components/spin/SpinWheel";
import WinModal, { type WinResult } from "@/components/spin/WinModal";
import SpinLeaderboard from "@/components/spin/SpinLeaderboard";

// ─── Responsive wheel size — fits inside the visible viewport ─────────────────
// Fixed UI above the wheel: navbar (~128px) + preview banner (~28px) +
// user header (~44px) + title (~110px) + pill (~80px) + gaps (~40px) ≈ 430px
const CHROME_HEIGHT = 430;

function useWheelSize() {
  const [size, setSize] = useState(380);
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const byHeight = Math.max(220, vh - CHROME_HEIGHT);
      let byWidth: number;
      if (vw < 480)       byWidth = vw - 20;
      else if (vw < 768)  byWidth = 380;
      else if (vw < 1200) byWidth = 420;
      else                byWidth = 480;
      setSize(Math.min(byWidth, byHeight));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

// ─── Countdown hook (returns display string + fires onExpired once) ───────────
function useCountdown(nextSpinAt: string | null, onExpired: () => void) {
  const calcMs = useCallback(() =>
    nextSpinAt ? Math.max(0, new Date(nextSpinAt).getTime() - Date.now()) : 0,
  [nextSpinAt]);

  const [ms, setMs] = useState(calcMs);
  const firedRef    = useRef(false);
  const cbRef       = useRef(onExpired);
  cbRef.current     = onExpired;

  useEffect(() => {
    firedRef.current = false;
    setMs(calcMs());
    if (!nextSpinAt) return;

    const id = setInterval(() => {
      const remaining = calcMs();
      setMs(remaining);
      if (remaining === 0 && !firedRef.current) {
        firedRef.current = true;
        clearInterval(id);
        cbRef.current();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [nextSpinAt, calcMs]);

  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const display = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return { ms, display };
}

// ─── Spin sound (Web Audio API — triggered on user click, respects autoplay) ──
function useSpinSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  return useCallback(() => {
    try {
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext ||
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const totalDuration = 6.2;
      const ticks = 52;

      for (let i = 0; i < ticks; i++) {
        // Quadratic spacing — many ticks (fast) at start, few (slow) at end
        const t = totalDuration * Math.pow(i / ticks, 2);

        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        // Pitch: 600 Hz → 200 Hz as wheel slows
        osc.frequency.value = 600 - (i / ticks) * 400;
        osc.type = "square";

        const startTime = ctx.currentTime + t;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.10, startTime + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.06);
        osc.start(startTime);
        osc.stop(startTime + 0.08);
      }
    } catch {
      // Silently skip if AudioContext unavailable
    }
  }, []);
}

// ─── Tropical background ──────────────────────────────────────────────────────
function TropicalBackground() {
  return (
    <div
      className="fixed inset-0"
      aria-hidden="true"
      style={{
        zIndex: 0,
        backgroundImage: "url(/spin-bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      {/* Dark overlay so text/wheel stays readable */}
      <div className="absolute inset-0" style={{ background: "rgba(0,10,28,0.45)" }} />
    </div>
  );
}

// ─── "SUPER LUCKY SPIN" title ─────────────────────────────────────────────────
function SpinTitle() {
  return (
    <div className="text-center select-none" style={{ lineHeight: 1.0, marginBottom: -4 }}>
      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.25)} }
        .spark { display:inline-block; animation: twinkle 1.8s ease-in-out infinite; }
        .spark:nth-child(2) { animation-delay:.6s }
        .spark:nth-child(3) { animation-delay:1.2s }
      `}</style>

      {/* SUPER */}
      <div style={{
        fontSize: "clamp(22px,4.5vw,50px)",
        fontWeight: 900,
        color: "white",
        fontFamily: "system-ui, sans-serif",
        letterSpacing: "0.18em",
        WebkitTextStroke: "2px #0c1f3a",
        textShadow: "3px 3px 0 #0c1f3a, -1px -1px 0 #0c1f3a, 0 0 18px rgba(255,255,255,0.25)",
      }}>
        SUPER
      </div>

      {/* Location pin */}
      <div style={{ fontSize: "clamp(18px,3vw,28px)", margin: "-2px 0" }}>📍</div>

      {/* LUCKY SPIN */}
      <div style={{
        fontSize: "clamp(32px,7vw,76px)",
        fontWeight: 900,
        color: "#fbbf24",
        fontFamily: "system-ui, sans-serif",
        letterSpacing: "0.06em",
        textShadow: [
          "2px 2px 0 #b45309",
          "4px 4px 0 #92400e",
          "6px 6px 0 #78350f",
          "0 0 40px rgba(251,191,36,0.65)",
          "0 0 80px rgba(251,191,36,0.25)",
        ].join(", "),
      }}>
        <span className="spark" style={{ color: "#fde68a", fontSize: "0.5em" }}>✦</span>
        {" "}LUCKY SPIN{" "}
        <span className="spark" style={{ color: "#fde68a", fontSize: "0.5em" }}>✦</span>
        <span className="spark" style={{ color: "#fde68a", fontSize: "0.4em", marginLeft: 2 }}>✦</span>
      </div>
    </div>
  );
}

// ─── User data ────────────────────────────────────────────────────────────────
interface UserData {
  email:              string;
  displayName:        string | null;
  totalPoints:        number;
  monthlyPoints:      number;
  canSpin:            boolean;
  nextSpinAt:         string | null;
  bonusSpinAvailable: boolean;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SpinPage() {
  const { data: session, status } = useSession();
  const router    = useRouter();
  const wheelSize = useWheelSize();
  const playSound = useSpinSound();

  const [userData,  setUserData]  = useState<UserData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [rotation,  setRotation]  = useState(0);
  const [spinning,  setSpinning]  = useState(false);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const [modal,     setModal]     = useState<WinResult | null>(null);
  const [lastWin,   setLastWin]   = useState<WinResult | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const rotRef = useRef(0);

  const handleCountdownExpired = useCallback(() => {
    setUserData(prev => prev ? { ...prev, canSpin: true, nextSpinAt: null } : prev);
  }, []);

  const { display: countdownDisplay, ms: countdownMs } = useCountdown(
    userData?.nextSpinAt ?? null,
    handleCountdownExpired,
  );

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

  const spin = useCallback(async () => {
    if (!userData || spinning) return;
    if (!userData.canSpin && !userData.bonusSpinAvailable) return;

    playSound(); // triggered by user click — satisfies browser autoplay policy
    setSpinning(true);
    setModal(null);
    setError(null);
    setWinnerIdx(null);

    try {
      const res  = await fetch("/api/spin", { method: "POST" });
      const data = await res.json();

      if (!res.ok) { setError(data.error ?? "Spin failed."); setSpinning(false); return; }

      const idx: number = data.segmentIndex;
      const targetMod   = ((345 - idx * 30) % 360 + 360) % 360;
      const curMod      = rotRef.current % 360;
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
        setSpinCount(c => c + 1);
        await fetchUserData();
      }, 6200);
    } catch {
      setError("Something went wrong. Please try again.");
      setSpinning(false);
    }
  }, [spinning, userData, fetchUserData, playSound]);

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (status === "loading" || loading) {
    return (
      <>
        <TropicalBackground />
        <div className="relative min-h-screen flex items-center justify-center" style={{ zIndex: 1 }}>
          <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!session || !userData) return null;

  const displayName = userData.displayName ?? session.user?.email?.split("@")[0] ?? "Player";
  const canPress    = (userData.canSpin || userData.bonusSpinAvailable) && !spinning;
  const showCountdown = !userData.canSpin && !userData.bonusSpinAvailable && countdownMs > 0;

  return (
    <>
      <TropicalBackground />

      <div className="relative min-h-screen pt-[128px]" style={{ zIndex: 1 }}>
        {modal && <WinModal result={modal} onDismiss={() => setModal(null)} />}

        {/* Preview banner */}
        <div className="w-full py-1.5 text-center text-xs font-bold uppercase tracking-widest"
          style={{ background: "#fbbf24", color: "#1a0500" }}>
          Preview — not live yet
        </div>

        {/* User header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-2.5"
          style={{ background: "rgba(4,15,32,0.75)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.4)" }}>Tenerife Weather Forum</p>
            <p className="text-sm font-black" style={{ color: "#fbbf24" }}>Lucky Spin ✦</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Signed in as</p>
              <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{displayName}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/preview/spin/login" })}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 justify-center">

            {/* ── CENTER: Title + Wheel + Bottom pill ── */}
            <div className="flex flex-col items-center gap-2">

              <SpinTitle />

              <SpinWheel rotation={rotation} spinning={spinning} winnerIdx={winnerIdx} size={wheelSize} />

              {/* ── Bottom pill bar ── */}
              <div style={{
                background:    "rgba(4,12,28,0.92)",
                border:        "2px solid rgba(251,191,36,0.28)",
                borderRadius:  "60px",
                backdropFilter:"blur(16px)",
                boxShadow:     "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
                display:       "flex",
                alignItems:    "center",
                gap:           "10px",
                padding:       "10px 16px",
                width:         Math.min(wheelSize, 480),
                maxWidth:      "calc(100vw - 24px)",
              }}>
                {/* Left: points */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: "0 0 auto" }}>
                  <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>⭐</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "clamp(16px,3.5vw,22px)", fontWeight: 900, color: "#fbbf24",
                      lineHeight: 1, fontFamily: "system-ui,sans-serif",
                      textShadow: "0 0 16px rgba(251,191,36,0.5)" }}>
                      {userData.monthlyPoints.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.45)",
                      letterSpacing: "1.5px", fontFamily: "system-ui,sans-serif" }}>
                      POINTS
                    </div>
                  </div>
                </div>

                {/* Center: SPIN button */}
                <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
                  <button
                    onClick={spin}
                    disabled={!canPress}
                    style={{
                      width:         "100%",
                      padding:       "10px 8px 8px",
                      borderRadius:  "40px",
                      fontWeight:    900,
                      fontSize:      "clamp(18px,4vw,26px)",
                      letterSpacing: "0.12em",
                      fontFamily:    "system-ui,sans-serif",
                      cursor:        canPress ? "pointer" : "not-allowed",
                      transition:    "all 0.15s",
                      background:    canPress
                        ? "linear-gradient(135deg,#fbbf24,#f97316)"
                        : "rgba(255,255,255,0.08)",
                      color:         canPress ? "#0c0a00" : "rgba(255,255,255,0.3)",
                      boxShadow:     canPress
                        ? "0 0 36px rgba(251,191,36,0.6), 0 4px 16px rgba(0,0,0,0.4)"
                        : "none",
                      border:        "none",
                      opacity:       !canPress && !spinning ? 0.6 : 1,
                    }}
                  >
                    {spinning ? "SPINNING…" : "SPIN"}
                  </button>
                  <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.35)",
                    letterSpacing: "1.2px", marginTop: 4, fontFamily: "system-ui,sans-serif" }}>
                    1 FREE SPIN EVERY 24 HOURS
                  </div>
                </div>

                {/* Right: countdown / READY */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "0 0 auto", textAlign: "right" }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.45)",
                      letterSpacing: "1.2px", fontFamily: "system-ui,sans-serif", textAlign: "right" }}>
                      NEXT SPIN IN
                    </div>
                    {showCountdown ? (
                      <div style={{ fontSize: "clamp(13px,2.5vw,18px)", fontWeight: 900, color: "#fbbf24",
                        fontFamily: "system-ui,sans-serif", letterSpacing: "0.05em",
                        textShadow: "0 0 14px rgba(251,191,36,0.4)", lineHeight: 1 }}>
                        {countdownDisplay}
                      </div>
                    ) : (
                      <div style={{ fontSize: "clamp(13px,2.5vw,17px)", fontWeight: 900, color: "#34d399",
                        fontFamily: "system-ui,sans-serif", lineHeight: 1 }}>
                        READY!
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>📅</span>
                </div>
              </div>

              {/* Bonus spin badge */}
              {userData.bonusSpinAvailable && (
                <div style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.35)",
                  borderRadius: 12, padding: "6px 16px", textAlign: "center" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#34d399", margin: 0 }}>
                    ✦ Newsletter bonus spin available!
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <p style={{ fontSize: 12, color: "#f87171", background: "rgba(220,38,38,0.12)",
                  border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "6px 14px" }}>
                  {error}
                </p>
              )}

              {/* Last result replay */}
              {lastWin && !spinning && !modal && (
                <button onClick={() => setModal(lastWin)}
                  style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10, padding: "6px 16px", cursor: "pointer" }}>
                  {lastWin.isSpinAgain ? "🎰 Spin Again" : `+${lastWin.points} pts`} — {lastWin.label}
                  <span style={{ display: "block", fontSize: 10, marginTop: 2, color: "rgba(255,255,255,0.25)" }}>
                    tap to view result
                  </span>
                </button>
              )}

              {/* How it works — collapsible */}
              <details style={{ width: Math.min(wheelSize, 480), maxWidth: "calc(100vw - 24px)" }}>
                <summary style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.28)",
                  letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer",
                  textAlign: "center" }}>
                  How it works ▾
                </summary>
                <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.7, padding: "0 4px" }}>
                  <p>• One free spin every 24 hours.</p>
                  <p>• Points count towards this month&apos;s leaderboard.</p>
                  <p>• Top 3 each month win prizes.</p>
                  <p>• Newsletter subscribers get a bonus spin.</p>
                  <p>• Leaderboard resets on the 1st of each month.</p>
                </div>
              </details>
            </div>

            {/* ── RIGHT: Leaderboard ── */}
            <div className="w-full sm:max-w-sm lg:w-72 flex-shrink-0">
              <MobileLeaderboard spinCount={spinCount} />
            </div>

          </div>
        </main>
      </div>
    </>
  );
}

// ─── Collapsible leaderboard wrapper ─────────────────────────────────────────
function MobileLeaderboard({ spinCount }: { spinCount: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: 20, overflow: "hidden",
      background: "rgba(4,12,28,0.80)", border: "1px solid rgba(255,255,255,0.1)",
      backdropFilter: "blur(16px)" }}>
      <button
        className="flex items-center justify-between w-full px-5 py-4 lg:cursor-default"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-sm font-bold uppercase tracking-widest" style={{ color: "#fbbf24" }}>
          🏆 Leaderboard
        </span>
        <span className="text-xs lg:hidden" style={{ color: "rgba(255,255,255,0.4)" }}>
          {open ? "▲ hide" : "▼ show"}
        </span>
      </button>
      <div className={`px-5 pb-5 lg:block ${open ? "block" : "hidden"}`}>
        <SpinLeaderboard key={spinCount} />
      </div>
    </div>
  );
}
