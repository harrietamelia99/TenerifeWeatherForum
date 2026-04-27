"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Facebook } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/weather", label: "Weather" },
  { href: "/climate", label: "Climate Info" },
  { href: "/blog", label: "Blog" },
  { href: "/resources", label: "Resources" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Floating pill — always pill-shaped */}
      <div className="fixed top-11 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-3">
        <nav
          className="max-w-7xl mx-auto rounded-full"
          style={{
            background: "white",
            boxShadow: "0 4px 24px rgba(5,63,92,0.12), 0 1px 4px rgba(5,63,92,0.08)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="pl-2 pr-3 sm:pl-3 sm:pr-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center flex-shrink-0">
                {/* Full logo at all sizes */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo.svg"
                  alt="Tenerife Weather Forum"
                  className="h-10 sm:h-11 md:h-12 w-auto"
                  style={{ maxWidth: "260px" }}
                />
              </Link>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-0.5">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-4 py-2 rounded-full text-sm transition-all duration-200"
                      style={{
                        background: isActive ? "var(--color-bg)" : "transparent",
                        color: isActive ? "var(--color-deep)" : "var(--color-text-muted)",
                        fontWeight: isActive ? 600 : 500,
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Desktop right: social + CTA */}
              <div className="hidden md:flex items-center gap-2">
                <a
                  href="https://www.facebook.com/groups/1826293804889186"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Tenerife Weather Forum on Facebook"
                  className="p-2 rounded-full bg-[--color-bg] text-[--color-deep] hover:bg-[--color-sky] transition-all duration-200"
                >
                  <Facebook size={15} />
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Tenerife Weather Forum on TikTok"
                  className="p-2 rounded-full bg-[--color-bg] text-[--color-deep] hover:bg-[--color-sky] transition-all duration-200"
                >
                  <TikTokIcon size={15} scrolled={true} />
                </a>
                <button
                  className="btn-primary text-sm py-2 px-5 whitespace-nowrap"
                  onClick={() => window.dispatchEvent(new Event("open-forecast-modal"))}
                >
                  Today&apos;s Forecast
                </button>
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-full bg-[--color-bg] text-[--color-deep] transition-all duration-200"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile dropdown — separate card below the pill */}
        <div
          className={`md:hidden mt-2 max-w-7xl mx-auto rounded-3xl overflow-hidden transition-all duration-300 ${
            menuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
          style={{
            background: "white",
            boxShadow: "0 8px 32px rgba(5,63,92,0.14)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="p-3 flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center px-4 py-3.5 rounded-full text-sm font-medium transition-all duration-150 active:scale-[0.98]"
                  style={{
                    background: isActive ? "var(--color-bg)" : "transparent",
                    color: isActive ? "var(--color-deep)" : "var(--color-text-muted)",
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div
            className="flex items-center gap-2 px-4 py-4 border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            <a
              href="https://www.facebook.com/groups/1826293804889186"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2.5 rounded-full bg-[--color-bg] text-[--color-deep] hover:bg-[--color-sky] transition-all"
            >
              <Facebook size={16} />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="p-2.5 rounded-full bg-[--color-bg] text-[--color-deep] hover:bg-[--color-sky] transition-all"
            >
              <TikTokIcon size={16} scrolled={true} />
            </a>
            <button
              className="btn-primary text-sm py-2.5 px-5 ml-auto"
              onClick={() => window.dispatchEvent(new Event("open-forecast-modal"))}
            >
              Today&apos;s Forecast
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function SunLogoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="sun-logo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffcc55" />
          <stop offset="100%" stopColor="#f7ad19" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="5" fill="url(#sun-logo)" />
      <g stroke="#f7ad19" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
        <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
        <line x1="19.07" y1="4.93" x2="17.66" y2="6.34" />
        <line x1="6.34" y1="17.66" x2="4.93" y2="19.07" />
      </g>
    </svg>
  );
}

function TikTokIcon({ size, scrolled }: { size: number; scrolled: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={scrolled ? "#053f5c" : "white"}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.02-.08z" />
    </svg>
  );
}
