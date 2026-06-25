"use client";

/**
 * /preview/spin/demo — auth-free design preview.
 * All spin logic runs client-side; nothing is saved to the database.
 */

import { useState, useRef, useCallback } from "react";
import { SPIN_SEGMENTS, pickWeightedSegment } from "@/lib/spinSegments";

// ─── Geometry ─────────────────────────────────────────────────────────────────
const CX = 250, CY = 250, R = 205;
const DEG = 30;
const toRad = (d: number) => (d * Math.PI) / 180;
const TEXT_R = 148;

function segPath(i: number) {
  const s = toRad(i * DEG - 90), e = toRad((i + 1) * DEG - 90);
  return `M ${CX} ${CY} L ${(CX+R*Math.cos(s)).toFixed(3)} ${(CY+R*Math.sin(s)).toFixed(3)} A ${R} ${R} 0 0 1 ${(CX+R*Math.cos(e)).toFixed(3)} ${(CY+R*Math.sin(e)).toFixed(3)} Z`;
}

const LIGHT_COUNT = 40, LIGHT_R = 222;
function Lights({ spinning, won }: { spinning: boolean; won: boolean }) {
  const ms = spinning ? 120 : won ? 200 : 1600;
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
            fill={won ? "#fde047" : spinning ? "#ffffff" : "#f59e0b"}
            style={{ animation: `lp ${ms}ms ease-in-out infinite`, animationDelay: `${(i * ms) / LIGHT_COUNT}ms` }}
          />
        );
      })}
    </>
  );
}

// ─── Demo leaderboard data ─────────────────────────────────────────────────────
const BOARD  = [{ r:1,n:"SunChaser99",p:4250 },{r:2,n:"TenerifeKev",p:3100},{r:3,n:"BeachLover",p:2875},{r:4,n:"AtlanticWave",p:1940},{r:5,n:"TeideTrekker",p:1605}];
const PREV   = [{r:1,n:"VolcanoVibes",p:5820},{r:2,n:"IslaPerfect",p:4310},{r:3,n:"TeideStar",p:3050}];
const MEDAL: Record<number,string> = {1:"🥇",2:"🥈",3:"🥉"};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SpinDemoPage() {
  const [rotation, setRotation]   = useState(0);
  const [spinning, setSpinning]   = useState(false);
  const [points, setPoints]       = useState(350);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const [result, setResult]       = useState<{ label: string; pts: number; again: boolean } | null>(null);
  const wheelRef = useRef<SVGGElement>(null);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    setWinnerIdx(null);

    const idx = pickWeightedSegment();
    const seg = SPIN_SEGMENTS[idx];
    const targetMod = ((345 - idx * DEG) % 360 + 360) % 360;
    const curMod = rotation % 360;
    let delta = (targetMod - curMod + 360) % 360;
    if (delta < DEG) delta += 360;
    setRotation(rotation + delta + 6 * 360);

    setTimeout(() => {
      setWinnerIdx(idx);
      setSpinning(false);
      setResult({ label: seg.label, pts: seg.points, again: !!seg.isSpinAgain });
      setPoints(p => p + seg.points);
    }, 6200);
  }, [spinning, rotation]);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #020f1e 0%, #0c2340 55%, #07101e 100%)" }}>
      {/* Banner */}
      <div className="w-full py-1.5 text-center text-xs font-bold uppercase tracking-widest" style={{ background: "#fbbf24", color: "#1a0500" }}>
        ✎ Design preview — no auth · no database · resets on refresh
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Tenerife Weather Forum</p>
          <h1 className="text-lg font-black" style={{ color: "#fbbf24" }}>Lucky Spin ✦</h1>
        </div>
        <a href="/preview/spin" className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}>
          ← Live version
        </a>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4 lg:py-5">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-center">

          {/* ── Wheel column ── */}
          <div className="flex flex-col items-center gap-4 w-full lg:w-auto">
            <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.45)" }}>
              1 spin per 24 hrs · Newsletter subscribers get a bonus spin
            </p>

            {/* SVG Wheel — 360 px display from 500×500 viewBox */}
            <div className="relative" style={{ width: 360, height: 360 }}>
              <svg viewBox="0 0 500 500" width="360" height="360" style={{ overflow: "visible" }}>
                <circle cx={CX} cy={CY} r={R + 20} fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth="14" />
                <Lights spinning={spinning} won={!!(result && !result.again)} />

                <g ref={wheelRef} style={{
                  transformOrigin: `${CX}px ${CY}px`,
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? "transform 6s cubic-bezier(0.17,0.78,0.13,1)" : "none",
                }}>
                  {SPIN_SEGMENTS.map((seg, i) => {
                    const mid = i * DEG + DEG / 2 - 90;
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

                  {/* Dividers */}
                  {SPIN_SEGMENTS.map((_, i) => {
                    const a = toRad(i * DEG - 90);
                    return <line key={i} x1={CX} y1={CY} x2={(CX+R*Math.cos(a)).toFixed(3)} y2={(CY+R*Math.sin(a)).toFixed(3)} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />;
                  })}

                  {/* Hub */}
                  <circle cx={CX} cy={CY} r="38" fill="white" />
                  <circle cx={CX} cy={CY} r="34" fill="#0c4a6e" />
                  <text x={CX} y={CY+1} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="900" fontFamily="system-ui,sans-serif" fill="#f59e0b" letterSpacing="1">TWF</text>
                </g>

                <polygon points={`${CX},22 ${CX-14},46 ${CX+14},46`} fill="#fbbf24" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                <circle cx={CX} cy={CY} r={R+1} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
              </svg>

              {result && !result.again && winnerIdx !== null && (
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
                  {points.toLocaleString()}
                </p>
              </div>
              <button
                onClick={spin}
                disabled={spinning}
                className="px-10 py-4 rounded-full font-black text-xl uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                style={{
                  background: spinning ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#f59e0b,#ea580c)",
                  color:      spinning ? "rgba(255,255,255,0.4)" : "#0c0a08",
                  boxShadow:  spinning ? "none" : "0 0 40px rgba(245,158,11,0.55),0 4px 16px rgba(0,0,0,0.4)",
                }}
              >
                {spinning ? "Spinning…" : "SPIN!"}
              </button>
            </div>

            {/* Result */}
            {result && !spinning && (
              <div className="px-6 py-3 rounded-2xl text-center" style={{
                background: result.again ? "rgba(220,38,38,0.2)" : "rgba(251,191,36,0.15)",
                border: `1px solid ${result.again ? "rgba(220,38,38,0.5)" : "rgba(251,191,36,0.4)"}`,
              }}>
                {result.again
                  ? <><p className="text-xl font-black text-red-400">🎰 Spin Again!</p><p className="text-sm mt-0.5" style={{color:"rgba(255,255,255,0.65)"}}>Lucky you — spin for free!</p></>
                  : <><p className="text-sm font-bold" style={{color:"rgba(255,255,255,0.8)"}}>{result.label}</p><p className="text-3xl font-black" style={{color:"#fbbf24"}}>+{result.pts} pts</p></>
                }
              </div>
            )}

            {/* Static countdown demo */}
            <div className="text-center py-2.5 px-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Next spin available in</p>
              <div className="flex items-center justify-center gap-1">
                {[["18","hrs"],["42","min"],["07","sec"]].map(([v,l],i) => (
                  <div key={l} className="flex items-center gap-1">
                    {i > 0 && <span className="text-xl font-bold" style={{color:"rgba(255,255,255,0.3)"}}>:</span>}
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black tabular-nums" style={{color:"#fbbf24",textShadow:"0 0 20px rgba(251,191,36,0.4)"}}>{v}</span>
                      <span className="text-xs" style={{color:"rgba(255,255,255,0.35)"}}>{l}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Leaderboard column ── */}
          <div className="w-full lg:w-72 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#fbbf24" }}>June 2026 Leaderboard</h3>
            <ol className="space-y-2">
              {BOARD.map(e => (
                <li key={e.r} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ background: e.r <= 3 ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.04)", border: e.r === 1 ? "1px solid rgba(251,191,36,0.35)" : "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="w-6 text-center text-lg leading-none">{MEDAL[e.r] ?? <span className="text-sm font-bold" style={{color:"rgba(255,255,255,0.3)"}}>{e.r}</span>}</span>
                  <span className="flex-1 text-sm font-semibold truncate" style={{color:"rgba(255,255,255,0.88)"}}>{e.n}</span>
                  <span className="text-sm font-black tabular-nums" style={{color:"#fbbf24"}}>{e.p.toLocaleString()} pts</span>
                </li>
              ))}
            </ol>

            <div className="mt-5 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Last Month&apos;s Winners</h4>
              <ol className="space-y-1.5">
                {PREV.map(w => (
                  <li key={w.r} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{background:"rgba(255,255,255,0.04)"}}>
                    <span className="text-base leading-none">{MEDAL[w.r]}</span>
                    <span className="flex-1 text-xs font-medium truncate" style={{color:"rgba(255,255,255,0.6)"}}>{w.n}</span>
                    <span className="text-xs font-bold tabular-nums" style={{color:"rgba(251,191,36,0.7)"}}>{w.p.toLocaleString()}</span>
                  </li>
                ))}
              </ol>
              <p className="text-xs mt-1.5" style={{color:"rgba(255,255,255,0.25)"}}>May 2026</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
