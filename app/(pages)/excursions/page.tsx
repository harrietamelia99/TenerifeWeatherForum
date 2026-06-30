import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Users, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Excursions & Activities | Tenerife Weather Forum",
  description: "Hand-picked excursions and activities in Tenerife — whale watching, Siam Park, Teide stargazing, jeep safaris and more. Book with confidence.",
};

const excursions = [
  {
    id: "whale-watching",
    title: "Whale & Dolphin Watching",
    tagline: "Year-round sightings guaranteed",
    img: "/images/excursion-whale-watching.png",
    href: "https://www.getyourguide.com/tenerife-l350/travelin-lady-tenerife-t392740/?partner_id=NHPMSZ1",
    duration: "2–3 hours",
    groupSize: "All group sizes",
    rating: "4.8",
    gradient: "linear-gradient(135deg, #053f5c, #429ebd)",
    description: [
      "Tenerife sits on one of the world's most significant whale and dolphin migration routes, making the southwest coast one of the few places on Earth where sightings are virtually guaranteed every single day of the year.",
      "Resident pods of short-finned pilot whales and bottlenose dolphins live permanently in the warm Atlantic waters off Los Gigantes and Los Cristianos. Trips depart from Puerto Colón or Los Cristianos aboard comfortable catamarans with experienced guides who know exactly where to find the pods.",
      "Multiple species are often spotted on a single trip — common dolphins, loggerhead turtles, and occasionally even blue whales pass through these waters. One of the most genuinely unmissable experiences in Tenerife.",
    ],
    highlights: ["Resident pilot whale pods", "Bottlenose dolphins daily", "Experienced marine guides", "Comfortable catamarans"],
  },
  {
    id: "siam-park",
    title: "Siam Park",
    tagline: "World's #1 water park",
    img: "/images/excursion-siam-park.png",
    href: "https://www.getyourguide.com/tenerife-l350/siam-park-entry-tickets-t407436/?partner_id=NHPMSZ1",
    duration: "Full day",
    groupSize: "Families & groups",
    rating: "4.9",
    gradient: "linear-gradient(135deg, #f7ad19, #e06c00)",
    description: [
      "Voted the world's number one water park by TripAdvisor for multiple consecutive years, Siam Park is one of the most spectacular theme parks anywhere in the world. Set within an immersive Thai-inspired paradise in Costa Adeje, it's in a category of its own.",
      "The Tower of Power sends riders through a transparent tube submerged in a live shark aquarium before launching them into a lagoon at 80 km/h. The Dragon is one of Europe's largest family raft rides. The wave pool generates three-metre waves. The lazy river winds through tropical gardens fit for a luxury resort.",
      "Beyond the rides, the park itself is genuinely beautiful — ornate Thai pavilions, lush landscaping, and excellent food and drink options make it easy to spend an entire day without running out of things to do.",
    ],
    highlights: ["World's best water park", "Tower of Power shark tube", "3-metre wave pool", "Suits all ages"],
  },
  {
    id: "teide-stargazing",
    title: "Stargazing at Teide",
    tagline: "One of Earth's finest stargazing spots",
    img: "/images/excursion-stargazing.png",
    href: "https://gyg.me/Wgr2pcgZ",
    duration: "3–4 hours (evening)",
    groupSize: "Small groups",
    rating: "4.9",
    gradient: "linear-gradient(135deg, #0f0c29, #302b63)",
    description: [
      "Mount Teide sits at 3,718m above sea level — above the clouds, above the humidity, and well above the light pollution of the towns below. A UNESCO World Heritage Site and one of the finest astronomical observation points on the planet.",
      "On a clear night, the Milky Way is visible to the naked eye from the base of the cable car station. With professional telescopes provided by expert astronomer guides, you can see star clusters, nebulae, planets, and galaxies in extraordinary detail.",
      "The combination of altitude, low humidity, proximity to the equator, and minimal light pollution creates near-perfect conditions that attract professional observatories and amateur astronomers from across the world. Dressing warmly is essential — temperatures at altitude drop significantly after dark even in summer.",
    ],
    highlights: ["UNESCO World Heritage Site", "Milky Way visible to naked eye", "Professional telescopes", "Expert astronomer guides"],
  },
  {
    id: "teide-tour",
    title: "Mount Teide Tour",
    tagline: "Spain's highest peak at 3,718m",
    img: "/images/excursion-teide-tour.png",
    href: "https://www.getyourguide.com/tenerife-l350/mount-teide-cable-car-return-ticket-with-pick-up-t351351/?partner_id=NHPMSZ1",
    duration: "Half day – full day",
    groupSize: "All group sizes",
    rating: "4.7",
    gradient: "linear-gradient(135deg, #b05c2c, #8b2500)",
    description: [
      "Teide is the third largest volcanic structure on Earth and Spain's highest peak at 3,718m. It dominates the skyline from every corner of Tenerife and is visible from Gran Canaria and La Palma on a clear day. Standing at the summit crater rim, you can see all seven Canary Islands spread across the Atlantic below.",
      "The cable car from Rambleta Station carries visitors to 3,555m in minutes, lifting you above the clouds into a world of rust-red and black volcanic rock that looks and feels like another planet. The national park surrounding the volcano — a vast ancient caldera known as Las Cañadas — is equally dramatic to drive or walk through.",
      "Guided tours include transport from resort areas, a guide to explain the volcanic history and ecology of the park, and cable car tickets. Independent visits are also possible by hiring a car, though booking the cable car in advance is essential as slots sell out quickly.",
    ],
    highlights: ["Views of all 7 Canary Islands", "Cable car to 3,555m", "Lunar volcanic landscape", "Guided tours available"],
  },
  {
    id: "jeep-safari",
    title: "Jeep Safari Adventure",
    tagline: "Off-road through hidden Tenerife",
    img: "/images/excursion-jeep-safari.png",
    href: "https://gyg.me/UFq9ct9V",
    duration: "6–8 hours",
    groupSize: "Small groups",
    rating: "4.7",
    gradient: "linear-gradient(135deg, #2d6a4f, #1b4332)",
    description: [
      "The Tenerife that most tourists never see — remote mountain villages, ancient laurisilva forests in the Anaga massif, working banana and pineapple plantations in the Orotava Valley, and volcanic ridgelines with panoramic views across the entire island.",
      "Small groups travel in open 4x4 jeeps along tracks inaccessible to normal vehicles, with experienced local guides who know the island's hidden corners. Stops are made to walk, explore, and take in views from elevated positions above the cloud layer that frequently sits over the north coast.",
      "Most tours include a traditional Canarian lunch at a local restaurant in a mountain village — one of the best ways to experience authentic island food away from the tourist resorts. Expect full sun exposure on the open jeeps, so sun cream is essential.",
    ],
    highlights: ["Remote volcanic landscapes", "Anaga ancient forests", "Traditional Canarian lunch", "Small group experience"],
  },
  {
    id: "sunset-boat",
    title: "Sunset Boat Trip",
    tagline: "Dolphins, cocktails & Atlantic sunsets",
    img: "/images/excursion-sunset-boat.png",
    href: "https://www.getyourguide.com/tenerife-l350/tenerife-sunset-cruise-with-whales-dolphins-snacks-t404663/?partner_id=NHPMSZ1",
    duration: "2–3 hours (evening)",
    groupSize: "All group sizes",
    rating: "4.8",
    gradient: "linear-gradient(135deg, #f7ad19, #c45911)",
    description: [
      "Tenerife's southwest coast at sunset is genuinely spectacular — the Los Gigantes cliffs glowing orange in the evening light, dolphins riding the bow wave, and the Atlantic turning gold and pink as the sun drops into the horizon.",
      "Relaxed catamaran trips depart from Puerto Colón or Los Cristianos in the early evening, sailing south along the coast toward Los Gigantes. Dolphin and whale sightings are common on evening trips — the resident pods are active throughout the day and into the evening.",
      "Drinks and light refreshments are included, the pace is unhurried, and the atmosphere is perfect for couples, families, and groups alike. The two to three hours pass very quickly. One of those Tenerife experiences that people mention for years afterwards.",
    ],
    highlights: ["Atlantic sunset views", "Dolphin sightings likely", "Drinks included", "Los Gigantes cliffs"],
  },
];

export default function ExcursionsPage() {
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
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/60 text-sm mb-5 hover:text-white transition-colors">
            <ArrowRight size={13} className="rotate-180" /> Home
          </Link>
          <span className="tag-pill mb-4 inline-block">Excursions &amp; Activities</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Things to Do in Tenerife
          </h1>
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
            Hand-picked experiences from whale watching to volcano tours. Every activity below is bookable online with free cancellation on most options.
          </p>
        </div>
      </div>

      {/* Excursion sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col gap-16 sm:gap-20">
          {excursions.map((ex, i) => (
            <article
              key={ex.id}
              id={ex.id}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
            >
              {/* Image — alternates side on desktop */}
              <div className={`relative rounded-3xl overflow-hidden shadow-xl ${i % 2 === 1 ? "lg:order-2" : ""}`} style={{ aspectRatio: "4/3" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ex.img}
                  alt={ex.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,63,92,0.5) 0%, transparent 50%)" }} />
                {/* Tag */}
                <div
                  className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                  style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}
                >
                  {ex.tagline}
                </div>
                {/* Rating */}
                <div
                  className="absolute bottom-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: "rgba(247,173,25,0.9)", color: "#3d1a00" }}
                >
                  <Star size={11} fill="currentColor" />
                  {ex.rating}
                </div>
              </div>

              {/* Content */}
              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                {/* Meta pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(66,158,189,0.1)", color: "var(--color-mid)" }}
                  >
                    <Clock size={11} /> {ex.duration}
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(66,158,189,0.1)", color: "var(--color-mid)" }}
                  >
                    <Users size={11} /> {ex.groupSize}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: "var(--color-deep)" }}>
                  {ex.title}
                </h2>

                <div className="space-y-3 mb-6">
                  {ex.description.map((para, j) => (
                    <p key={j} className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                      {para}
                    </p>
                  ))}
                </div>

                {/* Highlights */}
                <ul className="grid grid-cols-2 gap-2 mb-7">
                  {ex.highlights.map((h) => (
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

                <a
                  href={ex.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold"
                >
                  Book This Activity <ArrowRight size={15} />
                </a>
                <p className="text-xs mt-3" style={{ color: "var(--color-text-muted)", opacity: 0.7 }}>
                  Affiliate link — we may earn a small commission at no extra cost to you
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-20 rounded-3xl p-8 sm:p-12 text-center"
          style={{ background: "var(--gradient-ocean)" }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Plan your Tenerife trip</h2>
          <p className="text-white/70 mb-6 max-w-lg mx-auto">
            Check the forecast before you book — Tenerife&apos;s microclimates mean conditions vary significantly across the island.
          </p>
          <Link href="/weather" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5">
            Today&apos;s Forecast <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
