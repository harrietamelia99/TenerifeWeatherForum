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
// Booking.com UK evergreen link via CJ (property 101721309, link 15734754).
// Swap an area to its own deep link in stayLinks below when you have one.
export const defaultStayLink = "https://www.anrdoezrs.net/click-101721309-15734754";

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

// Getting there: flights, parking and transfers.
// Same rule as above: a blank link renders a disabled "Coming soon" button.
export const gettingThereLinks = {
  // Skyscanner via Impact (approved 16 Nov 2026). 40% booking, 20% redirect, 30 day window.
  skyscanner: "https://skyscanner.pxf.io/KBNkMe",
  // Holiday Extras via AWIN (approved 3 Nov 2026). Parking, transfers, hotels, lounges, car hire.
  holidayExtras: "https://www.awin1.com/cread.php?awinmid=3496&awinaffid=3142265",
};

// GetYourGuide things-to-do links, one per resort. Uses the same partner ID as the Excursions page.
// These open GetYourGuide search results for the resort. Swap in a specific location page
// in place of the search link if Kevin has one he prefers.
export const gygPartnerId = "NHPMSZ1";

export function getThingsToDoLink(areaName: string): string {
  return "https://www.getyourguide.com/s/?q=" + encodeURIComponent(areaName + " Tenerife") + "&partner_id=" + gygPartnerId;
}
