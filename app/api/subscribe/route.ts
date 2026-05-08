import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { resend, FROM_EMAIL, SITE_URL } from "@/lib/resend";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, daily_digest, monthly_newsletter } = await req.json() as {
      email: string;
      daily_digest: boolean;
      monthly_newsletter: boolean;
    };

    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!daily_digest && !monthly_newsletter) {
      return NextResponse.json({ error: "Please select at least one subscription." }, { status: 400 });
    }

    const supabase = createServerClient();

    // Upsert: if email already exists, update preferences
    const unsubscribe_token = randomUUID();
    const { error } = await supabase
      .from("subscribers")
      .upsert(
        {
          email: email.toLowerCase().trim(),
          daily_digest,
          monthly_newsletter,
          unsubscribe_token,
        },
        {
          onConflict: "email",
          ignoreDuplicates: false,
        }
      );

    if (error) {
      console.error("[subscribe] Supabase error:", error);
      return NextResponse.json({ error: "Could not save your subscription. Please try again." }, { status: 500 });
    }

    // Send confirmation email
    const types: string[] = [];
    if (daily_digest) types.push("Daily Weather Digest");
    if (monthly_newsletter) types.push("Monthly Newsletter");

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "You're subscribed — Tenerife Weather Forum 🌤️",
      html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:24px 16px;">
      <table role="presentation" width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:linear-gradient(135deg,#053f5c,#429ebd);border-radius:16px 16px 0 0;padding:32px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.55);">Tenerife Weather Forum</p>
            <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">You're subscribed! 🌤️</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:28px 32px 32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#475569;">Thanks for subscribing. You've signed up for:</p>
            <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#053f5c;line-height:2;">
              ${types.map((t) => `<li style="font-weight:600;">${t}</li>`).join("")}
            </ul>
            <a href="${SITE_URL}/weather" style="display:block;text-align:center;padding:14px 24px;background:#053f5c;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;margin-bottom:16px;">View Today's Forecast →</a>
            <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
              <a href="${SITE_URL}/api/unsubscribe?token=${unsubscribe_token}&type=all" style="color:#94a3b8;">Unsubscribe</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f0f4f8;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#64748b;">
              <a href="${SITE_URL}" style="color:#429ebd;text-decoration:none;">tenerifeweatherforum.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    }).catch((err) => {
      // Non-fatal — subscription is saved, confirmation email just couldn't be sent
      console.error("[subscribe] Confirmation email failed:", err);
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[subscribe] Unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
