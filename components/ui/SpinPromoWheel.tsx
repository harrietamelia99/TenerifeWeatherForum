"use client";

import { useEffect, useRef, useState } from "react";

export default function SpinPromoWheel() {
  const ref  = useRef<HTMLImageElement>(null);
  const [deg, setDeg] = useState(0);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;
          // Spin 1080° (3 full rotations) then settle — eased out
          setDeg(1080);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src="/images/spin-wheel-promo.png"
      alt="Lucky Spin wheel"
      style={{
        width: "clamp(220px, 26vw, 360px)",
        height: "auto",
        display: "block",
        transform: `rotate(${deg}deg)`,
        transition: deg > 0 ? "transform 2.4s cubic-bezier(0.17, 0.67, 0.21, 1.0)" : "none",
        filter: "drop-shadow(0 4px 24px rgba(251,191,36,0.35)) drop-shadow(0 8px 20px rgba(0,0,0,0.4))",
      }}
    />
  );
}
