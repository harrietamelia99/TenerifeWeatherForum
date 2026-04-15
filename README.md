# Tenerife Weather Forum

A fully responsive, production-grade Next.js 14 website for Tenerife Weather Forum - a trusted weather and travel information resource for UK travellers and Tenerife residents.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Run locally

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm start
```

### Deploy to Vercel

This project is Vercel-ready. Push to GitHub and import the repository in Vercel - no configuration needed.

---

## How to Add a New Weather Post

1. Create a new `.md` file in `/content/blog/` - for example `april-15-update.md`
2. Add the following frontmatter at the top:

```markdown
---
title: "Today's Weather: Sunny Across the South"
date: "2026-04-15"
category: "Weather"
excerpt: "Clear skies and 27°C in Playa de las Américas today. UV is high at level 7."
author: "Tenerife Weather Team"
---

Your full weather update text here in Markdown...
```

3. Write your update in standard Markdown below the frontmatter
4. Save the file - it will appear automatically on the Blog page and the Home page (latest 3 posts)

**Categories available:** `Weather` | `Travel` | `Packing` | `Local Info` | `Climate`

---

## How to Add a New Blog Post

Same as above - just use a different category:

```markdown
---
title: "The Best Restaurants in Puerto de la Cruz"
date: "2026-04-10"
category: "Local Info"
excerpt: "Our favourite local restaurants in Puerto de la Cruz - from fresh fish to Canarian stew."
---
```

Posts sort by date automatically (newest first).

---

## How to Update the Today's Weather Data

The current weather data is static, defined directly in the page components:

- **Home page hero:** `/app/page.tsx` → `todayWeather` object
- **Weather page:** `/app/(pages)/weather/page.tsx` → `currentWeather` and `weeklyForecast` objects

To automate this with live data:
1. Create `/lib/getWeather.ts` 
2. Connect to a weather API (recommended: [Open-Meteo](https://open-meteo.com/) - free, no API key needed)
3. Replace the static data objects with API calls

---

## Where to Add Affiliate Links

Open `/app/(pages)/resources/page.tsx` and read the comment blocks at the top of the file and within each resource section. They explain exactly where to place affiliate links.

**Quick summary:**
- Find the `<ResourceLink>` component call you want to monetise
- Replace the `href` with your affiliate URL
- Add `isAffiliate={true}` - this automatically adds `rel="noopener noreferrer sponsored"` (required for Google compliance)

The affiliate disclosure at the bottom of the page is already in place.

---

## File Structure

```
/app
  /page.tsx                           Home page
  /(pages)
    /weather/page.tsx                 Weather updates & forecast
    /climate/page.tsx                 Climate guide & table
    /blog/
      /page.tsx                       Blog listing
      /BlogFilterClient.tsx           Category filter + pagination
      /[slug]/
        /page.tsx                     Individual blog post
        /ShareButtons.tsx             Facebook & copy-link sharing
    /resources/page.tsx               Resources & affiliate links

/components/ui
  Navbar.tsx                          Sticky responsive navbar
  Footer.tsx                          Site footer
  WeatherCard.tsx                     Reusable weather data card
  WeatherIcon.tsx                     Custom gradient SVG weather icons
  BlogCard.tsx                        Blog post preview card
  RegionCard.tsx                      Microclimate region card
  AlertBanner.tsx                     Dismissible weather alert component
  NewsletterBar.tsx                   Email signup with success state
  MicroclimateStrip.tsx               4-region scrollable strip
  WeatherTicker.tsx                   Animated live weather ticker

/content/blog                         Markdown blog posts (add files here)

/lib
  getPosts.ts                         Markdown file reader

/types
  weather.ts                          Weather data TypeScript types
  blog.ts                             Blog post TypeScript types
```

---

## Social Links

Update Facebook and TikTok URLs in:
- `/components/ui/Navbar.tsx` - both desktop and mobile nav
- `/components/ui/Footer.tsx` - footer social icons

---

## Future Enhancements

- **Live weather API:** Connect Open-Meteo in `/lib/getWeather.ts`
- **TikTok feed:** Embed latest TikTok videos in a sidebar component (see comment in blog post page)
- **Facebook group widget:** Add the Facebook group widget to the blog sidebar
- **Email marketing:** Connect the newsletter form to Mailchimp, ConvertKit or similar in `NewsletterBar.tsx`
- **CMS:** Replace markdown files with Sanity, Contentlayer or Notion as the content grows

---

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **DM Sans** (Google Fonts)
- **Lucide React** (icons)
- **gray-matter** (markdown frontmatter parsing)

---

Built with ☀️ for Tenerife Weather Forum.
