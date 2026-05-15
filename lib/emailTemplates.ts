import { SITE_URL } from "@/lib/resend";
import type { DailyUpdate } from "@/lib/getDailyUpdate";

// ─── Shared layout wrappers ───────────────────────────────────────────────────

function emailWrapper(title: string, preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;-webkit-text-size-adjust:100%;">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;overflow:hidden;max-height:0;max-width:0;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0" border="0">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#053f5c 0%,#429ebd 100%);border-radius:16px 16px 0 0;padding:32px 32px 28px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.55);">Tenerife Weather Forum</p>
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;line-height:1.2;">${title}</h1>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#ffffff;padding:0 32px 32px;">
              ${body}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f0f4f8;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#64748b;">
                You're receiving this because you subscribed at
                <a href="${SITE_URL}" style="color:#429ebd;text-decoration:none;">tenerifeweatherforum.com</a>
              </p>
              <p style="margin:0;font-size:12px;color:#64748b;">UNSUBSCRIBE_PLACEHOLDER</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function unsubscribeLinks(token: string): string {
  return `
    <a href="${SITE_URL}/api/unsubscribe?token=${token}&type=daily" style="color:#429ebd;">Unsubscribe from daily digest</a>
    &nbsp;·&nbsp;
    <a href="${SITE_URL}/api/unsubscribe?token=${token}&type=monthly" style="color:#429ebd;">Monthly newsletter</a>
    &nbsp;·&nbsp;
    <a href="${SITE_URL}/api/unsubscribe?token=${token}&type=all" style="color:#429ebd;">Unsubscribe from all</a>
  `;
}

function regionCard(
  emoji: string,
  region: string,
  temp: number,
  high: number,
  wind: string
): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
      <tr>
        <td style="background:#f8fafc;padding:16px 20px;">
          <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#053f5c;">${emoji}&nbsp; ${region}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="33%" style="padding-right:8px;">
                <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Now</p>
                <p style="margin:4px 0 0;font-size:26px;font-weight:700;color:#f7ad19;">${temp}°C</p>
              </td>
              <td width="33%" style="padding-right:8px;">
                <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">High</p>
                <p style="margin:4px 0 0;font-size:26px;font-weight:700;color:#053f5c;">${high}°C</p>
              </td>
              <td width="33%">
                <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Wind</p>
                <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#053f5c;">${wind}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

// ─── Daily Digest ─────────────────────────────────────────────────────────────

export interface DigestData {
  forecast: DailyUpdate;
  subscriberToken: string;
}

export function dailyDigestHtml(data: DigestData): string {
  const { forecast, subscriberToken } = data;
  const f = forecast;

  const warningsBlock = f.hasWarnings
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;border-radius:12px;background:#fef2f2;border:1px solid #fecaca;overflow:hidden;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0;font-size:14px;font-weight:700;color:#b91c1c;">⚠️ Weather Warning</p>
          <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#7f1d1d;">${f.warnings}</p>
        </td></tr>
      </table>`
    : "";

  // Convert Kevin's forecast paragraphs to HTML
  const forecastHtml = f.forecast
    .split("\n\n")
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 10px;font-size:14px;line-height:1.7;color:#0c4a6e;">${p}</p>`)
    .join("");

  const forecastBlock = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;border-radius:12px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;overflow:hidden;">
      <tr><td style="padding:20px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#0369a1;">Today's Forecast</p>
        ${forecastHtml}
      </td></tr>
    </table>`;

  const body = `
    <p style="margin:24px 0 20px;font-size:15px;color:#475569;">Good morning. Here is today's forecast for Tenerife.</p>

    ${warningsBlock}
    ${forecastBlock}

    <a href="${SITE_URL}/weather" style="display:block;text-align:center;padding:14px 24px;background:#053f5c;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;margin-bottom:8px;">View Full Forecast →</a>
  `;

  const html = emailWrapper(
    `Tenerife Weather — ${f.date}`,
    `Today's forecast for Tenerife — ${f.date}`,
    body
  ).replace("UNSUBSCRIBE_PLACEHOLDER", unsubscribeLinks(subscriberToken));

  return html;
}

export function dailyDigestSubject(forecast: DailyUpdate): string {
  return `Tenerife Weather — ${forecast.date} ${forecast.south.emoji}`;
}

// ─── Monthly Newsletter ───────────────────────────────────────────────────────

export interface NewsletterData {
  month: string;           // e.g. "June 2026"
  climateOverview: string; // AI-generated
  eventsHtml: string;      // formatted events or "no events found"
  whatToExpect: string;    // AI-generated tips
  subscriberToken: string;
}

export function monthlyNewsletterHtml(data: NewsletterData): string {
  const { month, climateOverview, eventsHtml, whatToExpect, subscriberToken } = data;

  const body = `
    <p style="margin:24px 0 20px;font-size:15px;color:#475569;">
      Your monthly guide to weather and what's on in Tenerife for <strong>${month}</strong>.
    </p>

    <!-- Climate overview -->
    <h2 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#053f5c;">🌡️ Climate Overview</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;overflow:hidden;">
      <tr><td style="padding:20px;">
        <p style="margin:0;font-size:14px;line-height:1.8;color:#475569;">${climateOverview.replace(/\n/g, "<br>")}</p>
      </td></tr>
    </table>

    <!-- What to expect -->
    <h2 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#053f5c;">🧳 What to Expect</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;border-radius:12px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;overflow:hidden;">
      <tr><td style="padding:20px;">
        <p style="margin:0;font-size:14px;line-height:1.8;color:#0c4a6e;">${whatToExpect.replace(/\n/g, "<br>")}</p>
      </td></tr>
    </table>

    <!-- Events -->
    <h2 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#053f5c;">📅 Events &amp; What's On</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;overflow:hidden;">
      <tr><td style="padding:20px;">
        ${eventsHtml}
      </td></tr>
    </table>

    <a href="${SITE_URL}/weather" style="display:block;text-align:center;padding:14px 24px;background:#053f5c;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;margin-bottom:8px;">Check the Live Forecast →</a>
    <a href="${SITE_URL}/climate" style="display:block;text-align:center;padding:14px 24px;background:#ffffff;color:#053f5c;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;border:1px solid #e2e8f0;">Monthly Climate Guides →</a>
  `;

  const html = emailWrapper(
    `Tenerife in ${month}`,
    `Your monthly guide to weather, events and what to expect in Tenerife`,
    body
  ).replace("UNSUBSCRIBE_PLACEHOLDER", unsubscribeLinks(subscriberToken));

  return html;
}

export function monthlyNewsletterSubject(month: string): string {
  return `Tenerife in ${month} — Your Monthly Weather Guide 🌤️`;
}
