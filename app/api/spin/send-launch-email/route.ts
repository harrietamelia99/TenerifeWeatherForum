import { NextRequest, NextResponse } from "next/server";
import { resend, FROM_EMAIL, SITE_URL } from "@/lib/resend";
import { createServerClient } from "@/lib/supabase";

function verifyAdmin(req: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD_WHEEL;
  const provided = req.headers.get("x-admin-password");
  return !!adminPassword && provided === adminPassword;
}

function spinLaunchEmailHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Introducing Lucky Spin 🎰</title>
</head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;max-width:600px;width:100%;box-shadow:0 4px 32px rgba(5,63,92,0.12)">

        <!-- ── Header ─────────────────────────────────────── -->
        <tr>
          <td style="background:linear-gradient(135deg,#053f5c 0%,#0c6891 50%,#1a8fb5 100%);padding:24px 40px 20px;text-align:center">
            <p style="margin:0 0 4px;color:rgba(255,255,255,0.55);font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600">Tenerife Weather Forum</p>
            <p style="margin:0;color:rgba(255,255,255,0.4);font-size:11px">tenerifeweatherforum.com</p>
          </td>
        </tr>

        <!-- ── Hero banner — single column, works on all clients ── -->
        <tr>
          <td style="background:linear-gradient(160deg,#053f5c 0%,#0a5c80 50%,#1a8fb5 100%);padding:40px 32px 36px;text-align:center">
            <p style="margin:0 0 16px;display:inline-block;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);border-radius:20px;padding:5px 14px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.8)">✦ New Feature</p>
            <h1 style="margin:0 0 12px;color:#ffffff;font-size:32px;font-weight:900;line-height:1.15">Spin the wheel.<br>Win real prizes.</h1>
            <p style="margin:0 0 28px;color:rgba(255,255,255,0.8);font-size:15px;line-height:1.6;max-width:400px;margin-left:auto;margin-right:auto">Register for free and get one spin every day. Earn points, climb the monthly leaderboard and win prizes.</p>
            <img
              src="${SITE_URL}/images/spin-wheel-promo.png"
              alt="Lucky Spin wheel"
              width="240"
              style="display:block;width:240px;max-width:80%;height:auto;margin:0 auto;filter:drop-shadow(0 12px 32px rgba(0,0,0,0.55))"
            />
          </td>
        </tr>

        <!-- ── How it works — stacked rows, reliable everywhere ── -->
        <tr>
          <td style="padding:40px 32px 8px">
            <h2 style="margin:0 0 24px;color:#053f5c;font-size:18px;font-weight:800;text-align:center">How it works</h2>

            <!-- Step 1 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
              <tr>
                <td width="56" style="vertical-align:middle;padding-right:16px">
                  <div style="width:52px;height:52px;background:linear-gradient(135deg,#f59e0b,#ea580c);border-radius:50%;text-align:center;font-size:24px;line-height:52px">🎰</div>
                </td>
                <td style="vertical-align:middle">
                  <p style="margin:0 0 3px;color:#053f5c;font-size:14px;font-weight:700">Spin daily</p>
                  <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5">One free spin every 24 hours — no purchase needed</p>
                </td>
              </tr>
            </table>

            <!-- Step 2 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
              <tr>
                <td width="56" style="vertical-align:middle;padding-right:16px">
                  <div style="width:52px;height:52px;background:linear-gradient(135deg,#0c6891,#053f5c);border-radius:50%;text-align:center;font-size:24px;line-height:52px">⭐</div>
                </td>
                <td style="vertical-align:middle">
                  <p style="margin:0 0 3px;color:#053f5c;font-size:14px;font-weight:700">Earn points</p>
                  <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5">Each segment awards points — bigger rewards for lucky spins</p>
                </td>
              </tr>
            </table>

            <!-- Step 3 -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="56" style="vertical-align:middle;padding-right:16px">
                  <div style="width:52px;height:52px;background:linear-gradient(135deg,#16a34a,#065f46);border-radius:50%;text-align:center;font-size:24px;line-height:52px">🏆</div>
                </td>
                <td style="vertical-align:middle">
                  <p style="margin:0 0 3px;color:#053f5c;font-size:14px;font-weight:700">Win prizes</p>
                  <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5">Monthly leaderboard — top 3 players win real prizes</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Bonus spin callout ───────────────────────────── -->
        <tr>
          <td style="padding:24px 40px">
            <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border:2px solid #f59e0b;border-radius:14px;padding:20px 24px;text-align:center">
              <p style="margin:0 0 6px;font-size:20px">🎁</p>
              <p style="margin:0 0 6px;color:#92400e;font-size:14px;font-weight:800">Newsletter subscriber bonus</p>
              <p style="margin:0;color:#78350f;font-size:13px;line-height:1.5">As a newsletter subscriber, you automatically get a <strong>bonus spin every day</strong> — that&rsquo;s twice the chances to win!</p>
            </div>
          </td>
        </tr>

        <!-- ── Prize highlights ────────────────────────────── -->
        <tr>
          <td style="padding:0 40px 32px">
            <h2 style="margin:0 0 16px;color:#053f5c;font-size:16px;font-weight:800;text-align:center">What you could win</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
              <tr style="background:#f8fafc">
                <td style="padding:10px 16px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px">Segment</td>
                <td style="padding:10px 16px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;text-align:right">Points</td>
              </tr>
              ${[
                ["🌋 Golden Teide", "+100"],
                ["🏝️ Island Jackpot", "+250"],
                ["🌊 Volcano Bonus", "+150"],
                ["✈️ Holiday Boost", "+40"],
                ["🔭 Stargazer Bonus", "+50"],
                ["☀️ Sunshine Boost", "+10"],
              ].map(([name, pts], i) => `
              <tr style="border-top:1px solid #f1f5f9;background:${i % 2 === 0 ? "#ffffff" : "#fafafa"}">
                <td style="padding:11px 16px;color:#1e3a5f;font-size:13px;font-weight:600">${name}</td>
                <td style="padding:11px 16px;color:#f59e0b;font-size:13px;font-weight:900;text-align:right">${pts}</td>
              </tr>`).join("")}
              <tr style="border-top:1px solid #f1f5f9;background:#f8fafc">
                <td colspan="2" style="padding:10px 16px;color:#94a3b8;font-size:11px;font-style:italic">…and 6 more segments to discover</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── CTA ─────────────────────────────────────────── -->
        <tr>
          <td style="padding:0 40px 40px;text-align:center">
            <a
              href="${SITE_URL}/spin"
              style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#0c0a08;font-weight:900;font-size:16px;text-decoration:none;padding:16px 40px;border-radius:50px;letter-spacing:0.5px;box-shadow:0 4px 20px rgba(245,158,11,0.4)"
            >
              🎰 Play Lucky Spin →
            </a>
            <p style="margin:12px 0 0;color:#94a3b8;font-size:12px">Free to play &nbsp;·&nbsp; No purchase required &nbsp;·&nbsp; 18+</p>
          </td>
        </tr>

        <!-- ── Footer ──────────────────────────────────────── -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center">
            <p style="margin:0 0 6px;color:#94a3b8;font-size:12px">
              You&rsquo;re receiving this because you subscribed to Tenerife Weather Forum updates.
            </p>
            <p style="margin:0;color:#94a3b8;font-size:12px">
              <a href="${SITE_URL}/terms#lucky-spin" style="color:#64748b;text-decoration:underline">Lucky Spin T&amp;Cs</a>
              &nbsp;·&nbsp;
              <a href="${SITE_URL}/privacy" style="color:#64748b;text-decoration:underline">Privacy Policy</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
}

// POST — send test to a single address
// GET  — send to all subscribers (admin only)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const testTo: string | undefined = body.testTo;

  if (!testTo) {
    return NextResponse.json({ error: "testTo email is required for test sends." }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      testTo,
      subject: "🎰 Introducing Lucky Spin — win real prizes every month!",
      html:    spinLaunchEmailHtml(),
    });
    return NextResponse.json({ ok: true, sent: 1, to: testTo });
  } catch (err) {
    console.error("[send-launch-email] Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// GET — send to ALL subscribers (requires admin password or one-time launch token)
export async function GET(req: NextRequest) {
  const launchToken = req.nextUrl.searchParams.get("token");
  const validToken  = process.env.LAUNCH_EMAIL_TOKEN;
  const tokenOk     = validToken && launchToken === validToken;
  if (!verifyAdmin(req) && !tokenOk) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data: subscribers, error } = await supabase
    .from("subscribers")
    .select("email")
    .eq("daily_digest", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!subscribers?.length) return NextResponse.json({ ok: true, sent: 0, message: "No active subscribers." });

  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    try {
      await resend.emails.send({
        from:    FROM_EMAIL,
        to:      sub.email,
        subject: "🎰 Introducing Lucky Spin — win real prizes every month!",
        html:    spinLaunchEmailHtml(),
      });
      sent++;
      // Small delay to stay within Resend rate limits
      await new Promise((r) => setTimeout(r, 80));
    } catch (err) {
      console.error(`[send-launch-email] Failed for ${sub.email}:`, err);
      failed++;
    }
  }

  return NextResponse.json({ ok: true, sent, failed, total: subscribers.length });
}
