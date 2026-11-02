// Central place for accommodation affiliate links (CJ / Awin / Booking.com).
//
// How to use:
//   1. Once an affiliate programme approves the site, paste the tracking link
//      into the matching entry below.
//   2. Leave an entry as "" (or "#") until then. A blank link renders a
//      disabled "Coming soon" button, so no dead links ever go live.
//
// Nothing else in the site needs to change when a link is added.

export type StayAreaId =
  | "costa-adeje"
  | "playa-de-las-americas"
  | "los-cristianos"
  | "puerto-de-la-cruz"
  | "santa-cruz"
  | "el-medano";

// Used for any area that does not have its own link yet.
export const defaultStayLink = "";

export const stayLinks: Record<StayAreaId, string> = {
  "costa-adeje": "",
  "playa-de-las-americas": "",
  "los-cristianos": "",
  "puerto-de-la-cruz": "",
  "santa-cruz": "",
  "el-medano": "",
};

// Returns a usable URL, or an empty string if no real link has been added yet.
export function getStayLink(id: StayAreaId): string {
  const link = (stayLinks[id] || defaultStayLink || "").trim();
  return link && link !== "#" ? link : "";
}
