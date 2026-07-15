"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

// Hide the global site chrome (ticker, navbar, footer) while any spin page is
// active. On desktop (≥1024px) the weather ticker is repositioned to the
// bottom of the viewport instead of being hidden.
function HideSiteChrome() {
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;

    const chromeEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-site-chrome]")
    );
    const ticker = document.querySelector<HTMLElement>("[data-weather-ticker]");

    chromeEls.forEach((el) => {
      el.style.visibility = "hidden";
      el.style.pointerEvents = "none";
    });

    // On desktop: show ticker pinned to bottom instead
    if (isDesktop && ticker) {
      ticker.style.visibility = "visible";
      ticker.style.pointerEvents = "auto";
      ticker.style.top = "auto";
      ticker.style.bottom = "0";
      ticker.style.zIndex = "40";
    }

    document.body.style.overflow = "hidden";

    return () => {
      chromeEls.forEach((el) => {
        el.style.visibility = "";
        el.style.pointerEvents = "";
      });
      if (ticker) {
        ticker.style.top = "";
        ticker.style.bottom = "";
        ticker.style.zIndex = "";
      }
      document.body.style.overflow = "";
    };
  }, []);
  return null;
}

export default function SpinLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <HideSiteChrome />
      {children}
    </SessionProvider>
  );
}
