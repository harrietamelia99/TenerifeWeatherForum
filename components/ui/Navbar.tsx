"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Facebook, ArrowRight } from "lucide-react";

// ─── Desktop nav links (shown at ≥ 1024px) ───────────────────────────────────
const desktopLinks = [
  { href: "/",           label: "Home"       },
  { href: "/weather",    label: "Weather"    },
  { href: "/excursions", label: "Excursions" },
  { href: "/webcams",    label: "Webcams"    },
  { href: "/climate",    label: "Climate"    },
  { href: "/blog",       label: "Blog"       },
  { href: "/resources",  label: "Resources"  },
];

// ─── Full-screen mobile menu links (shown at < 1024px) ───────────────────────
const menuLinks = [
  { href: "/weather",    label: "Weather",              emoji: "🌤" },
  { href: "/excursions", label: "Excursions & Activities", emoji: "🏝" },
  { href: "/webcams",    label: "Webcams",              emoji: "📷" },
  { href: "/climate",    label: "Climate Guide",        emoji: "🌡" },
  { href: "/blog",       label: "Blog & Travel Tips",   emoji: "📖" },
  { href: "/resources",  label: "Resources",            emoji: "✈️" },
  { href: "/spin",       label: "Lucky Spin",           emoji: "🎡" },
  {
    href: "https://www.facebook.com/groups/1826293804889186",
    label: "Join the Community",
    emoji: "👋",
    external: true,
  },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef  = useRef<HTMLDivElement>(null);
  const openBtnRef = useRef<HTMLButtonElement>(null);

  // Close on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Body scroll lock while menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMenuOpen(false); openBtnRef.current?.focus(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen]);

  // Focus trap inside the menu panel
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !menuRef.current) return;
    const focusable = Array.from(
      menuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute("disabled"));
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }, []);

  // Auto-focus first link when menu opens
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      const first = menuRef.current.querySelector<HTMLElement>("a, button");
      first?.focus();
    }
  }, [menuOpen]);

  return (
    <>
      {/* ── Fixed pill navbar ─────────────────────────────────────────────── */}
      <div
        data-site-chrome
        className="fixed top-11 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-3 pointer-events-none"
      >
        <nav
          className="max-w-7xl mx-auto rounded-full pointer-events-auto"
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo.svg"
                  alt="Tenerife Weather Forum"
                  className="h-10 sm:h-11 md:h-12 w-auto"
                  style={{ maxWidth: "260px" }}
                />
              </Link>

              {/* Desktop nav — hidden below 1024px */}
              <div className="hidden lg:flex items-center gap-0.5">
                {desktopLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-4 py-2 rounded-full text-sm transition-all duration-200"
                      style={{
                        background: isActive ? "var(--color-bg)" : "transparent",
                        color:      isActive ? "var(--color-deep)" : "var(--color-text-muted)",
                        fontWeight: isActive ? 600 : 500,
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Desktop right — hidden below 1024px */}
              <div className="hidden lg:flex items-center gap-2">
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
                  href="https://www.tiktok.com/@tenerifeweatherforum"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Tenerife Weather Forum on TikTok"
                  className="p-2 rounded-full bg-[--color-bg] text-[--color-deep] hover:bg-[--color-sky] transition-all duration-200"
                >
                  <TikTokIcon size={15} />
                </a>
                <button
                  type="button"
                  className="btn-primary text-sm py-2 px-5 whitespace-nowrap"
                  style={{ touchAction: "manipulation" }}
                  onClick={() => window.dispatchEvent(new Event("open-forecast-modal"))}
                >
                  Today&apos;s Forecast
                </button>
              </div>

              {/* Mobile / tablet hamburger — hidden at 1024px+ */}
              <button
                ref={openBtnRef}
                type="button"
                onClick={() => setMenuOpen(true)}
                className="lg:hidden p-2 rounded-full bg-[--color-bg] text-[--color-deep] transition-all duration-200"
                style={{ touchAction: "manipulation" }}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu-panel"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* ── Full-screen mobile menu overlay ───────────────────────────────── */}
      {/* Backdrop */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        id="mobile-menu-panel"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        onKeyDown={handleMenuKeyDown}
        className={[
          "lg:hidden fixed inset-y-0 right-0 z-[70] w-full max-w-xs flex flex-col",
          "transition-transform duration-300 ease-out",
          menuOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        style={{
          background: "linear-gradient(160deg, #053f5c 0%, #0a5478 60%, #053f5c 100%)",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.25)",
        }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 pt-14 pb-6 border-b border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-footer.svg"
            alt="Tenerife Weather Forum"
            style={{ height: "36px", width: "auto" }}
          />
          <button
            type="button"
            onClick={() => { setMenuOpen(false); openBtnRef.current?.focus(); }}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
            style={{ touchAction: "manipulation" }}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-1">
          {menuLinks.map((link) => {
            const isActive = !link.external && pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-150 active:scale-[0.98] group"
                style={{
                  background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                  color:      isActive ? "#ffffff" : "rgba(255,255,255,0.72)",
                  fontWeight: isActive ? 700 : 500,
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg leading-none" aria-hidden="true">{link.emoji}</span>
                  {link.label}
                </span>
                <ArrowRight size={14} className="opacity-30 group-hover:opacity-70 transition-opacity" />
              </Link>
            );
          })}
        </nav>

        {/* Panel footer */}
        <div className="px-6 py-5 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <a
              href="https://www.facebook.com/groups/1826293804889186"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
            >
              <Facebook size={16} />
            </a>
            <a
              href="https://www.tiktok.com/@tenerifeweatherforum"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
            >
              <TikTokIcon size={16} />
            </a>
          </div>
          <button
            type="button"
            className="w-full btn-primary text-sm py-3"
            style={{ touchAction: "manipulation" }}
            onClick={() => {
              setMenuOpen(false);
              window.dispatchEvent(new Event("open-forecast-modal"));
            }}
          >
            Today&apos;s Forecast
          </button>
        </div>
      </div>
    </>
  );
}

function TikTokIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.02-.08z" />
    </svg>
  );
}
