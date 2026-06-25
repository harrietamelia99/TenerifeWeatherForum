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

// ─── Win Modal ────────────────────────────────────────────────────────────────
function WinModal({ result, onDismiss }: { result: { label: string; pts: number; again: boolean; color: string }; onDismiss: () => void }) {
  const sparkles = [
    { x:"15%",y:"20%",size:8,delay:0 },{ x:"80%",y:"15%",size:12,delay:.1 },
    { x:"10%",y:"65%",size:6,delay:.2 },{ x:"88%",y:"60%",size:10,delay:.15 },
    { x:"50%",y:"8%", size:7,delay:.05},{ x:"25%",y:"85%",size:9,delay:.25 },
    { x:"72%",y:"82%",size:11,delay:.3},{ x:"90%",y:"35%",size:6,delay:.18 },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background:"rgba(2,15,30,0.85)", backdropFilter:"blur(6px)" }}
      onClick={onDismiss}>
      <style>{`
        @keyframes popIn{0%{opacity:0;transform:scale(.4) translateY(24px)}65%{transform:scale(1.06) translateY(-6px)}100%{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes floatUp{0%{opacity:0;transform:translateY(0) scale(0)}20%{opacity:1;transform:translateY(-12px) scale(1)}80%{opacity:1}100%{opacity:0;transform:translateY(-60px) scale(.5)}}
        @keyframes shimmer{0%,100%{opacity:.6}50%{opacity:1}}
      `}</style>
      {!result.again && sparkles.map((s,i)=>(
        <div key={i} className="absolute pointer-events-none rounded-full"
          style={{ left:s.x,top:s.y,width:s.size,height:s.size,
            background:i%2===0?"#fbbf24":"#ffffff",
            animation:`floatUp 1.6s ease-out ${s.delay}s forwards` }} />
      ))}
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden text-center"
        style={{ animation:"popIn .5s cubic-bezier(.34,1.56,.64,1) forwards",
          background: result.again
            ? "linear-gradient(160deg,#1a0505,#3b0808)"
            : `linear-gradient(160deg,#051525,${result.color}22 60%,#051525)`,
          border:`2px solid ${result.again?"rgba(239,68,68,.5)":"rgba(251,191,36,.5)"}`,
          boxShadow: result.again
            ? "0 0 60px rgba(239,68,68,.35),0 20px 60px rgba(0,0,0,.6)"
            : "0 0 60px rgba(251,191,36,.3),0 20px 60px rgba(0,0,0,.6)" }}
        onClick={e=>e.stopPropagation()}>
        <div className="h-2 w-full" style={{ background: result.again ? "#dc2626" : result.color }} />
        <div className="px-8 py-8">
          <div className="text-6xl mb-3 leading-none" style={{animation:"shimmer 1.4s ease-in-out infinite"}}>
            {result.again ? "🎰" : result.pts >= 150 ? "🌋" : result.pts >= 75 ? "🌟" : result.pts >= 30 ? "☀️" : "🎉"}
          </div>
          {result.again ? (
            <>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:"rgba(255,255,255,.45)"}}>Lucky!</p>
              <h2 className="text-4xl font-black text-red-400 mb-2">Spin Again!</h2>
              <p className="text-base" style={{color:"rgba(255,255,255,.6)"}}>You landed on <strong style={{color:"white"}}>Spin Again</strong> — spin for free right now!</p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:"rgba(255,255,255,.45)"}}>You won</p>
              <p className="text-lg font-bold mb-1" style={{color:"rgba(255,255,255,.75)"}}>{result.label}</p>
              <h2 className="text-7xl font-black tabular-nums mb-1"
                style={{color:"#fbbf24",textShadow:"0 0 40px rgba(251,191,36,.7),0 0 80px rgba(251,191,36,.3)"}}>
                +{result.pts}
              </h2>
              <p className="text-lg font-bold" style={{color:"rgba(255,255,255,.5)"}}>points</p>
            </>
          )}
          <button onClick={onDismiss}
            className="mt-7 w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider active:scale-95"
            style={{ background: result.again
                ? "linear-gradient(135deg,#dc2626,#b91c1c)"
                : "linear-gradient(135deg,#f59e0b,#ea580c)",
              color:"#0c0a08",
              boxShadow: result.again ? "0 0 30px rgba(220,38,38,.5)" : "0 0 30px rgba(245,158,11,.5)" }}>
            {result.again ? "Spin Again Now! 🎰" : "Collect Points! ✦"}
          </button>
          <p className="text-xs mt-3" style={{color:"rgba(255,255,255,.2)"}}>tap anywhere to close</p>
        </div>
      </div>
    </div>
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
  const [result, setResult]       = useState<{ label: string; pts: number; again: boolean; color: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const wheelRef = useRef<SVGGElement>(null);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setShowModal(false);
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
      setResult({ label: seg.label, pts: seg.points, again: !!seg.isSpinAgain, color: seg.color });
      setShowModal(true);
      setPoints(p => p + seg.points);
    }, 6200);
  }, [spinning, rotation]);

  return (
    <div className="min-h-screen pt-[128px]" style={{ background: "linear-gradient(160deg, #020f1e 0%, #0c2340 55%, #07101e 100%)" }}>
      {showModal && result && <WinModal result={result} onDismiss={() => setShowModal(false)} />}
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

            {/* Last result pill */}
            {result && !spinning && !showModal && (
              <button onClick={() => setShowModal(true)}
                className="text-sm font-semibold px-4 py-1.5 rounded-full transition-opacity hover:opacity-80"
                style={{ background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.12)" }}>
                {result.again ? "🎰 Spin Again" : `+${result.pts} pts — ${result.label}`} · tap to view
              </button>
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
