"use client";

import dynamic from "next/dynamic";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import WinModal, { type WinResult } from "@/components/spin/WinModal";
import SpinLeaderboard from "@/components/spin/SpinLeaderboard";
import gsap from "gsap";

// PixiJS wheel — client-only (WebGL requires browser)
const PixiWheel = dynamic(() => import("@/components/spin/PixiWheel"), { ssr: false });

// ─── Responsive wheel size ─────────────────────────────────────────────────────
// Chrome above/below the wheel in the left column (no site navbar — it's hidden):
// mini-bar(42) + title(130) + pill(76) + gaps(60) ≈ 308
const CHROME_HEIGHT = 308;

function useWheelSize() {
  const [size, setSize] = useState(420);
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const byHeight = Math.max(260, vh - CHROME_HEIGHT);
      let byWidth: number;
      if (vw < 480)       byWidth = vw - 20;
      else if (vw < 768)  byWidth = 420;
      else if (vw < 1200) byWidth = 460;
      else                byWidth = 520;
      setSize(Math.min(byWidth, byHeight));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(nextSpinAt: string | null, onExpired: () => void) {
  const calcMs = useCallback(
    () => nextSpinAt ? Math.max(0, new Date(nextSpinAt).getTime() - Date.now()) : 0,
    [nextSpinAt],
  );
  const [ms, setMs]      = useState(calcMs);
  const firedRef         = useRef(false);
  const cbRef            = useRef(onExpired);
  cbRef.current          = onExpired;

  useEffect(() => {
    firedRef.current = false;
    setMs(calcMs());
    if (!nextSpinAt) return;
    const id = setInterval(() => {
      const rem = calcMs();
      setMs(rem);
      if (rem === 0 && !firedRef.current) {
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
  return {
    ms,
    display: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
  };
}

// ─── Spin ratchet sound (Web Audio — triggered on click, fine with autoplay) ──
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
      const totalDuration = 6.2, ticks = 52;
      for (let i = 0; i < ticks; i++) {
        const t     = totalDuration * Math.pow(i / ticks, 2);
        const osc   = ctx.createOscillator();
        const gain  = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 600 - (i / ticks) * 400;
        osc.type = "square";
        const st = ctx.currentTime + t;
        gain.gain.setValueAtTime(0, st);
        gain.gain.linearRampToValueAtTime(0.10, st + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.06);
        osc.start(st); osc.stop(st + 0.08);
      }
    } catch { /* AudioContext unavailable */ }
  }, []);
}

// ─── Win jingle (Howler + programmatically generated WAV) ─────────────────────
function genWinSoundURL(): string {
  const sr    = 22050;
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  const nd    = 0.14;
  const total = notes.length * nd + 0.3;
  const n     = Math.floor(sr * total);
  const buf   = new ArrayBuffer(44 + n * 2);
  const v     = new DataView(buf);
  const ws = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  ws(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); ws(8, "WAVE");
  ws(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, 1, true); v.setUint32(24, sr, true);
  v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  ws(36, "data"); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    let s   = 0;
    notes.forEach((freq, ni) => {
      const ns = ni * nd, ne = ns + nd;
      if (t >= ns && t < ne) {
        const tn  = t - ns;
        const env = Math.exp(-tn * 7) * Math.sin(Math.PI * tn / nd);
        s += env * 0.38 * Math.sin(2 * Math.PI * freq * t);
        s += env * 0.12 * Math.sin(2 * Math.PI * freq * 2 * t);
      }
    });
    v.setInt16(44 + i * 2, Math.floor(Math.max(-1, Math.min(1, s)) * 32767), true);
  }
  return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
}

function useWinSound() {
  const howlRef = useRef<any>(null);
  return useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      if (!howlRef.current) {
        const { Howl } = await import("howler");
        howlRef.current = new Howl({ src: [genWinSoundURL()], format: ["wav"], volume: 0.55 });
      }
      howlRef.current.play();
    } catch { /* ignore audio errors */ }
  }, []);
}

// ─── Tropical background ──────────────────────────────────────────────────────
function TropicalBackground() {
  return (
    <div className="fixed inset-0" aria-hidden="true" style={{ zIndex: 0 }}>
      <div style={{
        position:              "absolute", inset: 0,
        backgroundImage:       "url(/spin-bg.jpg)",
        backgroundSize:        "cover",
        backgroundPosition:    "center top",
      }} />
      <div className="absolute inset-0" style={{ background: "rgba(0,10,28,0.45)" }} />
    </div>
  );
}

// ─── "SUPER LUCKY SPIN" title ─────────────────────────────────────────────────
// Each character is wrapped in its own inline-block span so GSAP can animate
// them individually.
function SpinTitle() {
  return (
    <div className="text-center select-none" style={{ lineHeight: 1.0, marginBottom: -4 }}>
      <style>{`
        /* Glow pulse on the SPIN button (box-shadow only — scale handled by GSAP) */
        @keyframes spinBtnGlow {
          0%,100%{ box-shadow: 0 0 30px rgba(251,191,36,.55),0 4px 14px rgba(0,0,0,.4); }
          50%    { box-shadow: 0 0 70px rgba(251,191,36,1  ),0 0 130px rgba(251,191,36,.4),0 4px 20px rgba(0,0,0,.4); }
        }
        .spin-btn-ready{ animation: spinBtnGlow 0.9s ease-in-out infinite; }
        .sls-star{ display:inline-block; }
        .sls-char{ display:inline-block; }
        .sls-lucky{ display:inline-block; }
      `}</style>

      {/* SUPER */}
      <div style={{
        fontSize: "clamp(22px,4.5vw,50px)", fontWeight: 900, color: "white",
        fontFamily: "system-ui,sans-serif", letterSpacing: "0.18em",
        textShadow: [
          "2px 0 0 #0c1f3a", "-2px 0 0 #0c1f3a",
          "0 2px 0 #0c1f3a", "0 -2px 0 #0c1f3a",
          "2px 2px 0 #0c1f3a", "-2px -2px 0 #0c1f3a",
          "2px -2px 0 #0c1f3a", "-2px 2px 0 #0c1f3a",
          "3px 3px 0 #0c1f3a",
          "0 0 18px rgba(255,255,255,0.25)",
        ].join(","),
      }}>
        {"SUPER".split("").map((c, i) => (
          <span key={i} className="sls-char">{c}</span>
        ))}
      </div>

      {/* Location pin */}
      <div className="sls-pin" style={{ fontSize: "clamp(18px,3vw,28px)", margin: "-2px 0", display: "block" }}>
        📍
      </div>

      {/* LUCKY SPIN */}
      <div style={{
        fontSize: "clamp(32px,7vw,76px)", fontWeight: 900, color: "#fbbf24",
        fontFamily: "system-ui,sans-serif", letterSpacing: "0.06em",
        textShadow: [
          "2px 2px 0 #b45309","4px 4px 0 #92400e","6px 6px 0 #78350f",
          "0 0 40px rgba(251,191,36,0.65)","0 0 80px rgba(251,191,36,0.25)",
        ].join(","),
      }}>
        <span className="sls-star" style={{ color: "#fde68a", fontSize: "0.5em" }}>✦</span>
        {" "}
        {"LUCKY SPIN".split("").map((c, i) => (
          <span key={i} className="sls-lucky" style={c === " " ? { display: "inline-block", width: "0.3em" } : {}}>
            {c === " " ? "\u00A0" : c}
          </span>
        ))}
        {" "}
        <span className="sls-star" style={{ color: "#fde68a", fontSize: "0.5em" }}>✦</span>
        <span className="sls-star" style={{ color: "#fde68a", fontSize: "0.4em", marginLeft: 2 }}>✦</span>
      </div>
    </div>
  );
}

// ─── User data shape ──────────────────────────────────────────────────────────
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
  const playRatchet = useSpinSound();
  const playWin     = useWinSound();

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
  const btnRef = useRef<HTMLButtonElement>(null);

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

  // ── GSAP title entrance (runs once, after mount) ────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.25 });
    tl.from(".sls-char", {
      y: -55, opacity: 0, scale: 0.3,
      stagger: 0.07, duration: 0.55,
      ease: "back.out(2.5)",
    });
    tl.from(".sls-pin", {
      scale: 0, opacity: 0, rotation: -30,
      duration: 0.4, ease: "back.out(3)",
    }, "-=0.05");
    tl.from(".sls-lucky", {
      y: 65, opacity: 0, scale: 0.15,
      stagger: 0.033, duration: 0.62,
      ease: "elastic.out(1.3, 0.5)",
    }, "-=0.15");

    // Continuous golden shimmer across LUCKY SPIN
    gsap.to(".sls-lucky", {
      color: "#fff5c0",
      duration: 0.26,
      stagger: { each: 0.055, repeat: -1, yoyo: true, from: 0 },
      ease: "none",
      delay: 1.9,
    });
    // Twinkle stars
    gsap.to(".sls-star", {
      scale: 1.45, opacity: 0.3,
      duration: 0.9, stagger: 0.3,
      repeat: -1, yoyo: true, ease: "power2.inOut",
      delay: 1.1,
    });

    return () => {
      tl.kill();
      gsap.killTweensOf(".sls-lucky");
      gsap.killTweensOf(".sls-star");
    };
  }, []);

  // ── GSAP: toggle glow class on button when canPress changes ────────────────
  const canPress = (userData?.canSpin || userData?.bonusSpinAvailable) && !spinning;
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    if (canPress) btn.classList.add("spin-btn-ready");
    else          btn.classList.remove("spin-btn-ready");
  }, [canPress]);

  // ── Spin logic ─────────────────────────────────────────────────────────────
  const spin = useCallback(async () => {
    if (!userData || spinning) return;
    if (!userData.canSpin && !userData.bonusSpinAvailable) return;

    playRatchet(); // triggers on user action → browser allows audio
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
        if (!data.segment.isSpinAgain) playWin(); // Howler win jingle
        setModal(result);
        setLastWin(result);
        setSpinCount(c => c + 1);
        await fetchUserData();
      }, 6200);
    } catch {
      setError("Something went wrong. Please try again.");
      setSpinning(false);
    }
  }, [spinning, userData, fetchUserData, playRatchet, playWin]);

  // Button click: GSAP squish animation then trigger spin
  const handleSpinClick = useCallback(() => {
    if (!canPress) return;
    const btn = btnRef.current;
    if (btn) {
      btn.classList.remove("spin-btn-ready");
      gsap.killTweensOf(btn);
      gsap.to(btn, {
        scale: 0.87,
        duration: 0.09,
        ease: "power3.in",
        onComplete: () => gsap.to(btn, { scale: 1, duration: 0.22, ease: "back.out(2.5)" }),
      });
    }
    spin();
  }, [canPress, spin]);

  // ── Loading state ───────────────────────────────────────────────────────────
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

  const displayName   = userData.displayName ?? session.user?.email?.split("@")[0] ?? "Player";
  const showCountdown = !userData.canSpin && !userData.bonusSpinAvailable && countdownMs > 0;

  return (
    <>
      <TropicalBackground />

      {/* No pt-[100px] — site navbar/ticker are hidden while on spin routes */}
      <div className="relative min-h-screen" style={{ zIndex: 1 }}>
        {modal && <WinModal result={modal} onDismiss={() => setModal(null)} />}

        {/* Minimal top bar — sign out only */}
        <div className="flex items-center justify-end px-5 py-2"
          style={{ background: "rgba(4,15,32,0.55)", backdropFilter: "blur(12px)", minHeight: 42 }}>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              {displayName}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/preview/spin/login" })}
              className="px-3 py-1 rounded-lg text-xs font-semibold"
              style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
              Sign out
            </button>
          </div>
        </div>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-8">

          {/* Title — full width, centred above the two-column layout */}
          <div className="flex justify-center mb-6">
            <SpinTitle />
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 justify-center">

            {/* ── Left column: Wheel + Pill ── */}
            <div className="flex flex-col items-center gap-4">

              {/* PixiJS GPU wheel */}
              <PixiWheel
                rotation={rotation}
                spinning={spinning}
                winnerIdx={winnerIdx}
                size={wheelSize}
              />

              {/* ── Bottom pill bar ── */}
              <div style={{
                background:     "rgba(4,12,28,0.92)",
                border:         "2px solid rgba(251,191,36,0.28)",
                borderRadius:   "60px",
                backdropFilter: "blur(16px)",
                boxShadow:      "0 8px 40px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.06)",
                display:        "flex",
                alignItems:     "center",
                gap:            "10px",
                padding:        "10px 16px",
                width:          Math.min(wheelSize, 480),
                maxWidth:       "calc(100vw - 24px)",
              }}>
                {/* Left: monthly points */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
                  <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>⭐</span>
                  <div>
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

                {/* Centre: SPIN button */}
                <div style={{ flex: 1, textAlign: "center" }}>
                  <button
                    ref={btnRef}
                    onClick={handleSpinClick}
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
                      background:    canPress
                        ? "linear-gradient(135deg,#fbbf24,#f97316)"
                        : "rgba(255,255,255,0.08)",
                      color:         canPress ? "#0c0a00" : "rgba(255,255,255,0.3)",
                      border:        "none",
                      opacity:       !canPress && !spinning ? 0.6 : 1,
                      // No transform/boxShadow here — GSAP + CSS class manage those
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

              {/* How it works */}
              <details style={{ width: Math.min(wheelSize, 480), maxWidth: "calc(100vw - 24px)" }}>
                <summary style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.28)",
                  letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", textAlign: "center" }}>
                  How it works ▾
                </summary>
                <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, padding: "0 4px" }}>
                  <p>• One free spin every 24 hours.</p>
                  <p>• Points count towards this month&apos;s leaderboard.</p>
                  <p>• Top 3 each month win prizes.</p>
                  <p>• Newsletter subscribers get a bonus spin.</p>
                  <p>• Leaderboard resets on the 1st of each month.</p>
                </div>
              </details>
            </div>

            {/* ── Right: Leaderboard ── */}
            <div className="w-full sm:max-w-sm lg:w-80 flex-shrink-0">
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
        onClick={() => setOpen(o => !o)}>
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
