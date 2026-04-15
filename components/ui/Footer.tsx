import Link from "next/link";
import { Facebook, Mail } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/weather", label: "Weather" },
  { href: "/climate", label: "Climate Info" },
  { href: "/blog", label: "Blog" },
  { href: "/resources", label: "Resources" },
];

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.02-.08z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: "var(--gradient-ocean)" }} className="text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-footer.svg"
                alt="Tenerife Weather Forum"
                style={{ height: "44px", width: "auto", maxWidth: "250px" }}
              />
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Your trusted guide to Tenerife&apos;s weather, microclimates, and travel conditions. Updated daily for UK visitors and Tenerife residents.
            </p>

            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tenerife Weather Forum on Facebook"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-white"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tenerife Weather Forum on TikTok"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-white"
              >
                <TikTokIcon />
              </a>
              <a
                href="mailto:hello@tenerifeweatherforum.com"
                aria-label="Email us"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-white"
              >
                <Mail size={18} />
              </a>
            </div>

            {/* Future: TikTok feed + Facebook group widget */}
            {/* Future: embed TikTok latest video feed and Facebook group widget in sidebar */}
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-white/90 mb-5 text-sm uppercase tracking-widest">Navigate</h3>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white/90 mb-5 text-sm uppercase tracking-widest">Resources</h3>
            <ul className="flex flex-col gap-3 text-sm text-white/60">
              <li>
                <Link href="/resources" className="hover:text-white transition-colors duration-200">
                  Booking & Flights
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white transition-colors duration-200">
                  Transport Guide
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white transition-colors duration-200">
                  Live Weather Tools
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors duration-200">
                  Packing Lists
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white transition-colors duration-200">
                  Tourist Information
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Tenerife Weather Forum. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-white/40 text-xs">
              Weather data is indicative only. Always check official forecasts before travelling.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
