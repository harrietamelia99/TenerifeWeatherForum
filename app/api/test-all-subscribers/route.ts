import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { getForecast } from "@/lib/getForecast";
import { dailyDigestHtml, dailyDigestSubject } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Temporary test — sends a [TEST] digest to ALL daily subscribers to verify
// every address receives it. Delete after confirming.
export async function GET() {
  const supabase = createServerClient();

  const { data: subscribers, error } = await supabase
    .from("subscribers")
    .select("email, unsubscribe_token")
    .eq("daily_digest", true)
    .order("created_at", { ascending: true })
    .limit(1000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ error: "No daily subscribers found" }, { status: 404 });
  }

  const forecast = await getForecast();
  const subject = `[TEST] ${dailyDigestSubject(forecast)}`;

  let sent = 0;
  let failed = 0;
  const failedEmails: string[] = [];

  await Promise.all(
    subscribers.map(async (sub) => {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: sub.email,
          subject,
          html: dailyDigestHtml({ forecast, subscriberToken: sub.unsubscribe_token }),
        });
        sent++;
      } catch (err) {
        console.error(`[test-all] Failed for ${sub.email}:`, err);
        failed++;
        failedEmails.push(sub.email);
      }
    })
  );

  return NextResponse.json({
    total: subscribers.length,
    sent,
    failed,
    failedEmails,
    emails: subscribers.map((s) => s.email),
  });
}
