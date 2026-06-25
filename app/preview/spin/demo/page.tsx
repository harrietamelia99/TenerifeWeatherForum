"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { SPIN_SEGMENTS, pickWeightedSegment } from "@/lib/spinSegments";
import SpinWheel from "@/components/spin/SpinWheel";
import WinModal, { type WinResult } from "@/components/spin/WinModal";

// ─── Responsive wheel size ────────────────────────────────────────────────────
function useWheelSize() {
  const [size, setSize] = useState(460);
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      if (vw < 480)  setSize(Math.min(vw - 32, 320));
      else if (vw < 768)  setSize(380);
      else if (vw < 1024) setSize(420);
      else setSize(460);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

// ─── Demo leaderboard data ────────────────────────────────────────────────────
const BOARD = [
  { r:1, n:"SunChaser99",  p:4250 }, { r:2, n:"TenerifeKev", p:3100 },
  { r:3, n:"BeachLover",   p:2875 }, { r:4, n:"AtlanticWave", p:1940 },
  { r:5, n:"TeideTrekker", p:1605 },
];
const PREV = [{ r:1, n:"VolcanoVibes", p:5820 }, { r:2, n:"IslaPerfect", p:4310 }, { r:3, n:"TeideStar", p:3050 }];
const MEDAL: Record<number, string> = { 1:"🥇", 2:"🥈", 3:"🥉" };

// ─── Countdown (static demo values) ──────────────────────────────────────────
function DemoCountdown() {
  return (
    <div className="w-full rounded-2xl py-3 px-4 text-center"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
        Next spin in
      </p>
      <div className="flex items-center justify-center gap-1">
        {[["18","hrs"],["42","min"],["07","sec"]].map(([v, l], i) => (
          <div key={l} className="flex items-center gap-1">
            {i > 0 && <span className="text-lg font-bold" style={{ color: "rgba(255,255,255,0.2)" }}>:</span>}
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black tabular-nums" style={{ color:"#fbbf24", textShadow:"0 0 14px rgba(251,191,36,0.4)" }}>{v}</span>
              <span className="text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>{l}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Leaderboard (collapsible on mobile) ─────────────────────────────────────
function DemoLeaderboard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full rounded-2xl p-4 sm:p-5"
      style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)" }}>
      {/* Mobile toggle */}
      <button
        className="flex items-center justify-between w-full lg:cursor-default"
        onClick={() => setOpen(o => !o)}
      >
        <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color:"#fbbf24" }}>
          June 2026 Leaderboard
        </h3>
        <span className="text-xs lg:hidden" style={{ color:"rgba(255,255,255,0.4)" }}>
          {open ? "▲ hide" : "▼ show"}
        </span>
      </button>

      <div className={`mt-3 space-y-2 lg:block ${open ? "block" : "hidden"}`}>
        <ol className="space-y-1.5">
          {BOARD.map(e => (
            <li key={e.r} className="flex items-center gap-3 px-3 py-2 rounded-xl"
              style={{
                background: e.r <= 3 ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.04)",
                border: e.r === 1 ? "1px solid rgba(251,191,36,0.35)" : "1px solid rgba(255,255,255,0.06)",
              }}>
              <span className="w-6 text-center text-lg leading-none">
                {MEDAL[e.r] ?? <span className="text-sm font-bold" style={{ color:"rgba(255,255,255,0.3)" }}>{e.r}</span>}
              </span>
              <span className="flex-1 text-sm font-semibold truncate" style={{ color:"rgba(255,255,255,0.88)" }}>{e.n}</span>
              <span className="text-sm font-black tabular-nums" style={{ color:"#fbbf24" }}>{e.p.toLocaleString()} pts</span>
            </li>
          ))}
        </ol>

        <div className="mt-4 pt-3 border-t" style={{ borderColor:"rgba(255,255,255,0.07)" }}>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:"rgba(255,255,255,0.3)" }}>
            Last Month&apos;s Winners
          </h4>
          <ol className="space-y-1.5">
            {PREV.map(w => (
              <li key={w.r} className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background:"rgba(255,255,255,0.04)" }}>
                <span className="text-base leading-none">{MEDAL[w.r]}</span>
                <span className="flex-1 text-xs font-medium truncate" style={{ color:"rgba(255,255,255,0.6)" }}>{w.n}</span>
                <span className="text-xs font-bold tabular-nums" style={{ color:"rgba(251,191,36,0.7)" }}>{w.p.toLocaleString()}</span>
              </li>
            ))}
          </ol>
          <p className="text-xs mt-1.5" style={{ color:"rgba(255,255,255,0.25)" }}>May 2026</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SpinDemoPage() {
  const wheelSize   = useWheelSize();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [points,   setPoints]   = useState(350);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const [modal,    setModal]    = useState<WinResult | null>(null);
  const [lastWin,  setLastWin]  = useState<WinResult | null>(null);
  const rotRef = useRef(0);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setModal(null);

    const idx = pickWeightedSegment();
    const seg = SPIN_SEGMENTS[idx];
    const targetMod = ((345 - idx * 30) % 360 + 360) % 360;
    const curMod = rotRef.current % 360;
    let delta = (targetMod - curMod + 360) % 360;
    if (delta < 30) delta += 360;
    const newRot = rotRef.current + delta + 6 * 360;
    rotRef.current = newRot;
    setRotation(newRot);

    setTimeout(() => {
      setWinnerIdx(idx);
      setSpinning(false);
      const result: WinResult = { segmentIndex: idx, label: seg.label, points: seg.points, isSpinAgain: !!seg.isSpinAgain };
      setModal(result);
      setLastWin(result);
      setPoints(p => p + seg.points);
    }, 6200);
  }, [spinning]);

  return (
    <div className="min-h-screen pt-[128px]"
      style={{ background: "linear-gradient(160deg, #020f1e 0%, #0c2340 55%, #07101e 100%)" }}>

      {modal && <WinModal result={modal} onDismiss={() => setModal(null)} />}

      {/* Banner */}
      <div className="w-full py-1.5 text-center text-xs font-bold uppercase tracking-widest"
        style={{ background:"#fbbf24", color:"#1a0500" }}>
        ✎ Design preview — no auth · no database · resets on refresh
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b"
        style={{ borderColor:"rgba(255,255,255,0.07)" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.4)" }}>
            Tenerife Weather Forum
          </p>
          <h1 className="text-base sm:text-lg font-black" style={{ color:"#fbbf24" }}>Lucky Spin ✦</h1>
        </div>
        <a href="/preview/spin"
          className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold"
          style={{ background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)", border:"1px solid rgba(255,255,255,0.12)" }}>
          ← Live version
        </a>
      </header>

      {/* ── Layout ── */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

        {/* Desktop: 3 columns / Mobile: stacked */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-5 lg:gap-8 justify-center">

          {/* ── LEFT controls — hidden on mobile, shown on lg ── */}
          <div className="hidden lg:flex flex-col items-stretch gap-4 w-52 order-1 flex-shrink-0">
            <DesktopControls
              points={points} spinning={spinning} onSpin={spin}
              lastWin={lastWin} modal={modal} setModal={setModal}
            />
          </div>

          {/* ── CENTRE: wheel ── */}
          <div className="flex flex-col items-center gap-4 order-1 lg:order-2 flex-shrink-0">
            <SpinWheel rotation={rotation} spinning={spinning} winnerIdx={winnerIdx} size={wheelSize} />

            {/* Mobile controls — below wheel, hidden on lg */}
            <div className="lg:hidden w-full max-w-sm space-y-3">
              {/* Points + Spin button side by side */}
              <div className="flex items-center gap-3">
                <div className="flex-1 text-center rounded-2xl py-3"
                  style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>Points</p>
                  <p className="text-3xl font-black tabular-nums" style={{ color:"#fbbf24", textShadow:"0 0 20px rgba(251,191,36,0.5)" }}>
                    {points.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={spin}
                  disabled={spinning}
                  className="flex-1 py-5 rounded-2xl font-black text-xl uppercase tracking-wider disabled:opacity-40 active:scale-95 transition-all"
                  style={{
                    background: spinning ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#f59e0b,#ea580c)",
                    color:      spinning ? "rgba(255,255,255,0.35)" : "#0c0a08",
                    boxShadow:  spinning ? "none" : "0 0 36px rgba(245,158,11,0.5)",
                  }}
                >
                  {spinning ? "…" : "SPIN!"}
                </button>
              </div>

              <DemoCountdown />

              {lastWin && !spinning && !modal && (
                <button onClick={() => setModal(lastWin)}
                  className="w-full text-sm font-semibold px-3 py-2 rounded-xl text-center"
                  style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.45)", border:"1px solid rgba(255,255,255,0.1)" }}>
                  {lastWin.isSpinAgain ? "🎰" : `+${lastWin.points} pts`} — {lastWin.label}
                  <span className="block text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.3)" }}>tap to view result</span>
                </button>
              )}
            </div>
          </div>

          {/* ── RIGHT: leaderboard ── */}
          <div className="w-full sm:max-w-sm lg:max-w-none lg:w-72 order-3 flex-shrink-0">
            <DemoLeaderboard />
          </div>

        </div>
      </main>
    </div>
  );
}

// ─── Desktop-only left column controls ───────────────────────────────────────
function DesktopControls({
  points, spinning, onSpin, lastWin, modal, setModal,
}: {
  points: number; spinning: boolean; onSpin: () => void;
  lastWin: WinResult | null; modal: WinResult | null; setModal: (r: WinResult | null) => void;
}) {
  return (
    <>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color:"rgba(255,255,255,0.45)" }}>Your Points</p>
        <p className="text-5xl font-black tabular-nums" style={{ color:"#fbbf24", textShadow:"0 0 28px rgba(251,191,36,0.55)" }}>
          {points.toLocaleString()}
        </p>
      </div>

      <button
        onClick={onSpin}
        disabled={spinning}
        className="w-full py-4 rounded-2xl font-black text-xl uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        style={{
          background: spinning ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#f59e0b,#ea580c)",
          color:      spinning ? "rgba(255,255,255,0.4)" : "#0c0a08",
          boxShadow:  spinning ? "none" : "0 0 40px rgba(245,158,11,0.55),0 4px 16px rgba(0,0,0,0.4)",
        }}
      >
        {spinning ? "Spinning…" : "SPIN!"}
      </button>

      <DemoCountdown />

      {lastWin && !spinning && !modal && (
        <button onClick={() => setModal(lastWin)}
          className="w-full text-sm font-semibold px-3 py-2 rounded-xl text-center"
          style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.45)", border:"1px solid rgba(255,255,255,0.1)" }}>
          {lastWin.isSpinAgain ? "🎰 Spin Again" : `+${lastWin.points} pts`} — {lastWin.label}
          <span className="block text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.3)" }}>tap to view result</span>
        </button>
      )}

      <details className="w-full">
        <summary className="text-xs cursor-pointer font-semibold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.3)" }}>
          How it works ▾
        </summary>
        <div className="mt-2 space-y-1 text-xs pl-1" style={{ color:"rgba(255,255,255,0.45)" }}>
          <p>• Spin once every 24 hours.</p>
          <p>• Points build on the leaderboard.</p>
          <p>• Top 3 each month win prizes.</p>
          <p>• Newsletter = bonus spin.</p>
          <p>• Resets 1st of every month.</p>
        </div>
      </details>
    </>
  );
}
