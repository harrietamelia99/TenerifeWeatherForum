"use client";

import { ArrowRight } from "lucide-react";

interface Props {
  href: string; // empty string means the affiliate link is not live yet
  label: string;
  id: string;
  category: string;
}

// Fires a GA4 "affiliate_click" event before opening the affiliate link,
// the same way StayBookButton does, so travel clicks show up in analytics
// under their own event_category (for example "flights" or "parking").
export default function TravelLinkButton({ href, label, id, category }: Props) {
  if (!href) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex w-full h-16 items-center justify-center gap-2 px-6 py-2 text-sm font-semibold rounded-full cursor-not-allowed"
        style={{ background: "rgba(66,158,189,0.12)", color: "var(--color-text-muted)" }}
      >
        Coming soon
      </span>
    );
  }

  function handleClick() {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "affiliate_click", {
        link_id: id,
        link_name: label,
        link_url: href,
        event_category: category,
      });
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      onClick={handleClick}
      className="btn-primary w-full h-16 gap-2 px-6 py-2 text-sm font-semibold text-center"
    >
      {label} <ArrowRight size={15} className="flex-shrink-0" />
    </a>
  );
}
