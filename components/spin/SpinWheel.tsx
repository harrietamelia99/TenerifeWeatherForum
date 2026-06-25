"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SPIN_SEGMENTS } from "@/lib/spinSegments";

// ─── SVG geometry constants ───────────────────────────────────────────────────
const CX = 250;
const CY = 250;
const R  = 205; // outer wheel radius
const SEGMENT_COUNT = 12;
const DEG_PER_SEG   = 360 / SEGMENT_COUNT;

function toRad(deg: number) { return (deg * Math.PI) / 180; }

function segPath(index: number): string {
  const start = index * DEG_PER_SEG - 90;
  const end   = (index + 1) * DEG_PER_SEG - 90;
  const x1 = CX + R * Math.cos(toRad(start));
  const y1 = CY + R * Math.sin(toRad(start));
  const x2 = CX + R * Math.cos(toRad(end));
  const y2 = CY + R * Math.sin(toRad(end));
  return `M ${CX} ${CY} L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${R} ${R} 0 0 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;
}

// ─── Marquee lights ───────────────────────────────────────────────────────────
const LIGHT_COUNT   = 40;
const LIGHT_R       = 222; // orbit radius (just outside wheel rim)
const LIGHT_RADIUS  = 5.5; // dot size

interface MarqueeLightsProps { spinning: boolean; winner: boolean }

function MarqueeLights({ spinning, winner }: MarqueeLightsProps) {
  const lights = Array.from({ length: LIGHT_COUNT }, (_, i) => {
    const angle = toRad(i * (360 / LIGHT_COUNT) - 90);
    return { x: CX + LIGHT_R * Math.cos(angle), y: CY + LIGHT_R * Math.sin(angle), i };
  });

  const cycleMs = spinning ? 120 : winner ? 200 : 1600;

  return (
    <>
      <style>{`
        @keyframes lightPulse {
          0%,100% { opacity: 0.25; }
          50%      { opacity: 1; }
        }
      `}</style>
      {lights.map(({ x, y, i }) => (
        <circle
          key={i}
          cx={x.toFixed(2)}
          cy={y.toFixed(2)}
          r={LIGHT_RADIUS}
          fill={winner ? "#fde047" : spinning ? "#ffffff" : "#f59e0b"}
          style={{
            animation: `lightPulse ${cycleMs}ms ease-in-out infinite`,
            animationDelay: `${(i * cycleMs) / LIGHT_COUNT}ms`,
          }}
        />
      ))}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface SpinWheelProps {
  canSpin: boolean;
  bonusAvailable: boolean;
  initialPoints: number;
  onSpinComplete: (newPoints: number, nextSpinAt: string | null, isSpinAgain: boolean) => void;
}

export default function SpinWheel({
  canSpin,
  bonusAvailable,
  initialPoints,
  onSpinComplete,
}: SpinWheelProps) {
  const [spinning, setSpinning]       = useState(false);
  const [rotation, setRotation]       = useState(0);
  const [winnerIdx, setWinnerIdx]     = useState<number | null>(null);
  const [result, setResult]           = useState<{ label: string; points: number; isSpinAgain: boolean } | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [localPoints, setLocalPoints] = useState(initialPoints);
  const wheelRef = useRef<SVGGElement>(null);

  // Keep localPoints in sync if prop changes (fresh load)
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

      if (!res.ok) {
        setError(data.error ?? "Spin failed.");
        setSpinning(false);
        return;
      }

      const segIdx: number = data.segmentIndex;

      // Calculate rotation so winning segment lands under pointer (top)
      // Pointer is at top; segment i's centre is at (i * 30 + 15 - 90)° when rotation = 0
      // We need: (rotation + segCentre) ≡ 270° (pointing up = -90° = 270°)
      // i.e. rotation ≡ 270 - (segIdx * 30 + 15 - 90) = 345 - segIdx * 30  (mod 360)
      const targetMod = ((345 - segIdx * DEG_PER_SEG) % 360 + 360) % 360;
      const curMod    = rotation % 360;
      let   delta     = (targetMod - curMod + 360) % 360;
      if (delta < DEG_PER_SEG) delta += 360; // guarantee a visible spin
      const newRotation = rotation + delta + 6 * 360; // 6 full extra turns

      setRotation(newRotation);

      // Wait for CSS transition (6 s) then show result
      setTimeout(() => {
        setWinnerIdx(segIdx);
        setSpinning(false);
        setResult({
          label:       data.segment.label,
          points:      data.segment.points,
          isSpinAgain: data.segment.isSpinAgain,
        });
        setLocalPoints(data.newTotalPoints);
        onSpinComplete(data.newTotalPoints, data.nextSpinAt, data.segment.isSpinAgain);
      }, 6200);
    } catch {
      setError("Something went wrong. Please try again.");
      setSpinning(false);
    }
  }, [spinning, canSpin, bonusAvailable, rotation, onSpinComplete]);

  const canPressButton = (canSpin || bonusAvailable) && !spinning;

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      {/* Wheel */}
      <div className="relative" style={{ width: 460, height: 460 }}>
        <svg viewBox="0 0 500 500" width="460" height="460" style={{ overflow: "visible" }}>
          {/* Outer glow ring */}
          <circle cx={CX} cy={CY} r={R + 20} fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth="14" />

          {/* Marquee lights (outside wheel) */}
          <MarqueeLights spinning={spinning} winner={!!result && !result.isSpinAgain} />

          {/* Spinning group */}
          <g
            ref={wheelRef}
            style={{
              transformOrigin: `${CX}px ${CY}px`,
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? "transform 6s cubic-bezier(0.17, 0.78, 0.13, 1)"
                : "none",
            }}
          >
            {/* Segments */}
            {SPIN_SEGMENTS.map((seg, i) => {
              const midAngle  = i * DEG_PER_SEG + DEG_PER_SEG / 2 - 90;
              const midRad    = toRad(midAngle);
              const textR     = 140;
              const tx        = CX + textR * Math.cos(midRad);
              const ty        = CY + textR * Math.sin(midRad);
              const textAngle = midAngle + 90;

              // Split label: first word(s) on line 1, points on line 2
              const words   = seg.label.split(" ");
              const halfLen = Math.ceil(words.length / 2);
              const line1   = words.slice(0, halfLen).join(" ");
              const line2   = words.slice(halfLen).join(" ");

              return (
                <g key={i}>
                  <path
                    d={segPath(i)}
                    fill={seg.color}
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1.5"
                  />
                  <g transform={`rotate(${textAngle}, ${CX}, ${CY})`}>
                    <text
                      x={CX}
                      y={CY - textR}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="700"
                      fontFamily="system-ui, sans-serif"
                      fill={seg.textColor}
                      dominantBaseline="auto"
                    >
                      <tspan x={CX} dy="0">{line1}</tspan>
                      {line2 && <tspan x={CX} dy="12">{line2}</tspan>}
                      {seg.points > 0 && (
                        <tspan x={CX} dy="13" fontWeight="900" fontSize="11" fill={seg.textColor}>
                          +{seg.points}
                        </tspan>
                      )}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Divider lines */}
            {SPIN_SEGMENTS.map((_, i) => {
              const angle = toRad(i * DEG_PER_SEG - 90);
              return (
                <line
                  key={`div-${i}`}
                  x1={CX} y1={CY}
                  x2={(CX + R * Math.cos(angle)).toFixed(3)}
                  y2={(CY + R * Math.sin(angle)).toFixed(3)}
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Centre hub */}
            <circle cx={CX} cy={CY} r="38" fill="white" />
            <circle cx={CX} cy={CY} r="34" fill="#0c4a6e" />
            <text
              x={CX}
              y={CY + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              fill="#f59e0b"
              letterSpacing="1"
            >
              TWF
            </text>
          </g>

          {/* Static pointer at top */}
          <polygon
            points={`${CX},22 ${CX - 14},46 ${CX + 14},46`}
            fill="#fbbf24"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Outer border ring */}
          <circle cx={CX} cy={CY} r={R + 1} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
        </svg>

        {/* Winner flash overlay */}
        {result && !result.isSpinAgain && winnerIdx !== null && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ background: SPIN_SEGMENTS[winnerIdx].color }}
            />
          </div>
        )}
      </div>

      {/* Points display */}
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.55)" }}>
          Your Points
        </p>
        <p className="text-5xl font-black" style={{ color: "#fbbf24", textShadow: "0 0 30px rgba(251,191,36,0.5)" }}>
          {localPoints.toLocaleString()}
        </p>
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={!canPressButton}
        className="relative px-12 py-4 rounded-full font-black text-xl uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        style={{
          background: canPressButton
            ? "linear-gradient(135deg, #f59e0b, #ea580c)"
            : "rgba(255,255,255,0.1)",
          color: canPressButton ? "#0c0a08" : "rgba(255,255,255,0.4)",
          boxShadow: canPressButton
            ? "0 0 40px rgba(245,158,11,0.6), 0 4px 16px rgba(0,0,0,0.4)"
            : "none",
        }}
      >
        {spinning ? "Spinning…" : "SPIN!"}
      </button>

      {/* Result banner */}
      {result && !spinning && (
        <div
          className="px-8 py-4 rounded-2xl text-center animate-bounce-once"
          style={{
            background: result.isSpinAgain
              ? "rgba(220,38,38,0.2)"
              : "rgba(251,191,36,0.15)",
            border: `1px solid ${result.isSpinAgain ? "rgba(220,38,38,0.5)" : "rgba(251,191,36,0.4)"}`,
          }}
        >
          {result.isSpinAgain ? (
            <>
              <p className="text-2xl font-black text-red-400">🎰 Spin Again!</p>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>
                Lucky you — spin the wheel again for free!
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>
                {result.label}
              </p>
              <p className="text-4xl font-black" style={{ color: "#fbbf24" }}>
                +{result.points} pts
              </p>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
