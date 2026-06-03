import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { getForecast } from "@/lib/getForecast";
import { dailyDigestHtml, dailyDigestSubject } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const supabase = createServerClient();
  const { data: subscribers, error } = await supabase
    .from("subscribers")
    .select("email, unsubscribe_token")
    .eq("daily_digest", true)
    .order("created_at", { ascending: true })
    .limit(1000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!subscribers?.length) return NextResponse.json({ error: "No subscribers" }, { status: 404 });

  const forecast = await getForecast();
  const subject = `[BATCH TEST] ${dailyDigestSubject(forecast)}`;

  const { data, error: batchError } = await resend.batch.send(
    subscribers.map((sub) => ({
      from: FROM_EMAIL,
      to: sub.email,
      subject,
      html: dailyDigestHtml({ forecast, subscriberToken: sub.unsubscribe_token }),
    }))
  );

  return NextResponse.json({
    subscribers: subscribers.length,
    rawData: data,
    error: batchError ?? null,
    emails: subscribers.map((s) => s.email),
  });
}
