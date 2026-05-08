import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { monthlyNewsletterHtml, monthlyNewsletterSubject } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ─── Fetch events from VisitTenerife ─────────────────────────────────────────

interface TenerifeEvent {
  date: string;
  title: string;
}

function cleanText(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchEvents(monthName: string, year: number): Promise<string> {
  try {
    const res = await fetch("https://www.webtenerife.co.uk/events/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-GB,en;q=0.9",
      },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const events: TenerifeEvent[] = [];

    // webtenerife event cards contain a date string followed by the event title.
    // Pattern: date like "31 May 2026" then title text in nearby elements.
    // We scan for date patterns then grab the closest following heading/anchor text.
    const datePattern = /(\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})/gi;
    const monthYearStr = `${monthName} ${year}`;

    // Walk through all date matches and grab event name from surrounding HTML
    let dateMatch: RegExpExecArray | null;
    while ((dateMatch = datePattern.exec(html)) !== null) {
      const dateStr = dateMatch[1];
      // Only include events in the newsletter month
      if (!dateStr.toLowerCase().includes(monthName.toLowerCase())) continue;

      // Look at the ~400 chars following the date for a title-like text
      const after = html.slice(dateMatch.index, dateMatch.index + 400);

      // Try to find an anchor or heading tag with event text
      const titleMatch =
        after.match(/<(?:h[1-6]|a)[^>]*>\s*([A-Z][^<]{8,80})\s*<\/(?:h[1-6]|a)>/) ||
        after.match(/>\s*([A-Z][A-Za-z][^<]{8,70})\s*</);

      if (titleMatch) {
        const title = cleanText(titleMatch[1]);
        if (
          title.length > 8 &&
          title.length < 90 &&
          !events.find((e) => e.title === title)
        ) {
          events.push({ date: dateStr, title });
          if (events.length >= 8) break;
        }
      }
    }

    // Fallback: grab any heading-level text that looks like an event title
    // (used when date pattern didn't match but content is present)
    if (events.length === 0) {
      const headingRe = /<h[2-4][^>]*>\s*([A-Z][^<]{8,70})\s*<\/h[2-4]>/gi;
      let hMatch: RegExpExecArray | null;
      while ((hMatch = headingRe.exec(html)) !== null) {
        const title = cleanText(hMatch[1]);
        const skip = ["Events", "Our monthly events", "You may also be interested", "Follow up", "Multimedia", "Services"];
        if (skip.some((s) => title.includes(s))) continue;
        if (title.length > 8 && title.length < 90) {
          events.push({ date: "", title });
          if (events.length >= 6) break;
        }
      }
    }

    if (events.length === 0) throw new Error("No events parsed from HTML");

    const listItems = events
      .map((e) =>
        e.date
          ? `<li><strong style="color:#053f5c;">${e.date}</strong> — ${e.title}</li>`
          : `<li>${e.title}</li>`
      )
      .join("");

    return `
      <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#053f5c;">
        Upcoming events in Tenerife — ${monthYearStr}:
      </p>
      <ul style="margin:0 0 12px;padding-left:20px;font-size:14px;color:#475569;line-height:2.2;">
        ${listItems}
      </ul>
      <p style="margin:0;font-size:12px;color:#94a3b8;">
        <a href="https://www.webtenerife.co.uk/events/" style="color:#429ebd;">
          See full listings at webtenerife.co.uk →
        </a>
      </p>`;
  } catch (err) {
    console.warn("[monthly-newsletter] Events fetch failed:", err);
    return `
      <p style="margin:0 0 8px;font-size:14px;color:#475569;line-height:1.8;">
        For up-to-date events, festivals and what's on in Tenerife this ${monthName}, visit
        <a href="https://www.webtenerife.co.uk/events/" style="color:#429ebd;">
          webtenerife.co.uk/events
        </a>
        — updated daily with concerts, cultural events, sports and local festivals.
      </p>`;
  }
}

// ─── AI-generated content ─────────────────────────────────────────────────────

async function generateNewsletterContent(
  monthName: string,
  year: number
): Promise<{ climateOverview: string; whatToExpect: string }> {
  const fallback = {
    climateOverview: `${monthName} in Tenerife brings typical Canary Islands conditions. The south remains warm and sunny while the north can see more cloud and occasional rain. Trade winds provide a cooling effect, particularly along the northeast coast.`,
    whatToExpect: `Pack light clothing for the south, with a layer for evenings. If heading north or to altitude, bring an extra layer. Sun protection is recommended year-round in Tenerife.`,
  };

  if (!process.env.OPENAI_API_KEY) return fallback;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.6,
        messages: [
          {
            role: "user",
            content: `You are writing content for the Tenerife Weather Forum monthly newsletter for ${monthName} ${year}.

Write two separate sections. Return as JSON only:
{
  "climateOverview": "3-4 sentences. Factual climate description for ${monthName} in Tenerife: typical temperatures (south and north), trade winds, sunshine hours, sea temperature, rainfall likelihood. Data-driven, no lifestyle language.",
  "whatToExpect": "3-4 sentences. Practical advice for visitors in ${monthName}: what to pack, which areas have the best weather, any weather patterns to be aware of. Factual and useful."
}`,
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("Empty response");
    return JSON.parse(content) as { climateOverview: string; whatToExpect: string };
  } catch (err) {
    console.error("[monthly-newsletter] AI content failed:", err);
    return fallback;
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data: subscribers, error } = await supabase
      .from("subscribers")
      .select("email, unsubscribe_token")
      .eq("monthly_newsletter", true);

    if (error) {
      console.error("[monthly-newsletter] DB error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: "No subscribers" });
    }

    const now = new Date();
    const monthName = now.toLocaleDateString("en-GB", { month: "long", timeZone: "Atlantic/Canary" });
    const year = now.getFullYear();
    const monthDisplay = `${monthName} ${year}`;

    const [{ climateOverview, whatToExpect }, eventsHtml] = await Promise.all([
      generateNewsletterContent(monthName, year),
      fetchEvents(monthName, year),
    ]);

    const BATCH = 50;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < subscribers.length; i += BATCH) {
      const batch = subscribers.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async (sub) => {
          try {
            await resend.emails.send({
              from: FROM_EMAIL,
              to: sub.email,
              subject: monthlyNewsletterSubject(monthDisplay),
              html: monthlyNewsletterHtml({
                month: monthDisplay,
                climateOverview,
                eventsHtml,
                whatToExpect,
                subscriberToken: sub.unsubscribe_token,
              }),
            });
            sent++;
          } catch (err) {
            console.error(`[monthly-newsletter] Failed to send to ${sub.email}:`, err);
            failed++;
          }
        })
      );
    }

    console.log(`[monthly-newsletter] Sent: ${sent}, Failed: ${failed}`);
    return NextResponse.json({ ok: true, sent, failed });
  } catch (err) {
    console.error("[monthly-newsletter] Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
