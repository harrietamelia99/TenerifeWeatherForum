import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Info, MapPin } from "lucide-react";
import StayBookButton from "@/components/ui/StayBookButton";
import Image from "next/image";
import TravelLinkButton from "@/components/ui/TravelLinkButton";
import TravelLinkImage from "@/components/ui/TravelLinkImage";
import TravelTextLink from "@/components/ui/TravelTextLink";
import { socialLinks } from "@/lib/socialLinks";
import { getStayLink, getThingsToDoLink, gettingThereLinks, type StayAreaId } from "@/lib/affiliateLinks";

// Hidden preview: not linked from the navigation or sitemap, and kept out of
// search results until it is ready to go live.
export const metadata: Metadata = {
  title: "Where to Stay in Tenerife",
  description:
    "Compare the main areas to stay in Tenerife, from sunny Costa Adeje to the green north coast, with the typical weather, what each suits and how to get there.",
  openGraph: {
    title: "Where to Stay in Tenerife | Tenerife Weather Forum",
    description:
      "Compare the main areas to stay in Tenerife by weather and what suits you, plus flights, airport parking and transfers.",
    type: "website",
    siteName: "Tenerife Weather Forum",
  },
  robots: { index: false, follow: false },
};

const areas: {
  id: StayAreaId;
  name: string;
  region: string;
  gradient: string;
  image?: string;
  weather: string;
  summary: string;
  suits: string;
  highlights: string[];
}[] = [
  {
    id: "costa-adeje",
    weather: "Among the sunniest and driest parts of the island, usually sheltered from the cloud that settles in the north.",
    name: "Costa Adeje",
    region: "South-west coast",
    gradient: "linear-gradient(135deg, #053f5c, #429ebd)",
    image: "/images/hero-coastline.jpg",
    summary:
      "The polished end of the south coast, with large resort hotels, villas and some of the island's best-kept beaches. It is also the closest base for Siam Park.",
    suits: "Families and couples who want a comfortable resort stay.",
    highlights: ["Calm, sheltered beaches", "Close to Siam Park", "Resort hotels and villas", "Sunniest part of the island"],
  },
  {
    id: "playa-de-las-americas",
    weather: "Sunny and dry for much of the year like the rest of the south-west, with very little rain.",
    name: "Playa de las Américas",
    region: "South-west coast",
    gradient: "linear-gradient(135deg, #f7ad19, #e06c00)",
    image: "/images/playa-de-las-americas.jpg",
    summary:
      "The busiest resort on the island, with a long seafront promenade, bars, restaurants and nightlife. There is a huge choice of apartments and hotels at every price.",
    suits: "Groups and first-time visitors who want plenty going on.",
    highlights: ["Nightlife and live music", "Seafront promenade", "Wide choice of apartments", "Lots of places to eat"],
  },
  {
    id: "los-cristianos",
    weather: "Sunny and dry like the rest of the south coast, and usually warmer and clearer than the north.",
    name: "Los Cristianos",
    region: "South coast",
    gradient: "linear-gradient(135deg, #2d6a4f, #1b4332)",
    image: "/images/los-cristianos.jpg",
    summary:
      "A working harbour town with a relaxed feel, a town beach and an easy promenade walk. Ferries leave from here for La Gomera.",
    suits: "Couples and anyone after a quieter, easy-going base.",
    highlights: ["Town beach and promenade", "Ferries to La Gomera", "Relaxed pace", "Good local restaurants"],
  },
  {
    id: "puerto-de-la-cruz",
    weather: "Greener and a little cooler than the south, with more cloud and the odd shower, especially in winter.",
    name: "Puerto de la Cruz",
    region: "North coast",
    gradient: "linear-gradient(135deg, #0f0c29, #302b63)",
    image: "/images/puerto-de-la-cruz.png",
    summary:
      "A historic seaside town on the green north coast, known for its old streets, the Lago Martiánez sea-water pools and the botanical garden. Loro Parque is nearby.",
    suits: "Visitors who want character and scenery over big resorts.",
    highlights: ["Historic old town", "Lago Martiánez pools", "Close to Loro Parque", "Lush northern scenery"],
  },
  {
    id: "santa-cruz",
    weather: "Warm all year, but cloudier than the south, with a little less rain than the green north-west coast.",
    name: "Santa Cruz de Tenerife",
    region: "North-east coast",
    gradient: "linear-gradient(135deg, #b05c2c, #8b2500)",
    image: "/images/santa-cruz-sunset.png",
    summary:
      "The island's capital, with museums, markets, a lively food scene and the Auditorio. Las Teresitas beach is a short drive away.",
    suits: "City breaks, culture and visitors who want to see local life.",
    highlights: ["Museums and markets", "Las Teresitas beach nearby", "Local food scene", "Year-round city life"],
  },
  {
    id: "el-medano",
    weather: "Sunny and dry, and one of the windiest spots on the island, which is why watersports fans love it.",
    name: "El Médano",
    region: "South-east coast",
    gradient: "linear-gradient(135deg, #c45911, #f7ad19)",
    image: "/images/el-medano.jpg",
    summary:
      "A laid-back beach village that is one of Europe's best spots for windsurfing and kitesurfing. It is also about ten minutes from Tenerife South airport.",
    suits: "Watersports fans and anyone wanting a quiet village base.",
    highlights: ["Windsurf and kitesurf schools", "Long town beach", "Near Tenerife South airport", "Relaxed village feel"],
  },
];

const gettingThere: {
  id: string;
  title: string;
  summary: string;
  label: string;
  category: string;
  href: string;
  image?: { src: string; alt: string; width: number; height: number; position?: string };
}[] = [
  {
    id: 'flights',
    title: 'Flights to Tenerife',
    summary: 'Compare flights from UK airports and other departure points, then pick the time and price that suits you.',
    label: 'Compare flights',
    category: 'flights',
    href: gettingThereLinks.skyscanner,
    image: { src: '/partners/skyscanner-flights.png', alt: 'Skyscanner: compare flights to Tenerife', width: 608, height: 456 },
  },
  {
    id: 'airport-parking',
    title: 'Airport parking',
    summary: 'Sort your parking at the UK airport before you fly so you are not looking for a space on the day.',
    label: 'Book airport parking',
    category: 'parking',
    href: gettingThereLinks.holidayExtras,
    image: { src: '/partners/holiday-extras-parking.jpg', alt: 'Holiday Extras airport parking', width: 600, height: 200, position: '15% center' },
  },
  {
    id: 'transfers',
    title: 'Transfers',
    summary: 'Arrange a transfer so you are not working out transport after you land.',
    label: 'Book transfers',
    category: 'transfers',
    href: gettingThereLinks.holidayExtras,
    image: { src: '/partners/holiday-extras-transfers.jpg', alt: 'Holiday Extras airport transfers', width: 600, height: 200 },
  },
];

export default function WhereToStayPreviewPage() {
  return (
    <div style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div
        className="pt-36 sm:pt-40 lg:pt-44 pb-12 sm:pb-16 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #9fe7f5 0%, #429ebd 45%, #053f5c 100%)" }}
      >
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full opacity-20" style={{ background: "var(--color-sky)", filter: "blur(80px)" }} aria-hidden="true" />
        <div className="absolute -right-10 bottom-0 w-60 h-60 rounded-full opacity-15" style={{ background: "var(--color-sun)", filter: "blur(60px)" }} aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href="/" className="flex w-fit items-center gap-1.5 text-white/60 text-sm mb-5 hover:text-white transition-colors">
            <ArrowRight size={13} className="rotate-180" /> Home
          </Link>
          <span className="tag-pill mb-4 inline-block">Preview - not live yet</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Where to Stay in Tenerife</h1>
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
            Tenerife&apos;s weather changes a lot from one coast to another, so where you stay shapes your holiday.
            Here is how the main areas compare.
          </p>
        </div>
      </div>

      {/* Areas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div
          className="flex items-start gap-3 rounded-2xl px-5 py-4 mb-8 max-w-3xl"
          style={{ background: "rgba(66,158,189,0.12)", color: "var(--color-deep)" }}
          role="note"
        >
          <Info size={18} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm leading-relaxed">
            Some links on this page are affiliate links. If you book through them we may earn a small commission at no
            extra cost to you.{" "}
            <Link href="/affiliate-disclosure" className="font-semibold underline underline-offset-2 hover:opacity-80">
              Read our affiliate disclosure
            </Link>
            .
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {areas.map((area) => (
            <article
              key={area.id}
              id={area.id}
              className="rounded-3xl overflow-hidden shadow-xl flex flex-col"
              style={{ background: "#fff" }}
            >
              <div className="relative h-56 text-white" style={{ background: area.gradient }}>
                {area.image && (
                <Image
                  src={area.image}
                  alt={area.name + ", " + area.region}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(5,63,92,0.85) 0%, rgba(5,63,92,0.25) 60%, rgba(5,63,92,0.05) 100%)" }}
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 px-6 py-5">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-3"
                  style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)" }}
                >
                  <MapPin size={11} /> {area.region}
                </span>
                <h2 className="text-2xl font-bold">{area.name}</h2>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <p className="text-sm sm:text-base leading-relaxed mb-3" style={{ color: "var(--color-deep)", opacity: 0.8 }}>
                  {area.summary}
                </p>
                <p className="text-sm mb-3" style={{ color: "var(--color-deep)" }}>
                  <span className="font-semibold">Typical weather:</span>{" "}
                  <span style={{ opacity: 0.8 }}>{area.weather}</span>
                </p>
                <p className="text-sm font-semibold mb-5" style={{ color: "var(--color-deep)" }}>
                  Best for: <span className="font-normal">{area.suits}</span>
                </p>

                <ul className="grid grid-cols-1 gap-2 mb-7">
                  {area.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm" style={{ color: "var(--color-deep)" }}>
                      <span
                        className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "var(--color-sun)", color: "var(--color-deep)" }}
                      >
                        ✓
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <StayBookButton href={getStayLink(area.id)} title={area.name} id={area.id} />
                  <TravelTextLink href={getThingsToDoLink(area.name)} label={"Things to do near " + area.name} id={area.id + "-things-to-do"} category="things-to-do" />
                  <p className="text-xs mt-3" style={{ color: "var(--color-text-muted)", opacity: 0.7 }}>
                    Affiliate link - we may earn a small commission at no extra cost to you
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Getting there */}
        <div className='mt-16'>
          <h2 className='text-2xl sm:text-3xl font-bold mb-3' style={{ color: 'var(--color-deep)' }}>
            Getting there
          </h2>
          <p className='text-sm sm:text-base leading-relaxed mb-8 max-w-2xl' style={{ color: 'var(--color-deep)', opacity: 0.8 }}>
            Flights, airport parking and transfers for your trip.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8'>
            {gettingThere.map((item) => (
              <article key={item.id} id={item.id} className='rounded-3xl p-6 shadow-xl flex flex-col' style={{ background: '#fff' }}>
                {item.image && (
                  <TravelLinkImage href={item.href} src={item.image.src} alt={item.image.alt} width={item.image.width} height={item.image.height} id={item.id} category={item.category} position={item.image.position} />
                )}
                <h3 className='text-xl font-bold mb-3' style={{ color: 'var(--color-deep)' }}>{item.title}</h3>
                <p className='text-sm sm:text-base leading-relaxed mb-6' style={{ color: 'var(--color-deep)', opacity: 0.8 }}>
                  {item.summary}
                </p>
                <div className='mt-auto'>
                  <TravelLinkButton href={item.href} label={item.label} id={item.id} category={item.category} />
                  <p className='text-xs mt-3' style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>
                    Affiliate link - we may earn a small commission at no extra cost to you
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-3xl p-8 sm:p-12 text-center" style={{ background: "var(--gradient-ocean)" }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Check the weather before you book</h2>
          <p className="text-white/70 mb-6 max-w-lg mx-auto">
            Conditions can be completely different between the north and south of the island.
          </p>
          <Link href="/weather" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5">
            Today&apos;s Forecast <ArrowRight size={15} />
          </Link>
        </div>

        {/* WhatsApp channel */}
        <div className="mt-8 rounded-3xl p-8 sm:p-10 text-center shadow-xl" style={{ background: "#fff" }}>
          <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: "var(--color-deep)" }}>
            Get the Tenerife weather on WhatsApp
          </h2>
          <p className="text-sm sm:text-base mb-6 max-w-lg mx-auto" style={{ color: "var(--color-deep)", opacity: 0.8 }}>
            Join the WhatsApp channel for the daily forecast and travel tips, straight to your phone.
          </p>
          {socialLinks.whatsappChannel ? (
            <a
              href={socialLinks.whatsappChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 px-7 py-3.5"
            >
              Join the WhatsApp channel <ArrowRight size={15} />
            </a>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold rounded-full cursor-not-allowed"
              style={{ background: "rgba(66,158,189,0.12)", color: "var(--color-text-muted)" }}
            >
              Channel link coming soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
