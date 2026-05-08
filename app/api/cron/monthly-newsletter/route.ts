import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { monthlyNewsletterHtml, monthlyNewsletterSubject } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ─── Fetch events from VisitTenerife ─────────────────────────────────────────

async function fetchEvents(monthName: string): Promise<string> {
  try {
    const res = await fetch("https://www.webtenerife.co.uk/events/", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TenerifeWeatherForum/1.0)" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Extract event titles and dates from common patterns
    const events: string[] = [];

    // Try to match event article titles (webtenerife uses h2/h3 for event names)
    const titleRe = /<h[23][^>]*>\s*([^<]{5,80})\s*<\/h[23]>/gi;
    let titleMatch: RegExpExecArray | null;
    while ((titleMatch = titleRe.exec(html)) !== null) {
      const title = titleMatch[1].replace(/&amp;/g, "&").replace(/&#\d+;/g, "").trim();
      if (title.length > 5 && title.length < 80 && !title.includes("<")) {
        events.push(title);
        if (events.length >= 6) break;
      }
    }

    if (events.length === 0) throw new Error("No events parsed");

    return `<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#053f5c;">Events in Tenerife this month:</p>
      <ul style="margin:0;padding-left:20px;font-size:14px;color:#475569;line-height:2;">
        ${events.map((e) => `<li>${e}</li>`).join("")}
      </ul>
      <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">
        <a href="https://www.webtenerife.co.uk/events/" style="color:#429ebd;">See all events at webtenerife.co.uk →</a>
      </p>`;
  } catch (err) {
    console.warn("[monthly-newsletter] Events fetch failed:", err);
    // AI-generated fallback describing typical events for the month
    return `<p style="margin:0;font-size:14px;color:#475569;line-height:1.8;">
      For the latest events and festivals happening in Tenerife this ${monthName}, visit
      <a href="https://www.webtenerife.co.uk/events/" style="color:#429ebd;">webtenerife.co.uk/events</a>
      for up-to-date listings including cultural festivals, concerts, and local markets.
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
      fetchEvents(monthName),
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
