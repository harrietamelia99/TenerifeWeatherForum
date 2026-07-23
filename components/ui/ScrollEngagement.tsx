"use client";

import { useEffect, useRef } from "react";

// Fires a GA4 'scroll_engagement' event the first time the user scrolls
// past the given threshold (default 50% of the page height).
// GA4 counts any session with a key event as "engaged", removing it from
// the bounce rate calculation.
export default function ScrollEngagement({ threshold = 0.5 }: { threshold?: number }) {
  const fired = useRef(false);

  useEffect(() => {
    function onScroll() {
      if (fired.current) return;
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrolled / total >= threshold) {
        fired.current = true;
        if (typeof (window as any).gtag === "function") {
          (window as any).gtag("event", "scroll_engagement", {
            percent_scrolled: Math.round(threshold * 100),
            page_path: window.location.pathname,
          });
        }
        window.removeEventListener("scroll", onScroll);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return null;
}
