"use client";

import { ArrowRight } from "lucide-react";

interface Props {
  href: string; // empty string means the affiliate link is not live yet
  title: string;
  id: string;
}

// Fires a GA4 "affiliate_click" event before opening the affiliate link,
// the same way ExcursionBookButton does, so accommodation clicks show up in
// analytics separately (event_category: "accommodation").
export default function StayBookButton({ href, title, id }: Props) {
  if (!href) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-full cursor-not-allowed"
        style={{ background: "rgba(66,158,189,0.12)", color: "var(--color-text-muted)" }}
      >
        Coming soon
      </span>
    );
  }

  function handleClick() {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "affiliate_click", {
        stay_id: id,
        stay_name: title,
        link_url: href,
        event_category: "accommodation",
      });
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      onClick={handleClick}
      className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold"
    >
      Find hotels in {title} <ArrowRight size={15} />
    </a>
  );
}
