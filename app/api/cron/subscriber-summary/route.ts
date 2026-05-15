import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { resend, FROM_EMAIL, SITE_URL } from "@/lib/resend";

export const dynamic = "force-dynamic";

const KEVIN_EMAIL = "kevinclarkss@yahoo.com";

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data: subscribers, error } = await supabase
      .from("subscribers")
      .select("email, daily_digest, monthly_newsletter, created_at");

    if (error) {
      console.error("[subscriber-summary] DB error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    const total = subscribers?.length ?? 0;
    const daily = subscribers?.filter((s) => s.daily_digest).length ?? 0;
    const monthly = subscribers?.filter((s) => s.monthly_newsletter).length ?? 0;
    const both = subscribers?.filter((s) => s.daily_digest && s.monthly_newsletter).length ?? 0;

    // Most recent 5 sign-ups
    const recent = [...(subscribers ?? [])]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    const recentRows = recent.map((s) => {
      const date = new Date(s.created_at).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      });
      const subs = [s.daily_digest && "Daily", s.monthly_newsletter && "Monthly"]
        .filter(Boolean)
        .join(" + ");
      return `<tr>
        <td style="padding:8px 12px;font-size:13px;color:#475569;border-bottom:1px solid #f1f5f9;">${s.email}</td>
        <td style="padding:8px 12px;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9;">${subs}</td>
        <td style="padding:8px 12px;font-size:13px;color:#94a3b8;border-bottom:1px solid #f1f5f9;">${date}</td>
      </tr>`;
    }).join("");

    const now = new Date();
    const monthYear = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Subscriber Summary</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0" border="0">

          <tr>
            <td style="background:linear-gradient(135deg,#053f5c 0%,#429ebd 100%);border-radius:16px 16px 0 0;padding:28px 32px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.55);">Tenerife Weather Forum</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">Newsletter Subscribers — ${monthYear}</h1>
            </td>
          </tr>

          <tr>
            <td style="background:#ffffff;padding:28px 32px;">

              <!-- Stat boxes -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td width="25%" style="padding-right:8px;">
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center;">
                      <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Total</p>
                      <p style="margin:6px 0 0;font-size:32px;font-weight:700;color:#053f5c;">${total}</p>
                    </div>
                  </td>
                  <td width="25%" style="padding-right:8px;">
                    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:16px;text-align:center;">
                      <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#0369a1;">Daily</p>
                      <p style="margin:6px 0 0;font-size:32px;font-weight:700;color:#0369a1;">${daily}</p>
                    </div>
                  </td>
                  <td width="25%" style="padding-right:8px;">
                    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;text-align:center;">
                      <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#15803d;">Monthly</p>
                      <p style="margin:6px 0 0;font-size:32px;font-weight:700;color:#15803d;">${monthly}</p>
                    </div>
                  </td>
                  <td width="25%">
                    <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:16px;text-align:center;">
                      <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#7e22ce;">Both</p>
                      <p style="margin:6px 0 0;font-size:32px;font-weight:700;color:#7e22ce;">${both}</p>
                    </div>
                  </td>
                </tr>
              </table>

              ${recent.length > 0 ? `
              <!-- Recent sign-ups -->
              <h2 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#053f5c;">Most recent sign-ups</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:24px;">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;text-align:left;font-weight:600;">Email</th>
                    <th style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;text-align:left;font-weight:600;">Subscribed to</th>
                    <th style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;text-align:left;font-weight:600;">Joined</th>
                  </tr>
                </thead>
                <tbody>${recentRows}</tbody>
              </table>` : `<p style="color:#94a3b8;font-size:14px;">No subscribers yet.</p>`}

              <a href="${SITE_URL}/weather" style="display:block;text-align:center;padding:12px 24px;background:#053f5c;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">View the site →</a>

            </td>
          </tr>

          <tr>
            <td style="background:#f0f4f8;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">Tenerife Weather Forum — monthly subscriber report</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: KEVIN_EMAIL,
      subject: `Newsletter Subscribers — ${monthYear}`,
      html,
    });

    console.log(`[subscriber-summary] Sent to ${KEVIN_EMAIL}: total=${total}, daily=${daily}, monthly=${monthly}`);
    return NextResponse.json({ ok: true, total, daily, monthly });
  } catch (err) {
    console.error("[subscriber-summary] Error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
