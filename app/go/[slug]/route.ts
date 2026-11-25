import { NextResponse } from "next/server";
import { defaultStayLink, gettingThereLinks } from "@/lib/affiliateLinks";

// Short, tidy links for sharing, for example tenerifeweatherforum.com/go/skyscanner.
// Each one redirects straight to the tracked affiliate link (one click, no stop on our site).
// To add or change one, edit the targets below or the links in lib/affiliateLinks.ts.
const targets: Record<string, string> = {
  skyscanner: gettingThereLinks.skyscanner,
  booking: defaultStayLink,
  // Booking.com Black Friday deals (CJ). Runs until 2 December 2026.
  "booking-black-friday": "https://www.anrdoezrs.net/click-101721309-17382508",
  "holiday-extras": gettingThereLinks.holidayExtras,
};

export function GET(request: Request, { params }: { params: { slug: string } }) {
  const target = targets[params.slug];
  if (!target) {
    // Unknown short link: send people to the home page rather than an error.
    return NextResponse.redirect(new URL("/", request.url), 302);
  }
  const response = NextResponse.redirect(target, 302);
  // Keep these redirect links out of search results.
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
