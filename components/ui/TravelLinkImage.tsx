"use client";

import Image from "next/image";

interface Props {
  href: string; // empty string means the affiliate link is not live yet
  src: string;
  alt: string;
  width?: number;
  height?: number;
  id: string;
  category: string;
  position?: string;
}

// A clickable partner banner. Uses the supplier's official banner image and
// the tracked affiliate link, and fires the same GA4 "affiliate_click" event
// as TravelLinkButton so banner clicks show up in analytics too.
//
// Every banner is shown in the same 4:3 box (the shape of the Skyscanner banner).
// Wider banners are cropped from the right so their corner logo stays visible.
const panelClass = "relative block w-full mb-5 aspect-[4/3] overflow-hidden rounded-xl";
const panelStyle = {};

export default function TravelLinkImage({ href, src, alt, id, category, position = 'right center' }: Props) {
  const picture = (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 768px) 33vw, 100vw"
      className="object-cover"
      style={{ objectPosition: position }}
    />
  );

  if (!href) {
    return (
      <div className={panelClass} style={panelStyle}>
        {picture}
      </div>
    );
  }

  function handleClick() {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "affiliate_click", {
        link_id: id,
        link_name: alt,
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
      className={panelClass}
      style={panelStyle}
    >
      {picture}
    </a>
  );
}
