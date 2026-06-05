"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie-consent")) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem("cookie-consent", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      style={{
        background: "rgba(5,63,92,0.97)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
      role="region"
      aria-label="Cookie and affiliate notice"
    >
      <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)", maxWidth: "780px" }}>
        We use cookies to improve your experience and analyse site traffic.
        Some links on this site are affiliate links — if you book through them we may earn a small commission at no extra cost to you.{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-white transition-colors">
          Privacy policy
        </Link>
      </p>
      <button
        onClick={dismiss}
        className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-150"
        style={{
          background: "rgba(255,255,255,0.12)",
          color: "white",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
      >
        Got it
      </button>
    </div>
  );
}
