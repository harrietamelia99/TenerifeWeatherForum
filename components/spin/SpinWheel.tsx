"use client";

import { SPIN_SEGMENTS } from "@/lib/spinSegments";

// ─── SVG geometry ─────────────────────────────────────────────────────────────
const CX = 250, CY = 250, R = 205;
const DEG = 30;
const TEXT_R = 148;
const toRad = (d: number) => (d * Math.PI) / 180;

function segPath(i: number) {
  const s = toRad(i * DEG - 90), e = toRad((i + 1) * DEG - 90);
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

// ─── Props ────────────────────────────────────────────────────────────────────
export interface SpinWheelProps {
  /** Current accumulated rotation in degrees */
  rotation: number;
  spinning: boolean;
  /** Index of the winning segment (null while spinning / before first spin) */
  winnerIdx: number | null;
  /** Display size in px — defaults to 460 */
  size?: number;
}

/**
 * Pure visual component — just the SVG wheel.
 * No state, no button, no API calls. Compose with your own controls.
 */
export default function SpinWheel({ rotation, spinning, winnerIdx, size = 460 }: SpinWheelProps) {
  const hasWinner = winnerIdx !== null && !SPIN_SEGMENTS[winnerIdx]?.isSpinAgain;

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>
      <svg viewBox="0 0 500 500" width={size} height={size} style={{ overflow: "visible" }}>
        {/* Outer glow ring */}
        <circle cx={CX} cy={CY} r={R + 20} fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth="14" />

        <MarqueeLights spinning={spinning} winner={hasWinner} />

        {/* Spinning group */}
        <g style={{
          transformOrigin: `${CX}px ${CY}px`,
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? "transform 6s cubic-bezier(0.17,0.78,0.13,1)" : "none",
        }}>
          {/* Segments */}
          {SPIN_SEGMENTS.map((seg, i) => {
            const mid = i * DEG + DEG / 2 - 90;
            const textAngle = mid + 90;
            // Segments where mid is 0°–180° have text rotated past 90° and become
            // upside-down from the viewer's perspective. Add 180° to flip them back.
            const isFlipped = mid > 0 && mid < 180;
            const words = seg.label.split(" ");
            const nameLine   = words[0];
            const pointsLine = seg.isSpinAgain ? words[1] : `+${seg.points}`;

            return (
              <g key={i}>
                <path d={segPath(i)} fill={seg.color} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                <g transform={`rotate(${textAngle}, ${CX}, ${CY})`}>
                  <text
                    x={CX} y={CY - TEXT_R}
                    textAnchor="middle"
                    fontFamily="system-ui,sans-serif"
                    fill={seg.textColor}
                    transform={isFlipped ? `rotate(180, ${CX}, ${CY - TEXT_R})` : undefined}
                  >
                    <tspan x={CX} dy="-9"  fontSize="10" fontWeight="600" opacity="0.9">{nameLine}</tspan>
                    <tspan x={CX} dy="19"  fontSize="18" fontWeight="900">{pointsLine}</tspan>
                  </text>
                </g>
              </g>
            );
          })}

          {/* Dividers */}
          {SPIN_SEGMENTS.map((_, i) => {
            const a = toRad(i * DEG - 90);
            return <line key={i} x1={CX} y1={CY} x2={(CX+R*Math.cos(a)).toFixed(3)} y2={(CY+R*Math.sin(a)).toFixed(3)} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />;
          })}

          {/* Hub */}
          <circle cx={CX} cy={CY} r="38" fill="white" />
          <circle cx={CX} cy={CY} r="34" fill="#0c4a6e" />
          <text x={CX} y={CY+1} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="900"
            fontFamily="system-ui,sans-serif" fill="#f59e0b" letterSpacing="1">TWF</text>
        </g>

        {/* Static pointer */}
        <polygon points={`${CX},22 ${CX-14},46 ${CX+14},46`} fill="#fbbf24" stroke="white" strokeWidth="2" strokeLinejoin="round" />
        <circle cx={CX} cy={CY} r={R+1} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      </svg>

      {/* Winner pulse overlay */}
      {hasWinner && winnerIdx !== null && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ background: SPIN_SEGMENTS[winnerIdx].color }} />
        </div>
      )}
    </div>
  );
}
