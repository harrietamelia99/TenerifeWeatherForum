"use client";

import { useEffect, useRef } from "react";

// Each cloud layer: image, starting x (% of viewport), y position, width, opacity, speed (% per frame)
const LAYERS = [
  { src: "/images/cloud-11.png", x:  -5, y: "-4%",  w: "62%", op: 0.55, speed: 0.008 },
  { src: "/images/cloud-07.png", x:  55, y:  "1%",  w: "36%", op: 0.48, speed: 0.012 },
  { src: "/images/cloud-11.png", x: 110, y:  "8%",  w: "50%", op: 0.38, speed: 0.008 },
  { src: "/images/cloud-12.png", x:  30, y: "42%",  w: "28%", op: 0.35, speed: 0.006 },
  { src: "/images/cloud-01.png", x:  75, y: "55%",  w: "40%", op: 0.30, speed: 0.009 },
  { src: "/images/cloud-07.png", x: -50, y: "35%",  w: "32%", op: 0.28, speed: 0.007 },
];

export default function HeroClouds() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const positions = useRef(LAYERS.map((l) => l.x));
  const raf = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      LAYERS.forEach((layer, i) => {
        positions.current[i] -= layer.speed;
        // Reset to right side once fully off-screen left
        if (positions.current[i] < -80) {
          positions.current[i] = 115;
        }
        const el = refs.current[i];
        if (el) el.style.left = `${positions.current[i]}%`;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <>
      {LAYERS.map((layer, i) => (
        <div
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          style={{
            position: "absolute",
            top: layer.y,
            left: `${layer.x}%`,
            width: layer.w,
            maxWidth: "800px",
            mixBlendMode: "screen",
            pointerEvents: "none",
            willChange: "left",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={layer.src}
            alt=""
            aria-hidden="true"
            style={{
              width: "100%",
              display: "block",
              opacity: layer.op,
              WebkitMaskImage: "radial-gradient(ellipse 85% 80% at 50% 50%, black 40%, transparent 100%)",
              maskImage: "radial-gradient(ellipse 85% 80% at 50% 50%, black 40%, transparent 100%)",
            }}
          />
        </div>
      ))}
    </>
  );
}
