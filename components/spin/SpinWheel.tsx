"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SPIN_SEGMENTS } from "@/lib/spinSegments";

// ─── SVG geometry ─────────────────────────────────────────────────────────────
const CX = 250, CY = 250, R = 205;
const DEG_PER_SEG = 30; // 360 / 12
const toRad = (d: number) => (d * Math.PI) / 180;

function segPath(i: number) {
  const s = toRad(i * DEG_PER_SEG - 90), e = toRad((i + 1) * DEG_PER_SEG - 90);
  return `M ${CX} ${CY} L ${(CX + R * Math.cos(s)).toFixed(3)} ${(CY + R * Math.sin(s)).toFixed(3)} A ${R} ${R} 0 0 1 ${(CX + R * Math.cos(e)).toFixed(3)} ${(CY + R * Math.sin(e)).toFixed(3)} Z`;
}

// ─── Marquee lights ───────────────────────────────────────────────────────────
const LIGHT_COUNT = 40, LIGHT_R = 222;

function MarqueeLights({ spinning, winner }: { spinning: boolean; winner: boolean }) {
  const cycleMs = spinning ? 120 : winner ? 200 : 1600;
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
            style={{ animation: `lp ${cycleMs}ms ease-in-out infinite`, animationDelay: `${(i * cycleMs) / LIGHT_COUNT}ms` }}
          />
        );
      })}
    </>
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
  const [result, setResult]           = useState<{ label: string; points: number; isSpinAgain: boolean } | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [localPoints, setLocalPoints] = useState(initialPoints);
  const wheelRef = useRef<SVGGElement>(null);

  useEffect(() => { setLocalPoints(initialPoints); }, [initialPoints]);

  const spin = useCallback(async () => {
    if (spinning || (!canSpin && !bonusAvailable)) return;
    setSpinning(true);
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
      const newRot = rotation + delta + 6 * 360;
      setRotation(newRot);

      setTimeout(() => {
        setWinnerIdx(segIdx);
        setSpinning(false);
        setResult({ label: data.segment.label, points: data.segment.points, isSpinAgain: data.segment.isSpinAgain });
        setLocalPoints(data.newTotalPoints);
        onSpinComplete(data.newTotalPoints, data.nextSpinAt, data.segment.isSpinAgain);
      }, 6200);
    } catch {
      setError("Something went wrong. Please try again.");
      setSpinning(false);
    }
  }, [spinning, canSpin, bonusAvailable, rotation, onSpinComplete]);

  const canPress = (canSpin || bonusAvailable) && !spinning;
  const TEXT_R = 148;

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Wheel — displayed at 360 px from a 500×500 viewBox */}
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
              // First word of label on top, large points below
              const words = seg.label.split(" ");
              const nameLine   = words[0];
              const pointsLine = seg.isSpinAgain ? words[1] : `+${seg.points}`;

              return (
                <g key={i}>
                  <path d={segPath(i)} fill={seg.color} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                  <g transform={`rotate(${textAngle}, ${CX}, ${CY})`}>
                    <text x={CX} y={CY - TEXT_R} textAnchor="middle" fontFamily="system-ui, sans-serif" fill={seg.textColor}>
                      {/* Name — small */}
                      <tspan x={CX} dy="-9" fontSize="10" fontWeight="600" opacity="0.9">{nameLine}</tspan>
                      {/* Points — big */}
                      <tspan x={CX} dy="19" fontSize="18" fontWeight="900">{pointsLine}</tspan>
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Dividers */}
            {SPIN_SEGMENTS.map((_, i) => {
              const a = toRad(i * DEG_PER_SEG - 90);
              return <line key={i} x1={CX} y1={CY} x2={(CX + R * Math.cos(a)).toFixed(3)} y2={(CY + R * Math.sin(a)).toFixed(3)} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />;
            })}

            {/* Hub */}
            <circle cx={CX} cy={CY} r="38" fill="white" />
            <circle cx={CX} cy={CY} r="34" fill="#0c4a6e" />
            <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="900" fontFamily="system-ui,sans-serif" fill="#f59e0b" letterSpacing="1">TWF</text>
          </g>

          {/* Pointer */}
          <polygon points={`${CX},22 ${CX - 14},46 ${CX + 14},46`} fill="#fbbf24" stroke="white" strokeWidth="2" strokeLinejoin="round" />
          <circle cx={CX} cy={CY} r={R + 1} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
        </svg>

        {result && !result.isSpinAgain && winnerIdx !== null && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: SPIN_SEGMENTS[winnerIdx].color }} />
          </div>
        )}
      </div>

      {/* Points + Spin button — side by side to save vertical space */}
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

      {/* Result */}
      {result && !spinning && (
        <div className="px-6 py-3 rounded-2xl text-center" style={{
          background: result.isSpinAgain ? "rgba(220,38,38,0.2)" : "rgba(251,191,36,0.15)",
          border: `1px solid ${result.isSpinAgain ? "rgba(220,38,38,0.5)" : "rgba(251,191,36,0.4)"}`,
        }}>
          {result.isSpinAgain ? (
            <><p className="text-xl font-black text-red-400">🎰 Spin Again!</p><p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>Lucky you — spin for free!</p></>
          ) : (
            <><p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>{result.label}</p><p className="text-3xl font-black" style={{ color: "#fbbf24" }}>+{result.points} pts</p></>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-2">{error}</p>
      )}
    </div>
  );
}
