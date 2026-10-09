"use client";

/**
 * BottomNav — mobile / tablet sticky bottom navigation (< 1024px only).
 *
 * 4 items from the config array below (label, href, icon).
 * Hidden on /spin/* and /admin/* routes — spin is a full-screen game
 * with its own chrome, admin is internal tooling.
 * Uses aria-current="page" and visible focus styles for accessibility.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloudSun, Sparkles, MapPin, Camera } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Config — swap items here without touching the component ──────────────────
const NAV_ITEMS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Forecast",    href: "/weather",    icon: CloudSun  },
  { label: "Lucky Spin",  href: "/spin",        icon: Sparkles  },
  { label: "Excursions",  href: "/excursions",  icon: MapPin    },
  { label: "Webcam",      href: "/webcams",     icon: Camera    },
];

const HIDDEN_PREFIXES = ["/spin/", "/spin/admin", "/admin"];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on spin sub-routes (game, login, register, admin) and admin routes
  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));
  if (hidden) return null;

  return (
    <nav
      aria-label="Main"
      // lg:hidden — desktop keeps its header nav unchanged
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex"
      style={{
        background: "linear-gradient(180deg, #1a56db 0%, #1648c2 100%)",
        boxShadow: "0 -1px 0 rgba(255,255,255,0.12), 0 -8px 32px rgba(0,0,0,0.18)",
        // Clear the iPhone home indicator
        paddingBottom: "env(safe-area-inset-bottom)",
        height: "calc(64px + env(safe-area-inset-bottom))",
      }}
    >
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        // /spin exact match is active only on /spin itself
        const isActive =
          href === "/spin"
            ? pathname === "/spin"
            : pathname === href || pathname.startsWith(href + "/");

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={[
              // Tap target ≥ 44px
              "flex-1 flex flex-col items-center justify-center gap-0.5",
              "transition-colors duration-150",
              // Visible keyboard focus
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white",
              "rounded-none", // let focus ring flush with bar
            ].join(" ")}
            style={{
              color: isActive ? "#ffffff" : "rgba(255,255,255,0.52)",
              minHeight: "44px",
            }}
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.5 : 1.75}
              aria-hidden="true"
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: isActive ? 700 : 500,
                letterSpacing: "0.02em",
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
