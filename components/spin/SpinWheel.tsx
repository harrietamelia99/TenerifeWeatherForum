"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SPIN_SEGMENTS } from "@/lib/spinSegments";

// ─── SVG geometry ─────────────────────────────────────────────────────────────
const CX = 250, CY = 250, R = 205;
const DEG_PER_SEG = 30;
const TEXT_R = 148;
const toRad = (d: number) => (d * Math.PI) / 180;

function segPath(i: number) {
  const s = toRad(i * DEG_PER_SEG - 90), e = toRad((i + 1) * DEG_PER_SEG - 90);
  return `M ${CX} ${CY} L ${(CX+R*Math.cos(s)).toFixed(3)} ${(CY+R*Math.sin(s)).toFixed(3)} A ${R} ${R} 0 0 1 ${(CX+R*Math.cos(e)).toFixed(3)} ${(CY+R*Math.sin(e)).toFixed(3)} Z`;
}

// ─── Marquee lights ───────────────────────────────────────────────────────────
const LIGHT_COUNT = 40, LIGHT_R = 222;
function MarqueeLights({ spinning, winner }: { spinning: boolean; winner: boolean }) {
  const ms = spinning ? 120 : winner ? 200 : 1600;
  return (
    <>
      <style>{`@keyframes lp{0%,100%{opacity:.25}50%{opacity:1}}`}</style>
      {Array.from({ length: LIGHT_COUNT }, (_, i) => {
        const a = toRad(i * (360 / LIGHT_COUNT) - 90);
        return (
          <circle key={i}
            cx={(CX + LIGHT_R * Math.cos(a)).toFixed(2)}
            cy={(CY + LIGHT_R * Math.sin(a)).toFixed(2)}
            r="5.5"
            fill={winner ? "#fde047" : spinning ? "#ffffff" : "#f59e0b"}
            style={{ animation: `lp ${ms}ms ease-in-out infinite`, animationDelay: `${(i * ms) / LIGHT_COUNT}ms` }}
          />
        );
      })}
    </>
  );
}

// ─── Win Modal ────────────────────────────────────────────────────────────────
interface WinModalProps {
  result: { label: string; points: number; isSpinAgain: boolean; color: string };
  onDismiss: () => void;
}

function WinModal({ result, onDismiss }: WinModalProps) {
  const isSpinAgain = result.isSpinAgain;

  // Sparkle positions — stable, not random, so no hydration issues
  const sparkles = [
    { x: "15%", y: "20%", size: 8,  delay: 0    },
    { x: "80%", y: "15%", size: 12, delay: 0.1  },
    { x: "10%", y: "65%", size: 6,  delay: 0.2  },
    { x: "88%", y: "60%", size: 10, delay: 0.15 },
    { x: "50%", y: "8%",  size: 7,  delay: 0.05 },
    { x: "25%", y: "85%", size: 9,  delay: 0.25 },
    { x: "72%", y: "82%", size: 11, delay: 0.3  },
    { x: "90%", y: "35%", size: 6,  delay: 0.18 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(2,15,30,0.85)", backdropFilter: "blur(6px)" }}
      onClick={onDismiss}
    >
      <style>{`
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.4) translateY(24px); }
          65%  { transform: scale(1.06) translateY(-6px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes floatUp {
          0%   { opacity: 0; transform: translateY(0) scale(0); }
          20%  { opacity: 1; transform: translateY(-12px) scale(1); }
          80%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-60px) scale(0.5); }
        }
        @keyframes shimmer {
          0%,100% { opacity: 0.6; }
          50%      { opacity: 1; }
        }
      `}</style>

      {/* Sparkle dots */}
      {!isSpinAgain && sparkles.map((s, i) => (
        <div key={i} className="absolute pointer-events-none rounded-full"
          style={{
            left: s.x, top: s.y,
            width: s.size, height: s.size,
            background: i % 2 === 0 ? "#fbbf24" : "#ffffff",
            animation: `floatUp 1.6s ease-out ${s.delay}s forwards`,
          }}
        />
      ))}

      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden text-center"
        style={{
          animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
          background: isSpinAgain
            ? "linear-gradient(160deg, #1a0505 0%, #3b0808 100%)"
            : `linear-gradient(160deg, #051525 0%, ${result.color}22 60%, #051525 100%)`,
          border: `2px solid ${isSpinAgain ? "rgba(239,68,68,0.5)" : "rgba(251,191,36,0.5)"}`,
          boxShadow: isSpinAgain
            ? "0 0 60px rgba(239,68,68,0.35), 0 20px 60px rgba(0,0,0,0.6)"
            : "0 0 60px rgba(251,191,36,0.3), 0 20px 60px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colour stripe at top */}
        <div className="h-2 w-full" style={{ background: isSpinAgain ? "#dc2626" : result.color }} />

        <div className="px-8 py-8">
          {/* Icon */}
          <div className="text-6xl mb-3 leading-none" style={{ animation: "shimmer 1.4s ease-in-out infinite" }}>
            {isSpinAgain ? "🎰" : result.points >= 150 ? "🌋" : result.points >= 75 ? "🌟" : result.points >= 30 ? "☀️" : "🎉"}
          </div>

          {isSpinAgain ? (
            <>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>Lucky!</p>
              <h2 className="text-4xl font-black text-red-400 mb-2">Spin Again!</h2>
              <p className="text-base" style={{ color: "rgba(255,255,255,0.6)" }}>
                You landed on <strong style={{ color: "white" }}>Spin Again</strong> — spin the wheel for free right now!
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>You won</p>
              <p className="text-lg font-bold mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>{result.label}</p>
              <h2
                className="text-7xl font-black tabular-nums mb-1"
                style={{ color: "#fbbf24", textShadow: "0 0 40px rgba(251,191,36,0.7), 0 0 80px rgba(251,191,36,0.3)" }}
              >
                +{result.points}
              </h2>
              <p className="text-lg font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>points</p>
            </>
          )}

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="mt-7 w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider transition-all duration-150 active:scale-95"
            style={{
              background: isSpinAgain
                ? "linear-gradient(135deg,#dc2626,#b91c1c)"
                : "linear-gradient(135deg,#f59e0b,#ea580c)",
              color: "#0c0a08",
              boxShadow: isSpinAgain
                ? "0 0 30px rgba(220,38,38,0.5)"
                : "0 0 30px rgba(245,158,11,0.5)",
            }}
          >
            {isSpinAgain ? "Spin Again Now! 🎰" : "Collect Points! ✦"}
          </button>

          <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.2)" }}>tap anywhere to close</p>
        </div>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface SpinWheelProps {
  canSpin: boolean;
  bonusAvailable: boolean;
  initialPoints: number;
  onSpinComplete: (newPoints: number, nextSpinAt: string | null, isSpinAgain: boolean) => void;
}

export default function SpinWheel({ canSpin, bonusAvailable, initialPoints, onSpinComplete }: SpinWheelProps) {
  const [spinning, setSpinning]       = useState(false);
  const [rotation, setRotation]       = useState(0);
  const [winnerIdx, setWinnerIdx]     = useState<number | null>(null);
  const [result, setResult]           = useState<{ label: string; points: number; isSpinAgain: boolean; color: string } | null>(null);
  const [showModal, setShowModal]     = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [localPoints, setLocalPoints] = useState(initialPoints);
  const wheelRef = useRef<SVGGElement>(null);

  useEffect(() => { setLocalPoints(initialPoints); }, [initialPoints]);

  const spin = useCallback(async () => {
    if (spinning || (!canSpin && !bonusAvailable)) return;
    setSpinning(true);
    setShowModal(false);
    setResult(null);
    setError(null);
    setWinnerIdx(null);

    try {
      const res = await fetch("/api/spin", { method: "POST" });
      const data = await res.json();

      if (!res.ok) { setError(data.error ?? "Spin failed."); setSpinning(false); return; }

      const segIdx: number = data.segmentIndex;
      const targetMod = ((345 - segIdx * DEG_PER_SEG) % 360 + 360) % 360;
      const curMod = rotation % 360;
      let delta = (targetMod - curMod + 360) % 360;
      if (delta < DEG_PER_SEG) delta += 360;
      setRotation(rotation + delta + 6 * 360);

      setTimeout(() => {
        const seg = SPIN_SEGMENTS[segIdx];
        setWinnerIdx(segIdx);
        setSpinning(false);
        const r = { label: data.segment.label, points: data.segment.points, isSpinAgain: data.segment.isSpinAgain, color: seg.color };
        setResult(r);
        setShowModal(true);
        setLocalPoints(data.newTotalPoints);
        onSpinComplete(data.newTotalPoints, data.nextSpinAt, data.segment.isSpinAgain);
      }, 6200);
    } catch {
      setError("Something went wrong. Please try again.");
      setSpinning(false);
    }
  }, [spinning, canSpin, bonusAvailable, rotation, onSpinComplete]);

  const canPress = (canSpin || bonusAvailable) && !spinning;

  return (
    <>
      {/* Win Modal */}
      {showModal && result && (
        <WinModal result={result} onDismiss={() => setShowModal(false)} />
      )}

      <div className="flex flex-col items-center gap-3 select-none">
        {/* Wheel */}
        <div className="relative" style={{ width: 360, height: 360 }}>
          <svg viewBox="0 0 500 500" width="360" height="360" style={{ overflow: "visible" }}>
            <circle cx={CX} cy={CY} r={R + 20} fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth="14" />
            <MarqueeLights spinning={spinning} winner={!!result && !result.isSpinAgain} />

            <g ref={wheelRef} style={{
              transformOrigin: `${CX}px ${CY}px`,
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 6s cubic-bezier(0.17,0.78,0.13,1)" : "none",
            }}>
              {SPIN_SEGMENTS.map((seg, i) => {
                const mid = i * DEG_PER_SEG + DEG_PER_SEG / 2 - 90;
                const textAngle = mid + 90;
                const words = seg.label.split(" ");
                const nameLine   = words[0];
                const pointsLine = seg.isSpinAgain ? words[1] : `+${seg.points}`;

                return (
                  <g key={i}>
                    <path d={segPath(i)} fill={seg.color} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    <g transform={`rotate(${textAngle}, ${CX}, ${CY})`}>
                      <text x={CX} y={CY - TEXT_R} textAnchor="middle" fontFamily="system-ui,sans-serif" fill={seg.textColor}>
                        <tspan x={CX} dy="-9"  fontSize="10" fontWeight="600" opacity="0.9">{nameLine}</tspan>
                        <tspan x={CX} dy="19"  fontSize="18" fontWeight="900">{pointsLine}</tspan>
                      </text>
                    </g>
                  </g>
                );
              })}

              {SPIN_SEGMENTS.map((_, i) => {
                const a = toRad(i * DEG_PER_SEG - 90);
                return <line key={i} x1={CX} y1={CY} x2={(CX+R*Math.cos(a)).toFixed(3)} y2={(CY+R*Math.sin(a)).toFixed(3)} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />;
              })}

              <circle cx={CX} cy={CY} r="38" fill="white" />
              <circle cx={CX} cy={CY} r="34" fill="#0c4a6e" />
              <text x={CX} y={CY+1} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="900" fontFamily="system-ui,sans-serif" fill="#f59e0b" letterSpacing="1">TWF</text>
            </g>

            <polygon points={`${CX},22 ${CX-14},46 ${CX+14},46`} fill="#fbbf24" stroke="white" strokeWidth="2" strokeLinejoin="round" />
            <circle cx={CX} cy={CY} r={R+1} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          </svg>

          {result && !result.isSpinAgain && winnerIdx !== null && (
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: SPIN_SEGMENTS[winnerIdx].color }} />
            </div>
          )}
        </div>

        {/* Points + Spin button — side by side */}
        <div className="flex items-center gap-5">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>Points</p>
            <p className="text-4xl font-black tabular-nums" style={{ color: "#fbbf24", textShadow: "0 0 24px rgba(251,191,36,0.5)" }}>
              {localPoints.toLocaleString()}
            </p>
          </div>
          <button
            onClick={spin}
            disabled={!canPress}
            className="px-10 py-4 rounded-full font-black text-xl uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            style={{
              background: canPress ? "linear-gradient(135deg,#f59e0b,#ea580c)" : "rgba(255,255,255,0.1)",
              color:      canPress ? "#0c0a08" : "rgba(255,255,255,0.4)",
              boxShadow:  canPress ? "0 0 40px rgba(245,158,11,0.55),0 4px 16px rgba(0,0,0,0.4)" : "none",
            }}
          >
            {spinning ? "Spinning…" : "SPIN!"}
          </button>
        </div>

        {/* Last result pill (small, below button) */}
        {result && !spinning && !showModal && (
          <button
            onClick={() => setShowModal(true)}
            className="text-sm font-semibold px-4 py-1.5 rounded-full transition-opacity hover:opacity-80"
            style={{
              background: "rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {result.isSpinAgain ? "🎰 Spin Again" : `+${result.points} pts — ${result.label}`} · tap to view
          </button>
        )}

        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-2">{error}</p>
        )}
      </div>
    </>
  );
}
