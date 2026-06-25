"use client";

import { SPIN_SEGMENTS } from "@/lib/spinSegments";

export interface WinResult {
  segmentIndex: number;
  label:        string;
  points:       number;
  isSpinAgain:  boolean;
}

const SPARKLES = [
  { x:"15%",y:"20%",size:8, delay:0    }, { x:"80%",y:"15%",size:12,delay:.10 },
  { x:"10%",y:"65%",size:6, delay:.20  }, { x:"88%",y:"60%",size:10,delay:.15 },
  { x:"50%",y:"8%", size:7, delay:.05  }, { x:"25%",y:"85%",size:9, delay:.25 },
  { x:"72%",y:"82%",size:11,delay:.30  }, { x:"90%",y:"35%",size:6, delay:.18 },
];

interface WinModalProps {
  result:    WinResult;
  onDismiss: () => void;
}

export default function WinModal({ result, onDismiss }: WinModalProps) {
  const color = SPIN_SEGMENTS[result.segmentIndex]?.color ?? "#053f5c";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(2,15,30,0.88)", backdropFilter: "blur(6px)" }}
      onClick={onDismiss}
    >
      <style>{`
        @keyframes popIn  { 0%{opacity:0;transform:scale(.4) translateY(24px)} 65%{transform:scale(1.06) translateY(-6px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes floatUp{ 0%{opacity:0;transform:translateY(0) scale(0)} 20%{opacity:1;transform:translateY(-12px) scale(1)} 80%{opacity:1} 100%{opacity:0;transform:translateY(-60px) scale(.5)} }
        @keyframes shimmer{ 0%,100%{opacity:.6} 50%{opacity:1} }
      `}</style>

      {/* Sparkles */}
      {!result.isSpinAgain && SPARKLES.map((s, i) => (
        <div key={i} className="absolute pointer-events-none rounded-full"
          style={{ left:s.x, top:s.y, width:s.size, height:s.size,
            background: i % 2 === 0 ? "#fbbf24" : "#ffffff",
            animation: `floatUp 1.6s ease-out ${s.delay}s forwards` }} />
      ))}

      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden text-center"
        style={{
          animation: "popIn .5s cubic-bezier(.34,1.56,.64,1) forwards",
          background: result.isSpinAgain
            ? "linear-gradient(160deg,#1a0505,#3b0808)"
            : `linear-gradient(160deg,#051525,${color}22 60%,#051525)`,
          border: `2px solid ${result.isSpinAgain ? "rgba(239,68,68,.5)" : "rgba(251,191,36,.5)"}`,
          boxShadow: result.isSpinAgain
            ? "0 0 60px rgba(239,68,68,.35),0 20px 60px rgba(0,0,0,.6)"
            : "0 0 60px rgba(251,191,36,.3),0 20px 60px rgba(0,0,0,.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-2 w-full" style={{ background: result.isSpinAgain ? "#dc2626" : color }} />

        <div className="px-8 py-8">
          <div className="text-6xl mb-3 leading-none" style={{ animation: "shimmer 1.4s ease-in-out infinite" }}>
            {result.isSpinAgain ? "🎰" : result.points >= 150 ? "🌋" : result.points >= 75 ? "🌟" : result.points >= 30 ? "☀️" : "🎉"}
          </div>

          {result.isSpinAgain ? (
            <>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,.45)" }}>Lucky!</p>
              <h2 className="text-4xl font-black text-red-400 mb-2">Spin Again!</h2>
              <p className="text-base" style={{ color: "rgba(255,255,255,.6)" }}>
                You landed on <strong style={{ color: "white" }}>Spin Again</strong> — spin the wheel for free right now!
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,.45)" }}>You won</p>
              <p className="text-lg font-bold mb-1" style={{ color: "rgba(255,255,255,.75)" }}>{result.label}</p>
              <h2 className="text-7xl font-black tabular-nums mb-1"
                style={{ color: "#fbbf24", textShadow: "0 0 40px rgba(251,191,36,.7),0 0 80px rgba(251,191,36,.3)" }}>
                +{result.points}
              </h2>
              <p className="text-lg font-bold" style={{ color: "rgba(255,255,255,.5)" }}>points</p>
            </>
          )}

          <button
            onClick={onDismiss}
            className="mt-7 w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider active:scale-95 transition-transform"
            style={{
              background: result.isSpinAgain ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "linear-gradient(135deg,#f59e0b,#ea580c)",
              color: "#0c0a08",
              boxShadow: result.isSpinAgain ? "0 0 30px rgba(220,38,38,.5)" : "0 0 30px rgba(245,158,11,.5)",
            }}
          >
            {result.isSpinAgain ? "Spin Again Now! 🎰" : "Collect Points! ✦"}
          </button>
          <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,.2)" }}>tap anywhere to close</p>
        </div>
      </div>
    </div>
  );
}
