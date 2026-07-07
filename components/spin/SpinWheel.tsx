"use client";

import { SPIN_SEGMENTS } from "@/lib/spinSegments";

// ─── SVG geometry ─────────────────────────────────────────────────────────────
const CX = 250, CY = 250, R = 206;
const DEG = 30;
const LIGHT_COUNT = 36;
const LIGHT_R = 234;
const toRad = (d: number) => (d * Math.PI) / 180;

function segPath(i: number) {
  const s = toRad(i * DEG - 90);
  const e = toRad((i + 1) * DEG - 90);
  return [
    `M ${CX} ${CY}`,
    `L ${(CX + R * Math.cos(s)).toFixed(2)} ${(CY + R * Math.sin(s)).toFixed(2)}`,
    `A ${R} ${R} 0 0 1 ${(CX + R * Math.cos(e)).toFixed(2)} ${(CY + R * Math.sin(e)).toFixed(2)}`,
    "Z",
  ].join(" ");
}

// ─── Chase-effect marquee lights ─────────────────────────────────────────────
function MarqueeLights({ spinning, winner }: { spinning: boolean; winner: boolean }) {
  const period = spinning ? 100 : winner ? 280 : 2000;
  const fill   = winner ? "#fde047" : "#fff9e6";
  return (
    <>
      <style>{`
        @keyframes mq {
          0%,100% { opacity:.18; r:4.5px }
          12%      { opacity:1;   r:6.5px }
          28%      { opacity:.22; r:4.5px }
        }
      `}</style>
      {Array.from({ length: LIGHT_COUNT }, (_, i) => {
        const a  = toRad(i * (360 / LIGHT_COUNT) - 90);
        const lx = (CX + LIGHT_R * Math.cos(a)).toFixed(2);
        const ly = (CY + LIGHT_R * Math.sin(a)).toFixed(2);
        return (
          <circle key={i} cx={lx} cy={ly} r="4.5" fill={fill}
            style={{
              animation:      `mq ${period}ms ease-in-out infinite`,
              animationDelay: `-${(i / LIGHT_COUNT) * period}ms`,
              transformOrigin: `${lx}px ${ly}px`,
            }}
          />
        );
      })}
    </>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface SpinWheelProps {
  rotation:  number;
  spinning:  boolean;
  winnerIdx: number | null;
  size?:     number;
}

export default function SpinWheel({ rotation, spinning, winnerIdx, size = 500 }: SpinWheelProps) {
  const hasWinner = winnerIdx !== null && !SPIN_SEGMENTS[winnerIdx]?.isSpinAgain;

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>
      <svg viewBox="0 0 500 500" width={size} height={size} style={{ overflow: "visible" }}>
        <defs>
          {/* Gold rim gradient — metallic sheen */}
          <linearGradient id="rimG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#fef9c3" />
            <stop offset="20%"  stopColor="#fde047" />
            <stop offset="55%"  stopColor="#f59e0b" />
            <stop offset="85%"  stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          {/* Hub fill */}
          <radialGradient id="hubG" cx="40%" cy="35%" r="65%">
            <stop offset="0%"   stopColor="#1e4d7a" />
            <stop offset="100%" stopColor="#0c2340" />
          </radialGradient>
          {/* Drop shadow for all text */}
          <filter id="ts" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000" floodOpacity="0.95" />
          </filter>
          {/* Glow for pointer */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Outer ambient halo */}
        <circle cx={CX} cy={CY} r={R + 52} fill="none"
          stroke="rgba(251,191,36,0.10)" strokeWidth="18" />

        {/* Gold rim band */}
        <circle cx={CX} cy={CY} r={R + 16}
          fill="none" stroke="url(#rimG)" strokeWidth="30" />

        {/* Inner rim edge highlight */}
        <circle cx={CX} cy={CY} r={R + 1}
          fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" />

        {/* Marquee lights — sit on top of gold rim */}
        <MarqueeLights spinning={spinning} winner={hasWinner} />

        {/* ── Spinning group ── */}
        <g style={{
          transformOrigin: `${CX}px ${CY}px`,
          transform:       `rotate(${rotation}deg)`,
          transition:      spinning ? "transform 6s cubic-bezier(0.17,0.78,0.13,1)" : "none",
        }}>

          {/* Segment fills + text */}
          {SPIN_SEGMENTS.map((seg, i) => {
            const mid       = i * DEG + DEG / 2 - 90;
            const textAngle = mid + 90;
            // Segments whose mid angle is 0°–180° read upside-down — apply flip
            const isFlipped = mid > 0 && mid < 180;
            const flip = (r: number): string | undefined =>
              isFlipped ? `rotate(180, ${CX}, ${CY - r})` : undefined;

            const [w1, ...rest] = seg.label.split(" ");
            const w2 = rest.join(" ");

            return (
              <g key={i}>
                {/* Segment */}
                <path d={segPath(i)} fill={seg.color} />
                {/* White divider lines */}
                <line
                  x1={CX} y1={CY}
                  x2={(CX + R * Math.cos(toRad(i * DEG - 90))).toFixed(2)}
                  y2={(CY + R * Math.sin(toRad(i * DEG - 90))).toFixed(2)}
                  stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"
                />

                {/* Text group — rotated to read radially outward */}
                <g transform={`rotate(${textAngle}, ${CX}, ${CY})`}>
                  {/* Emoji icon */}
                  <text x={CX} y={CY - 172} textAnchor="middle" dominantBaseline="middle"
                    fontSize="14" filter="url(#ts)"
                    transform={flip(172)}>{seg.icon}</text>

                  {/* Name word 1 */}
                  <text x={CX} y={CY - 153} textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize="7.5" fontWeight="900"
                    letterSpacing="0.8" fontFamily="system-ui,sans-serif"
                    filter="url(#ts)" transform={flip(153)}>
                    {w1.toUpperCase()}
                  </text>

                  {/* Name word 2 */}
                  {w2 && (
                    <text x={CX} y={CY - 142} textAnchor="middle" dominantBaseline="middle"
                      fill="white" fontSize="7.5" fontWeight="900"
                      letterSpacing="0.8" fontFamily="system-ui,sans-serif"
                      filter="url(#ts)" transform={flip(142)}>
                      {w2.toUpperCase()}
                    </text>
                  )}

                  {/* Points value */}
                  {seg.isSpinAgain ? (
                    <text x={CX} y={CY - 118} textAnchor="middle" dominantBaseline="middle"
                      fill="white" fontSize="13" fontWeight="900"
                      fontFamily="system-ui,sans-serif"
                      filter="url(#ts)" transform={flip(118)}>FREE</text>
                  ) : (
                    <>
                      <text x={CX} y={CY - 119} textAnchor="middle" dominantBaseline="middle"
                        fill={seg.textColor} fontSize="17" fontWeight="900"
                        fontFamily="system-ui,sans-serif"
                        filter="url(#ts)" transform={flip(119)}>
                        +{seg.points}
                      </text>
                      <text x={CX} y={CY - 102} textAnchor="middle" dominantBaseline="middle"
                        fill={seg.textColor} fontSize="6.5" fontWeight="700"
                        letterSpacing="0.6" fontFamily="system-ui,sans-serif"
                        opacity="0.85" filter="url(#ts)" transform={flip(102)}>
                        POINTS
                      </text>
                    </>
                  )}
                </g>
              </g>
            );
          })}

          {/* Hub — TWF logo */}
          <circle cx={CX} cy={CY} r={48} fill="white" />
          <circle cx={CX} cy={CY} r={44} fill="url(#hubG)" />

          {/* Mountain silhouette */}
          <path d={`M${CX - 20},${CY + 12} L${CX},${CY - 18} L${CX + 20},${CY + 12} Z`}
            fill="#163d5f" />
          {/* Snow cap */}
          <path d={`M${CX - 7},${CY - 7} L${CX},${CY - 18} L${CX + 7},${CY - 7} Z`}
            fill="white" opacity="0.9" />
          {/* Sun (rises top-right of peak) */}
          <circle cx={CX + 14} cy={CY - 19} r={8.5} fill="#fbbf24" />
          {/* Sun rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const ra = toRad(deg);
            const x1 = CX + 14 + 10 * Math.cos(ra);
            const y1 = CY - 19 + 10 * Math.sin(ra);
            const x2 = CX + 14 + 14 * Math.cos(ra);
            const y2 = CY - 19 + 14 * Math.sin(ra);
            return <line key={deg} x1={x1.toFixed(1)} y1={y1.toFixed(1)}
              x2={x2.toFixed(1)} y2={y2.toFixed(1)}
              stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />;
          })}

          {/* "Tenerife" label */}
          <text x={CX} y={CY + 19} textAnchor="middle" fontSize="6.5" fontWeight="900"
            fill="white" fontFamily="system-ui,sans-serif" letterSpacing="0.5">
            Tenerife
          </text>
          {/* "Weather Forum" label */}
          <text x={CX} y={CY + 27} textAnchor="middle" fontSize="4.8" fontWeight="600"
            fill="rgba(255,255,255,0.7)" fontFamily="system-ui,sans-serif">
            Weather Forum
          </text>
        </g>

        {/* Static pointer — gold pin at top */}
        <filter id="ptrGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <polygon
          points={`${CX},24 ${CX - 17},52 ${CX + 17},52`}
          fill="#fbbf24" stroke="#1a0500" strokeWidth="2.5" strokeLinejoin="round"
          filter="url(#ptrGlow)"
        />
        <circle cx={CX} cy={24} r={7} fill="#fbbf24" stroke="white" strokeWidth="2" />
      </svg>

      {/* Winner pulse overlay */}
      {hasWinner && winnerIdx !== null && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: SPIN_SEGMENTS[winnerIdx].color }} />
        </div>
      )}
    </div>
  );
}
