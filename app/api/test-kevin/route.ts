import { NextResponse } from "next/server";
import { getForecast } from "@/lib/getForecast";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { dailyDigestHtml, dailyDigestSubject } from "@/lib/emailTemplates";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Temporary test route — sends today's digest to Kevin only
export async function GET() {
  try {
    const supabase = createServerClient();
    const { data: kevin } = await supabase
      .from("subscribers")
      .select("email, unsubscribe_token")
      .eq("email", "kevinclarkss@yahoo.com")
      .single();

    if (!kevin) {
      return NextResponse.json({ error: "Kevin not found in subscribers" }, { status: 404 });
    }

    const forecast = await getForecast();

    await resend.emails.send({
      from: FROM_EMAIL,
      to: kevin.email,
      subject: `[TEST] ${dailyDigestSubject(forecast)}`,
      html: dailyDigestHtml({ forecast, subscriberToken: kevin.unsubscribe_token }),
    });

    return NextResponse.json({ ok: true, sentTo: kevin.email });
  } catch (err) {
    console.error("[test-kevin]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
