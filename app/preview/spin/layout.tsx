"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

// Hide the global site chrome (ticker, navbar, footer) while any spin page is
// active, then restore everything when navigating away.
function HideSiteChrome() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-site-chrome]")
    );
    els.forEach((el) => { el.style.visibility = "hidden"; el.style.pointerEvents = "none"; });
    document.body.style.overflow = "hidden"; // prevent background scroll
    return () => {
      els.forEach((el) => { el.style.visibility = ""; el.style.pointerEvents = ""; });
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
