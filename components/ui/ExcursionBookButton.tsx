"use client";

import { ArrowRight } from "lucide-react";

interface Props {
  href:  string;
  title: string;
  id:    string;
}

// Fires a GA4 event before opening the affiliate link.
// Marking 'affiliate_click' as a conversion in GA4 makes the session
// count as "engaged", which removes it from the bounce-rate calculation.
export default function ExcursionBookButton({ href, title, id }: Props) {
  function handleClick() {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "affiliate_click", {
        excursion_id:   id,
        excursion_name: title,
        link_url:       href,
        event_category: "excursion",
      });
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold"
    >
      Book This Activity <ArrowRight size={15} />
    </a>
  );
}
