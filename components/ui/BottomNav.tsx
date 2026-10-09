"use client";

/**
 * BottomNav — mobile / tablet sticky bottom navigation (< 1024px only).
 *
 * 4 items from the config array below (label, href, icon).
 * Hidden only on /spin/admin and /admin routes.
 * All other /spin/* pages (game, login, register, forgot-password, reset-password)
 * show the bar, with Lucky Spin marked as the active item.
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

// Only hide on internal admin routes — all public spin pages get the bar
const HIDDEN_PREFIXES = ["/spin/admin", "/admin"];

export default function BottomNav() {
  const pathname = usePathname();

  const hidden = HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (hidden) return null;

  return (
    <nav
      aria-label="Main"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex"
      style={{
        background: "linear-gradient(135deg, #429ebd 0%, #053f5c 100%)",
        boxShadow: "0 -1px 0 rgba(255,255,255,0.12), 0 -8px 32px rgba(0,0,0,0.18)",
        paddingBottom: "env(safe-area-inset-bottom)",
        height: "calc(64px + env(safe-area-inset-bottom))",
      }}
    >
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        // Lucky Spin is active on /spin and ALL /spin/* sub-routes
        const isActive =
          href === "/spin"
            ? pathname === "/spin" || pathname.startsWith("/spin/")
            : pathname === href || pathname.startsWith(href + "/");

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "relative flex-1 flex flex-col items-center justify-center gap-0.5",
              "transition-colors duration-150",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white",
              "rounded-none",
            ].join(" ")}
            style={{
              color: "#ffffff",
              opacity: isActive ? 1 : 0.65,
              minHeight: "44px",
            }}
          >
            {/* Active indicator — thin white bar at top of item */}
            {isActive && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0,
                  left: "20%",
                  right: "20%",
                  height: "3px",
                  borderRadius: "0 0 4px 4px",
                  background: "#ffffff",
                }}
              />
            )}

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
