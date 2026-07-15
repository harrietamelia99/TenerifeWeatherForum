"use client";

import { useEffect, useRef } from "react";
import { SPIN_SEGMENTS } from "@/lib/spinSegments";
import gsap from "gsap";

// ─── Geometry constants (all in SVG-space pixels) ─────────────────────────────
const SIZE = 500;
const CX = 250, CY = 250, R = 205;
const DEG  = 30;
const LC   = 36;     // marquee light count
const LR   = 232;    // light ring radius
const toRad = (d: number) => (d * Math.PI) / 180;
const hexN  = (s: string) => parseInt(s.replace("#", ""), 16);

/** Polygon points for a wheel segment centred at (0,0) */
function segPoly(i: number, steps = 26): number[] {
  const sa = toRad(i * DEG - 90);
  const ea = toRad((i + 1) * DEG - 90);
  const pts = [0, 0];
  for (let s = 0; s <= steps; s++) {
    const a = sa + (ea - sa) * (s / steps);
    pts.push(R * Math.cos(a), R * Math.sin(a));
  }
  return pts;
}

export interface PixiWheelProps {
  rotation:  number;        // accumulated degrees (same logic as before)
  spinning:  boolean;
  winnerIdx: number | null;
  size?:     number;        // CSS display size in px
}

export default function PixiWheel({
  rotation, spinning: _s, winnerIdx, size = 500,
}: PixiWheelProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  // Everything PixiJS lives here; we use a plain object ref so it survives
  // across the rotation/winnerIdx effect without reinstalling the component.
  const px = useRef<{
    app:         any;
    wheel:       any;         // rotating PIXI.Container
    pLayer:      any;         // particle layer
    PIXI:        any;
    lightPeriod: { v: number }; // mutable speed for ticker
  } | null>(null);

  const spinTween = useRef<gsap.core.Tween | null>(null);

  // ── One-time initialisation ──────────────────────────────────────────────
  useEffect(() => {
    if (!hostRef.current || typeof window === "undefined") return;
    let gone = false;

    (async () => {
      // Only import PIXI — no GlowFilter (we replace shader-based glow with
      // pre-baked circles, cutting render cost from ~4 GPU passes/frame to 0)
      const PIXI = await import("pixi.js");
      if (gone || !hostRef.current) return;

      // ── App — match device pixel ratio for crisp rendering ───────────────
      // GlowFilters are gone so dpr=2 no longer hurts performance.
      // autoDensity=true makes PixiJS scale the canvas CSS size automatically.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const app = new (PIXI as any).Application({
        width: SIZE, height: SIZE,
        backgroundAlpha: 0,
        antialias: true,
        resolution: dpr,
        autoDensity: true,
      }) as any;

      const canvas = app.view as HTMLCanvasElement;
      canvas.style.display = "block";
      hostRef.current.appendChild(canvas);

      // ── Outer ambient glow ring (pre-baked — no shader needed) ───────────
      // A radial gradient of concentric transparent rings reads as "glow"
      // without any per-frame GPU blur pass.
      const halo = new PIXI.Graphics();
      [
        { r: R + 70, a: 0.03, w: 10 },
        { r: R + 58, a: 0.06, w: 10 },
        { r: R + 46, a: 0.10, w: 10 },
      ].forEach(({ r, a, w }) => {
        halo.lineStyle(w, 0xfbbf24, a);
        halo.drawCircle(CX, CY, r);
      });
      app.stage.addChild(halo);

      // ── Metallic gold rim (layered circles) ──────────────────────────────
      const rim = new PIXI.Graphics();
      [
        { r: R + 29, c: 0xfef9c3, a: 0.45, w: 3 },
        { r: R + 24, c: 0xfde68a, a: 0.80, w: 5 },
        { r: R + 18, c: 0xfbbf24, a: 1.00, w: 7 },
        { r: R + 11, c: 0xd97706, a: 0.90, w: 5 },
        { r: R + 4,  c: 0xb45309, a: 0.75, w: 5 },
        { r: R,      c: 0xfef9c3, a: 0.30, w: 2 },
      ].forEach(({ r, c, a, w }) => {
        rim.lineStyle(w, c, a);
        rim.drawCircle(CX, CY, r);
      });
      app.stage.addChild(rim);

      // ── Marquee lights — pre-baked soft glow, no shader ──────────────────
      // Each light = a large semi-transparent amber halo circle (static,
      // drawn once) + a small bright core dot (alpha animated via ticker).
      // Zero GlowFilter passes per frame.
      const lightsCtn = new PIXI.Container() as any;
      app.stage.addChild(lightsCtn);
      const lights: any[] = [];

      for (let i = 0; i < LC; i++) {
        const a  = toRad(i * (360 / LC) - 90);
        const lx = CX + LR * Math.cos(a);
        const ly = CY + LR * Math.sin(a);

        // Static soft halo (drawn once, never changes)
        const glowRing = new PIXI.Graphics();
        glowRing.beginFill(0xfbbf24, 0.18);
        glowRing.drawCircle(0, 0, 13);
        glowRing.endFill();
        glowRing.beginFill(0xfbbf24, 0.10);
        glowRing.drawCircle(0, 0, 18);
        glowRing.endFill();
        glowRing.x = lx; glowRing.y = ly;
        lightsCtn.addChild(glowRing);

        // Animated bright core
        const lg = new PIXI.Graphics();
        lg.beginFill(0xfff8e1, 1);
        lg.drawCircle(0, 0, 5.5);
        lg.endFill();
        lg.x = lx; lg.y = ly;
        lightsCtn.addChild(lg);
        lights.push(lg);
      }

      // Chase effect via PixiJS ticker (never drifts across repeats)
      const lightPeriod = { v: 2.0 };
      app.ticker.add(() => {
        const t = performance.now() / 1000;
        for (let i = 0; i < LC; i++) {
          const phase = ((t / lightPeriod.v) - i / LC + 100) % 1;
          lights[i].alpha = 0.12 + 0.88 * (0.5 + 0.5 * Math.cos(phase * Math.PI * 2));
        }
      });

      // ── Rotating wheel container ─────────────────────────────────────────
      const wheel = new PIXI.Container() as any;
      wheel.x = CX;
      wheel.y = CY;
      app.stage.addChild(wheel);

      // ── Segments ─────────────────────────────────────────────────────────
      SPIN_SEGMENTS.forEach((seg, i) => {
        const g = new PIXI.Graphics();

        // Main fill
        g.beginFill(hexN(seg.color));
        g.drawPolygon(segPoly(i));
        g.endFill();

        // Outer-arc bevel highlight
        const sa = toRad(i * DEG - 90);
        const ea = toRad((i + 1) * DEG - 90);
        g.lineStyle(3.5, 0xffffff, 0.28);
        g.arc(0, 0, R - 2, sa, ea);
        g.lineStyle(1, 0x000000, 0.12);
        g.arc(0, 0, R - 1, sa, ea);
        g.lineStyle(0);

        wheel.addChild(g);
      });

      // Dividers between segments
      const divs = new PIXI.Graphics();
      divs.lineStyle(1.5, 0xffffff, 0.28);
      SPIN_SEGMENTS.forEach((_, i) => {
        const a = toRad(i * DEG - 90);
        divs.moveTo(0, 0).lineTo(R * Math.cos(a), R * Math.sin(a));
      });
      wheel.addChild(divs);

      // ── Segment text (icon + name + points) ─────────────────────────────
      const shadowStyle = {
        dropShadow: true,
        dropShadowDistance: 1.5,
        dropShadowAlpha: 0.9,
        dropShadowBlur: 2,
        dropShadowColor: "#000000",
      };
      const baseFont = { fontFamily: "system-ui, Arial, sans-serif" };

      SPIN_SEGMENTS.forEach((seg, i) => {
        const mid    = i * DEG + DEG / 2 - 90;
        const tAngle = toRad(mid + 90);
        const flip   = mid > 0 && mid < 180 ? Math.PI : 0;

        const tg = new PIXI.Container() as any;
        tg.rotation = tAngle;
        wheel.addChild(tg);

        const add = (text: string, style: object, r: number) => {
          const t = new PIXI.Text(text, { ...baseFont, ...shadowStyle, ...style });
          t.anchor.set(0.5, 0.5);
          t.x = 0;
          t.y = -r;
          t.rotation = flip;
          tg.addChild(t);
          return t;
        };

        const [w1, ...rest] = seg.label.split(" ");
        const w2 = rest.join(" ");

        // Icon emoji
        add(seg.icon, { fontSize: 19 }, 172);
        // Name line 1
        add(w1.toUpperCase(), { fontSize: 10, fontWeight: "900", fill: seg.textColor }, 151);
        // Name line 2
        if (w2) add(w2.toUpperCase(), { fontSize: 10, fontWeight: "900", fill: seg.textColor }, 138);
        // Points or FREE
        if (seg.isSpinAgain) {
          add("FREE", { fontSize: 17, fontWeight: "900", fill: "#ffffff" }, 114);
        } else {
          add(`+${seg.points}`, { fontSize: 20, fontWeight: "900", fill: seg.textColor }, 114);
          add("POINTS", { fontSize: 8, fontWeight: "700", fill: seg.textColor, letterSpacing: 0.5 }, 96);
        }
      });

      // ── Hub — TWF logo circle ────────────────────────────────────────────
      // Logo PNG is 300×56px. The circular icon occupies the leftmost ~56px
      // (full image height). We scale the sprite so the icon fills the hub
      // and apply a circular mask to clip everything else out.
      const hub = new PIXI.Container() as any;

      // White border ring
      const hubOuter = new PIXI.Graphics();
      hubOuter.beginFill(0xffffff); hubOuter.drawCircle(0, 0, 50); hubOuter.endFill();
      hub.addChild(hubOuter);

      // Circular clip mask (radius 44 = display area inside the white ring)
      const hubMask = new PIXI.Graphics();
      hubMask.beginFill(0xffffff); hubMask.drawCircle(0, 0, 44); hubMask.endFill();

      try {
        // Load logo; fromURL returns a Promise in PixiJS v7
        const logoTex = await (PIXI.Texture as any).fromURL("/twf-logo.png");
        const logo = new PIXI.Sprite(logoTex) as any;

        // Scale so the image height fills the hub diameter (88px internal)
        // Logo is 300×56px; icon is ~56×56 (leftmost portion)
        const targetH = 92;
        logo.height = targetH;
        logo.scale.x = logo.scale.y; // preserve aspect ratio

        // Icon centre is at ~half of original image height from left edge.
        // After scaling, icon width ≈ targetH. Position left edge at -targetH/2
        // so the icon is centred at (0,0).
        logo.anchor.set(0, 0.5);
        logo.x = -targetH / 2;
        logo.y = 0;

        hub.addChild(hubMask);
        logo.mask = hubMask;
        hub.addChild(logo);
      } catch {
        // Fallback if the image fails to load
        hubMask.clear();
        hubMask.beginFill(0x0c2340); hubMask.drawCircle(0, 0, 44); hubMask.endFill();
        hub.addChild(hubMask);
      }

      wheel.addChild(hub);

      // ── Particle layer (above wheel) ─────────────────────────────────────
      const pLayer = new PIXI.Container() as any;
      app.stage.addChild(pLayer);

      // ── Pointer ──────────────────────────────────────────────────────────
      const ptrWrap = new PIXI.Container() as any;
      ptrWrap.x = CX;
      const ptr = new PIXI.Graphics();
      // Triangle: apex at top (0,24), base at bottom (±17, 52) → downward drip shape
      ptr.beginFill(0xfbbf24);
      ptr.drawPolygon([0, 24, -17, 52, 17, 52]);
      ptr.endFill();
      ptr.lineStyle(2.5, 0x1a0500);
      ptr.drawPolygon([0, 24, -17, 52, 17, 52]);
      ptr.beginFill(0xfbbf24); ptr.drawCircle(0, 24, 7); ptr.endFill();
      ptr.lineStyle(2, 0xffffff); ptr.drawCircle(0, 24, 6);
      // Pre-baked pointer glow (no shader — just a larger transparent circle behind)
      const ptrGlow = new PIXI.Graphics();
      ptrGlow.beginFill(0xfbbf24, 0.22); ptrGlow.drawCircle(0, 28, 22); ptrGlow.endFill();
      ptrWrap.addChild(ptrGlow);
      ptrWrap.addChild(ptr);
      app.stage.addChild(ptrWrap);

      // Pointer idle bob
      gsap.to(ptrWrap, { y: -6, duration: 1.3, repeat: -1, yoyo: true, ease: "power2.inOut" });

      // ── Store refs ───────────────────────────────────────────────────────
      px.current = { app, wheel, pLayer, PIXI, lightPeriod };
    })();

    return () => {
      gone = true;
      spinTween.current?.kill();
      if (px.current) {
        px.current.app.destroy(true, { children: true });
        px.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── CSS display size ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = hostRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    canvas.style.width  = `${size}px`;
    canvas.style.height = `${size}px`;
  }, [size]);

  // ── Spin rotation ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!px.current || rotation === 0) return;
    const { wheel, lightPeriod } = px.current;
    lightPeriod.v = 0.08; // fast chase while spinning
    if (spinTween.current) spinTween.current.kill();
    spinTween.current = gsap.to(wheel, {
      rotation: toRad(rotation),
      duration: 6,
      ease: "power4.out",
      onComplete: () => { if (px.current) px.current.lightPeriod.v = 2.0; },
    });
  }, [rotation]);

  // ── Win particle burst ───────────────────────────────────────────────────
  useEffect(() => {
    if (winnerIdx === null || !px.current) return;
    const { PIXI, pLayer } = px.current;
    const seg = SPIN_SEGMENTS[winnerIdx];
    const segHex = hexN(seg.color);

    for (let i = 0; i < 100; i++) {
      const g   = new PIXI.Graphics();
      const col = i % 3 === 0 ? 0xfbbf24 : segHex;
      if (Math.random() > 0.45) {
        g.beginFill(col, 0.92); g.drawCircle(0, 0, 3 + Math.random() * 5); g.endFill();
      } else {
        const w = 4 + Math.random() * 8, h = 3 + Math.random() * 4;
        g.beginFill(col, 0.92); g.drawRect(-w / 2, -h / 2, w, h); g.endFill();
      }
      // No GlowFilter on particles — they're fast-moving and briefly visible

      g.x = CX + (Math.random() - 0.5) * 120;
      g.y = CY + (Math.random() - 0.5) * 120;
      pLayer.addChild(g);

      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 240;
      const dur   = 1.0 + Math.random() * 1.2;
      const delay = Math.random() * 0.3;

      gsap.to(g, {
        x: g.x + Math.cos(angle) * speed * dur,
        y: g.y + Math.sin(angle) * speed * dur - 80 + 0.5 * 360 * dur * dur,
        rotation: (Math.random() - 0.5) * 12,
        alpha: 0,
        duration: dur,
        delay,
        ease: "power2.out",
        onComplete: () => { try { pLayer.removeChild(g); g.destroy(); } catch { /* already gone */ } },
      });
    }
  }, [winnerIdx]);

  return (
    <div
      ref={hostRef}
      style={{ width: size, height: size, position: "relative", flexShrink: 0 }}
    />
  );
}
