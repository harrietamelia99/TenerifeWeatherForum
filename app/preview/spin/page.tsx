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
function useWheelSize() {
  const [size, setSize] = useState(340);
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      if (vw >= 1024) {
        // Absolute-positioned side cards (260×2) don't affect wheel centering.
        const byWidth = Math.min(Math.floor(vw * 0.48), 520);
        const byHeight = Math.max(300, vh - 280);
        setSize(Math.min(byWidth, byHeight));
      } else {
        // Mobile stacked layout (no main pt-10/pb-4):
        //   topBar(48) + title(60) + bottomCard(~200) + leaderboardHeader(55) + gaps(25) ≈ 388
        // Add ~32px for PixiJS cssTopPad overhead → budget 360 total chrome.
        const byHeight = Math.max(180, vh - 380);
        const byWidth  = Math.min(vw - 32, 460); // 16px side padding, cap for tablets
        setSize(Math.min(byWidth, byHeight));
      }
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

// ─── Sparkle star helper ──────────────────────────────────────────────────────
function Sparkle({ size, style }: { size: number; style: React.CSSProperties }) {
  const glow = size * 0.35;
  return (
    <span
      className="sls-star"
      aria-hidden="true"
      style={{
        position: "absolute",
        fontSize: size,
        color: "#fde68a",
        filter: `drop-shadow(0 0 ${glow}px #fbbf24) drop-shadow(0 0 ${glow * 2}px rgba(251,191,36,0.45))`,
        lineHeight: 1,
        pointerEvents: "none",
        userSelect: "none",
        ...style,
      }}
    >
      ✦
    </span>
  );
}

// ─── "SUPER LUCKY SPIN" title ─────────────────────────────────────────────────
function SpinTitle() {
  // Measure actual rendered letter positions so the arch is pixel-perfect
  // regardless of variable glyph widths (I, space, etc.).
  const archSpanRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const applyArch = useCallback(() => {
    const spans = archSpanRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (spans.length === 0) return;

    // 1. Reset all transforms so letters sit at their natural flex positions
    spans.forEach(s => { s.style.transform = "none"; s.style.transformOrigin = ""; });

    // 2. Read actual centre-x of each letter (forces a layout flush)
    const rects = spans.map(s => s.getBoundingClientRect());
    const minX = rects[0].left;
    const maxX = rects[rects.length - 1].right;
    const centerX = (minX + maxX) / 2;

    // 3. Compute true circular-arc theta from measured x and apply
    const R = 380;
    spans.forEach((span, i) => {
      const x = (rects[i].left + rects[i].right) / 2 - centerX;
      const theta = x / R;
      const yDrop = R * (1 - Math.cos(theta));
      const deg   = theta * (180 / Math.PI);
      span.style.transform = `rotate(${deg.toFixed(2)}deg) translateY(${yDrop.toFixed(2)}px)`;
      span.style.transformOrigin = "center bottom";
    });
  }, []);

  // Run after every render and on resize
  useEffect(() => {
    applyArch();
    window.addEventListener("resize", applyArch);
    return () => window.removeEventListener("resize", applyArch);
  }, [applyArch]);

  return (
    <div className="text-center select-none" style={{ lineHeight: 1.0, marginBottom: -4 }}>
      <style>{`
        @keyframes spinBtnGlow {
          0%,100%{ box-shadow: 0 0 30px rgba(251,191,36,.55),0 4px 14px rgba(0,0,0,.4); }
          50%    { box-shadow: 0 0 70px rgba(251,191,36,1  ),0 0 130px rgba(251,191,36,.4),0 4px 20px rgba(0,0,0,.4); }
        }
        .spin-btn-ready{ animation: spinBtnGlow 0.9s ease-in-out infinite; }
        @keyframes spinBtnActive {
          0%,100%{ box-shadow: 0 0 24px rgba(99,102,241,.7),0 4px 14px rgba(0,0,0,.5); background-position: 0% 50%; }
          50%    { box-shadow: 0 0 50px rgba(139,92,246,.9),0 0 90px rgba(99,102,241,.35),0 4px 20px rgba(0,0,0,.5); background-position: 100% 50%; }
        }
        .spin-btn-spinning {
          animation: spinBtnActive 1.1s ease-in-out infinite;
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #6366f1) !important;
          background-size: 200% 200% !important;
          color: #ffffff !important;
          opacity: 1 !important;
        }
        .sls-star{ display:inline-block; }
        .sls-char{ display:inline-block; }
        .sls-lucky{ display:inline-block; }
      `}</style>

      {/* Inline-block wrapper so absolute stars position relative to the text block */}
      <div style={{ position: "relative", display: "inline-block", overflow: "visible" }}>

        {/* ── Scattered sparkle stars ── */}
        {/* Large stars flanking SUPER */}
        <Sparkle size={28} style={{ top: -4,  left: -14 }} />
        <Sparkle size={20} style={{ top:  2,  right: -12 }} />
        {/* Small accent stars above SUPER */}
        <Sparkle size={12} style={{ top:  6,  left: "22%" }} />
        <Sparkle size={11} style={{ top:  4,  right: "20%" }} />
        {/* Mid-height stars beside LUCKY SPIN */}
        <Sparkle size={22} style={{ bottom: 14, left: -20 }} />
        <Sparkle size={18} style={{ bottom: 18, right: -18 }} />
        {/* Tiny accent between the two rows */}
        <Sparkle size={10} style={{ top: "48%", left: "8%" }} />
        <Sparkle size={10} style={{ top: "44%", right: "8%" }} />

        {/* ── SUPER — chrome gradient ── */}
        <div style={{
          fontSize: "clamp(22px,3vw,36px)", fontWeight: 900,
          fontFamily: "system-ui,sans-serif", letterSpacing: "0.26em",
          background: "linear-gradient(180deg, #ffffff 0%, #d4eaff 45%, #8ab8e8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 2px 5px rgba(0,15,50,0.9)) drop-shadow(0 0 16px rgba(100,170,255,0.35))",
        }}>
          {"SUPER".split("").map((c, i) => (
            <span key={i} className="sls-char">{c}</span>
          ))}
        </div>

        {/* ── LUCKY SPIN — measurement-based arch ── */}
        {(() => {
          const chars = "LUCKY SPIN".split("");
          const goldGrad: React.CSSProperties = {
            display: "inline-block",
            background: "linear-gradient(180deg, #ffffff 0%, #ffe566 25%, #ffd700 50%, #f5a000 80%, #c97200 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          };
          return (
            <div style={{
              filter: [
                "drop-shadow(2px 2px 0 #b45309)",
                "drop-shadow(2px 2px 0 #92400e)",
                "drop-shadow(2px 2px 0 #78350f)",
                "drop-shadow(0 0 28px rgba(255,215,0,0.6))",
                "drop-shadow(0 0 56px rgba(251,191,36,0.25))",
              ].join(" "),
            }}>
              <div style={{
                fontSize: "clamp(38px,5vw,56px)", fontWeight: 900,
                fontFamily: "system-ui,sans-serif", letterSpacing: "0.06em",
                display: "flex", alignItems: "flex-end", justifyContent: "center",
              }}>
                {chars.map((c, i) => (
                  // No initial transform — applyArch() sets it after measuring
                  <span
                    key={i}
                    ref={el => { archSpanRefs.current[i] = el; }}
                    style={{ display: "inline-block" }}
                  >
                    <span
                      className="sls-lucky"
                      style={c === " " ? { display: "inline-block", width: "0.3em" } : goldGrad}
                    >
                      {c === " " ? "\u00A0" : c}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          );
        })()}
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

// ─── Top bar with burger menu on mobile ──────────────────────────────────────
function TopBar({ displayName }: { displayName: string }) {
  const [open, setOpen] = useState(false);

  const pillBase: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6,
    borderRadius: 999, fontWeight: 700, cursor: "pointer",
    backdropFilter: "blur(10px)", transition: "opacity 150ms",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
    color: "white", fontSize: 13, letterSpacing: "0.01em",
    padding: "7px 14px", touchAction: "manipulation",
  };

  return (
    <>
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: "8px 12px",
          background: "rgba(4,15,32,0.55)",
          backdropFilter: "blur(14px)",
          minHeight: 44,
          position: "relative", zIndex: 50,
        }}
      >
        {/* ← Return — compact on mobile, full text on desktop */}
        <a href="/" style={pillBase}>
          <span style={{ fontSize: 15, lineHeight: 1 }}>←</span>
          <span className="hidden sm:inline">Return to site</span>
        </a>

        {/* Desktop: username + sign out */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{displayName}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/preview/spin/login" })}
            style={{ ...pillBase, background: "rgba(255,255,255,0.07)" }}>
            Sign out
          </button>
        </div>

        {/* Mobile: hamburger pill — wrapper div carries sm:hidden so inline display doesn't override */}
        <div className="sm:hidden">
        <button
          style={{ ...pillBase, padding: "7px 12px", flexDirection: "column", gap: 4 }}
          onClick={() => setOpen(o => !o)}
          aria-label="Menu"
        >
          <span style={{
            display: "block", width: 18, height: 2, borderRadius: 2, background: "white",
            transition: "transform 220ms, opacity 220ms",
            transform: open ? "translateY(6px) rotate(45deg)" : "none",
          }} />
          <span style={{
            display: "block", width: 18, height: 2, borderRadius: 2, background: "white",
            transition: "opacity 220ms", opacity: open ? 0 : 1,
          }} />
          <span style={{
            display: "block", width: 18, height: 2, borderRadius: 2, background: "white",
            transition: "transform 220ms, opacity 220ms",
            transform: open ? "translateY(-6px) rotate(-45deg)" : "none",
          }} />
        </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className="sm:hidden flex-shrink-0 overflow-hidden"
        style={{
          maxHeight: open ? 110 : 0,
          opacity: open ? 1 : 0,
          transition: "max-height 220ms ease, opacity 180ms ease",
          background: "rgba(4,15,32,0.97)",
          backdropFilter: "blur(14px)",
          borderBottom: open ? "1px solid rgba(255,255,255,0.07)" : "none",
          position: "relative", zIndex: 49,
        }}
      >
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            Signed in as <strong style={{ color: "#fbbf24" }}>{displayName}</strong>
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/preview/spin/login" })}
            style={{ ...pillBase, background: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.3)", color: "#fca5a5" }}>
            Sign out
          </button>
        </div>
      </div>
    </>
  );
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
    tl.from(".sls-lucky", {
      y: 65, opacity: 0, scale: 0.15,
      stagger: 0.033, duration: 0.62,
      ease: "elastic.out(1.3, 0.5)",
    }, "-=0.15");

    // Subtle whole-word shimmer (gradient is on parent, so animate opacity per letter)
    gsap.to(".sls-lucky", {
      opacity: 0.82,
      duration: 0.28,
      stagger: { each: 0.06, repeat: -1, yoyo: true, from: 0 },
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
      gsap.set(".sls-lucky", { clearProps: "opacity" });
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

      {/* Full-screen flex column */}
      <div className="relative flex flex-col" style={{ zIndex: 1, height: "100dvh", overflow: "hidden" }}>
        {modal && <WinModal result={modal} onDismiss={() => setModal(null)} />}

        {/* Top bar */}
        <TopBar displayName={displayName} />

        {/* Main — desktop has top padding; mobile fills edge-to-edge */}
        <main className="flex-1 flex flex-col items-center justify-start lg:pt-10 lg:pb-4">

          {/* ── Desktop layout ── */}
          {/*
            Cards are absolutely positioned in top-left / top-right corners
            so they are completely removed from the layout flow.
            The wheel + title flex column centres itself in 100% width
            with no card interference — guaranteed dead centre.
          */}
          <div className="hidden lg:block" style={{ width: "100%", position: "relative" }}>

            {/* ── Left corner: spin-controls card ── */}
            <div style={{ position: "absolute", top: 0, left: 20, width: 260, zIndex: 2 }}>
              <div style={{
                borderRadius: 20,
                background: "linear-gradient(160deg, rgba(12,28,56,0.95) 0%, rgba(4,12,28,0.92) 60%, rgba(8,20,42,0.95) 100%)",
                border: "1px solid rgba(251,191,36,0.22)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
                textAlign: "center",
              }}>
                {/* Header */}
                <div style={{ padding: "18px 22px 14px", textAlign: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2.5px",
                    color: "#fbbf24", textTransform: "uppercase" }}>
                    ⭐ Monthly Points
                  </span>
                </div>

                <div style={{ padding: "0 22px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Points */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 52, fontWeight: 900, color: "#fbbf24", lineHeight: 1,
                      fontFamily: "system-ui,sans-serif", textShadow: "0 0 28px rgba(251,191,36,0.55)" }}>
                      {userData.monthlyPoints.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)",
                      letterSpacing: "2.5px", marginTop: 6, fontFamily: "system-ui,sans-serif" }}>
                      MONTHLY POINTS
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

                  {/* SPIN button */}
                  <div style={{ textAlign: "center" }}>
                    <button
                      ref={btnRef}
                      onClick={handleSpinClick}
                      disabled={!canPress}
                      className={spinning ? "spin-btn-spinning" : ""}
                      style={{
                        width: "100%", padding: "16px 8px", borderRadius: "50px",
                        fontWeight: 900, fontSize: 30, letterSpacing: "0.14em",
                        fontFamily: "system-ui,sans-serif",
                        cursor: canPress ? "pointer" : "not-allowed",
                        background: canPress ? "linear-gradient(135deg,#fbbf24,#f97316)" : "rgba(255,255,255,0.07)",
                        color: canPress ? "#0c0a00" : "rgba(255,255,255,0.22)",
                        border: "none",
                        opacity: !canPress && !spinning ? 0.65 : 1,
                        boxShadow: canPress ? "0 4px 24px rgba(251,191,36,0.35)" : "none",
                      }}
                    >
                      {spinning ? "⏳ SPINNING…" : "SPIN"}
                    </button>
                    <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.22)",
                      letterSpacing: "1.5px", marginTop: 8, fontFamily: "system-ui,sans-serif" }}>
                      1 FREE SPIN EVERY 24 HOURS
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

                  {/* Countdown */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)",
                      letterSpacing: "2.5px", marginBottom: 8, fontFamily: "system-ui,sans-serif" }}>
                      📅 NEXT SPIN IN
                    </div>
                    {showCountdown ? (
                      <div style={{ fontSize: 32, fontWeight: 900, color: "#fbbf24",
                        fontFamily: "system-ui,sans-serif", letterSpacing: "0.05em",
                        textShadow: "0 0 16px rgba(251,191,36,0.4)", lineHeight: 1 }}>
                        {countdownDisplay}
                      </div>
                    ) : (
                      <div style={{ fontSize: 30, fontWeight: 900, color: "#34d399",
                        fontFamily: "system-ui,sans-serif", lineHeight: 1,
                        textShadow: "0 0 14px rgba(52,211,153,0.5)" }}>
                        READY!
                      </div>
                    )}
                  </div>

                  {userData.bonusSpinAvailable && (
                    <>
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#34d399", margin: 0 }}>
                          ✦ Bonus spin available!
                        </p>
                      </div>
                    </>
                  )}

                  {error && (
                    <p style={{ fontSize: 11, color: "#f87171", background: "rgba(220,38,38,0.12)",
                      border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10,
                      padding: "8px 12px", margin: 0, textAlign: "center" }}>
                      {error}
                    </p>
                  )}

                  {lastWin && !spinning && !modal && (
                    <button onClick={() => setModal(lastWin)}
                      style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)",
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 10, padding: "8px 14px", cursor: "pointer", width: "100%" }}>
                      {lastWin.isSpinAgain ? "🎰 Spin Again" : `+${lastWin.points} pts`} — {lastWin.label}
                      <span style={{ display: "block", fontSize: 10, marginTop: 2, color: "rgba(255,255,255,0.25)" }}>
                        tap to view
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Centre: title + wheel — fills full width, centres itself ── */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
              <div style={{ marginBottom: 20 }}>
                <SpinTitle />
              </div>
              <PixiWheel
                rotation={rotation}
                spinning={spinning}
                winnerIdx={winnerIdx}
                size={wheelSize}
              />
            </div>

            {/* ── Right corner: Leaderboard ── */}
            <div style={{ position: "absolute", top: 0, right: 20, width: 260, zIndex: 2 }}>
              <MobileLeaderboard spinCount={spinCount} />
            </div>

          </div>{/* end desktop block */}

          {/* ── Mobile / tablet: full-screen app layout ── */}
          <div className="flex lg:hidden flex-col flex-1 min-h-0 w-full">

            {/* Title */}
            <div className="flex justify-center flex-shrink-0 pt-3">
              <SpinTitle />
            </div>

            {/* Wheel — grows to fill available space */}
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <PixiWheel rotation={rotation} spinning={spinning} winnerIdx={winnerIdx} size={wheelSize} />
            </div>

            {/* ── Mobile bottom card ── */}
            <div className="flex-shrink-0 px-3 pb-1" style={{ display: "flex", flexDirection: "column", gap: 8 }}>

              {/* Main action card */}
              <div style={{
                background: "rgba(4,12,28,0.92)", border: "1px solid rgba(251,191,36,0.28)",
                borderRadius: 20, backdropFilter: "blur(20px)",
                padding: "12px 16px", boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
              }}>
                {/* Top row: points left, countdown right */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  {/* Points */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>⭐</span>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: "#fbbf24", lineHeight: 1,
                        fontFamily: "system-ui,sans-serif", textShadow: "0 0 14px rgba(251,191,36,0.5)" }}>
                        {userData.monthlyPoints.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)",
                        letterSpacing: "2px", fontFamily: "system-ui,sans-serif" }}>MONTHLY PTS</div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.1)", margin: "0 8px" }} />

                  {/* Countdown */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)",
                      letterSpacing: "2px", marginBottom: 3, fontFamily: "system-ui,sans-serif" }}>
                      📅 NEXT SPIN IN
                    </div>
                    {showCountdown ? (
                      <div style={{ fontSize: 20, fontWeight: 900, color: "#fbbf24",
                        fontFamily: "system-ui,sans-serif", letterSpacing: "0.04em", lineHeight: 1,
                        textShadow: "0 0 12px rgba(251,191,36,0.4)" }}>
                        {countdownDisplay}
                      </div>
                    ) : (
                      <div style={{ fontSize: 20, fontWeight: 900, color: "#34d399",
                        fontFamily: "system-ui,sans-serif", lineHeight: 1 }}>
                        READY!
                      </div>
                    )}
                  </div>
                </div>

                {/* SPIN button */}
                <button
                  ref={btnRef}
                  onClick={handleSpinClick}
                  disabled={!canPress}
                  className={spinning ? "spin-btn-spinning" : ""}
                  style={{
                    width: "100%", padding: "13px 8px", borderRadius: 50,
                    fontWeight: 900, fontSize: 24, letterSpacing: "0.14em",
                    fontFamily: "system-ui,sans-serif",
                    cursor: canPress ? "pointer" : "not-allowed",
                    background: canPress ? "linear-gradient(135deg,#fbbf24,#f97316)" : "rgba(255,255,255,0.07)",
                    color: canPress ? "#0c0a00" : "rgba(255,255,255,0.22)",
                    border: "none", opacity: !canPress && !spinning ? 0.65 : 1,
                    boxShadow: canPress ? "0 4px 24px rgba(251,191,36,0.4)" : "none",
                  }}>
                  {spinning ? "⏳ SPINNING…" : "SPIN"}
                </button>
                <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.22)",
                  letterSpacing: "1.5px", marginTop: 5, textAlign: "center", fontFamily: "system-ui,sans-serif" }}>
                  1 FREE SPIN EVERY 24 HOURS
                </div>

                {/* Bonus / error */}
                {userData.bonusSpinAvailable && (
                  <div style={{ marginTop: 8, textAlign: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#34d399" }}>✦ Bonus spin available!</span>
                  </div>
                )}
                {error && (
                  <p style={{ fontSize: 11, color: "#f87171", background: "rgba(220,38,38,0.12)",
                    border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10,
                    padding: "6px 12px", margin: "8px 0 0", textAlign: "center" }}>
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* Leaderboard toggle strip — bottom sheet opens above everything */}
            <div className="flex-shrink-0 px-3 pb-2">
              <BottomSheetLeaderboard spinCount={spinCount} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

// ─── Desktop leaderboard card (always fully open) ────────────────────────────
function MobileLeaderboard({ spinCount }: { spinCount: number }) {
  return (
    <div style={{
      borderRadius: 20,
      background: "linear-gradient(160deg, rgba(12,28,56,0.95) 0%, rgba(4,12,28,0.92) 60%, rgba(8,20,42,0.95) 100%)",
      border: "1px solid rgba(255,255,255,0.10)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
      textAlign: "center",
    }}>
      <div style={{ padding: "16px 20px 8px" }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2.5px",
          color: "#fbbf24", textTransform: "uppercase" }}>
          🏆 Leaderboard
        </span>
      </div>
      <div style={{ padding: "0 20px 16px" }}>
        <SpinLeaderboard key={spinCount} />
      </div>
    </div>
  );
}

// ─── Mobile bottom-sheet leaderboard ─────────────────────────────────────────
// Uses position:fixed so it escapes the page's overflow:hidden container
// and can scroll freely on iOS Safari.
function BottomSheetLeaderboard({ spinCount }: { spinCount: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Toggle pill */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderRadius: 20, touchAction: "manipulation",
          background: "rgba(4,12,28,0.88)", border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(18px)", cursor: "pointer",
        }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2.5px",
          color: "#fbbf24", textTransform: "uppercase" }}>
          🏆 Leaderboard
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          {open ? "▲ hide" : "▼ show"}
        </span>
      </button>

      {/* Dim backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 998,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Bottom sheet — fixed, scrollable, bypasses all overflow:hidden */}
      <div
        style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 999,
          background: "rgba(4,10,28,0.98)",
          borderTop: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "22px 22px 0 0",
          maxHeight: "65vh",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 280ms cubic-bezier(0.32,0.72,0,1)",
          willChange: "transform",
        } as React.CSSProperties}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />
        </div>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 20px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          position: "sticky", top: 0,
          background: "rgba(4,10,28,0.98)",
        }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "2.5px",
            color: "#fbbf24", textTransform: "uppercase" }}>
            🏆 Leaderboard
          </span>
          <button
            onClick={() => setOpen(false)}
            style={{ fontSize: 20, lineHeight: 1, color: "rgba(255,255,255,0.35)",
              background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}>
            ✕
          </button>
        </div>
        {/* Content */}
        <div style={{ padding: "4px 20px 40px" }}>
          <SpinLeaderboard key={spinCount} />
        </div>
      </div>
    </>
  );
}
