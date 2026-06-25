"use client";

import { useState, useEffect } from "react";

interface SpinCountdownProps {
  nextSpinAt: string | null; // ISO string, or null if can spin now
  bonusAvailable: boolean;
  onExpired: () => void;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function SpinCountdown({ nextSpinAt, bonusAvailable, onExpired }: SpinCountdownProps) {
  const [msLeft, setMsLeft] = useState<number>(0);

  useEffect(() => {
    if (!nextSpinAt || bonusAvailable) return;

    const tick = () => {
      const remaining = new Date(nextSpinAt).getTime() - Date.now();
      if (remaining <= 0) {
        setMsLeft(0);
        onExpired();
      } else {
        setMsLeft(remaining);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextSpinAt, bonusAvailable, onExpired]);

  if (!nextSpinAt || msLeft <= 0) return null;

  const totalSeconds = Math.ceil(msLeft / 1000);
  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="text-center py-3 px-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
        Next spin available in
      </p>
      <div className="flex items-center justify-center gap-1">
        {[
          { label: "hrs",  val: pad(hours)   },
          { label: "min",  val: pad(minutes) },
          { label: "sec",  val: pad(seconds) },
        ].map(({ label, val }, idx) => (
          <div key={label} className="flex items-center gap-1">
            {idx > 0 && <span className="text-xl font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>:</span>}
            <div className="flex flex-col items-center">
              <span
                className="text-3xl font-black tabular-nums"
                style={{ color: "#fbbf24", textShadow: "0 0 20px rgba(251,191,36,0.4)" }}
              >
                {val}
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
            </div>
          </div>
        ))}
      </div>
      {bonusAvailable && (
        <p className="text-xs mt-2 font-semibold" style={{ color: "#34d399" }}>
          ✦ You have a bonus spin available!
        </p>
      )}
    </div>
  );
}
