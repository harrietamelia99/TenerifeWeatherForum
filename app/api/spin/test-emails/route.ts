import { NextResponse } from "next/server";
import { resend, FROM_EMAIL } from "@/lib/resend";

// Temporary test route — DELETE after confirming emails look correct.

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const POSITION: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd" };

function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1).toLocaleString("en-GB", { month: "long", year: "numeric" });
}

function winnerEmailHtml(opts: {
  displayName: string;
  rank: number;
  points: number;
  month: string;
}) {
  const { displayName, rank, points, month } = opts;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%">

        <tr><td style="background:linear-gradient(135deg,#0c2340,#1e3a5f);padding:40px 40px 32px;text-align:center">
          <p style="margin:0 0 8px;color:rgba(255,255,255,0.6);font-size:13px;letter-spacing:2px;text-transform:uppercase">Tenerife Weather Forum</p>
          <h1 style="margin:0;color:#fbbf24;font-size:28px;font-weight:900">Lucky Spin ✦</h1>
        </td></tr>

        <tr><td style="padding:40px 40px 0;text-align:center">
          <div style="font-size:72px;line-height:1;margin-bottom:8px">${MEDAL[rank]}</div>
          <h2 style="margin:16px 0 8px;color:#0c2340;font-size:26px;font-weight:900">You came ${POSITION[rank]}!</h2>
          <p style="margin:0;color:#64748b;font-size:16px">Congratulations, ${displayName} — you finished ${POSITION[rank]} place on the Lucky Spin leaderboard for <strong>${monthLabel(month)}</strong>.</p>
        </td></tr>

        <tr><td style="padding:24px 40px">
          <div style="background:#fef3c7;border:2px solid #fbbf24;border-radius:12px;padding:20px;text-align:center">
            <p style="margin:0 0 4px;color:#92400e;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px">Your final score</p>
            <p style="margin:0;color:#b45309;font-size:48px;font-weight:900;line-height:1">${points.toLocaleString()}</p>
            <p style="margin:4px 0 0;color:#92400e;font-size:14px">points this month</p>
          </div>
        </td></tr>

        <tr><td style="padding:0 40px 24px">
          <h3 style="margin:0 0 12px;color:#0c2340;font-size:16px;font-weight:700">What happens next?</h3>
          <p style="margin:0 0 12px;color:#475569;font-size:15px;line-height:1.6">We'll be in touch with you shortly to arrange your prize. Keep an eye on your inbox over the next few days.</p>
          <p style="margin:0;color:#475569;font-size:15px;line-height:1.6">In the meantime, the leaderboard has now reset — a brand new month has begun. Come back every day to spin, collect points and go for the top spot again!</p>
        </td></tr>

        <tr><td style="padding:0 40px 40px;text-align:center">
          <a href="https://www.tenerifeweatherforum.com/preview/spin"
            style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#0c0a08;font-weight:900;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.5px">
            Spin Again Next Month →
          </a>
        </td></tr>

        <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0">
          <p style="margin:0;color:#94a3b8;font-size:12px">Tenerife Weather Forum · tenerifeweatherforum.com</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function kevinEmailHtml(opts: {
  month: string;
  winners: Array<{ rank: number; email: string; display_name: string | null; points: number }>;
}) {
  const { month, winners } = opts;
  const rows = winners.map(w => `
    <tr>
      <td style="padding:12px 16px;font-size:22px">${MEDAL[w.rank]}</td>
      <td style="padding:12px 16px;color:#0c2340;font-weight:600;font-size:15px">${w.display_name ?? "—"}</td>
      <td style="padding:12px 16px;color:#475569;font-size:14px">${w.email}</td>
      <td style="padding:12px 16px;color:#b45309;font-weight:900;font-size:15px;text-align:right">${w.points.toLocaleString()} pts</td>
    </tr>`).join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%">

        <tr><td style="background:linear-gradient(135deg,#0c2340,#1e3a5f);padding:32px 40px;text-align:center">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:2px;text-transform:uppercase">Lucky Spin Admin</p>
          <h1 style="margin:0;color:#fbbf24;font-size:24px;font-weight:900">${monthLabel(month)} — Winners</h1>
        </td></tr>

        <tr><td style="padding:32px 40px 16px">
          <p style="margin:0;color:#475569;font-size:15px;line-height:1.6">Hi Kevin, the Lucky Spin leaderboard for <strong>${monthLabel(month)}</strong> has been archived and the monthly points have been reset. Here are your top 3 winners — their details are below so you can get in touch to arrange their prizes.</p>
        </td></tr>

        <tr><td style="padding:0 40px 32px">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
            <thead>
              <tr style="background:#f8fafc">
                <th style="padding:10px 16px;text-align:left;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px">Pos</th>
                <th style="padding:10px 16px;text-align:left;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px">Name</th>
                <th style="padding:10px 16px;text-align:left;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px">Email</th>
                <th style="padding:10px 16px;text-align:right;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px">Points</th>
              </tr>
            </thead>
            <tbody style="border-top:1px solid #e2e8f0">${rows}</tbody>
          </table>
        </td></tr>

        <tr><td style="padding:0 40px 32px">
          <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:10px;padding:16px 20px">
            <p style="margin:0;color:#92400e;font-size:14px;line-height:1.6">
              <strong>Remember:</strong> winner emails have been sent automatically to each of the top 3. You just need to follow up with their prizes. The leaderboard has already reset — everyone is back to 0 points for this month.
            </p>
          </div>
        </td></tr>

        <tr><td style="padding:0 40px 40px;text-align:center">
          <a href="https://www.tenerifeweatherforum.com/preview/spin/admin"
            style="display:inline-block;background:#0c2340;color:#fbbf24;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:10px">
            Open Admin Panel →
          </a>
        </td></tr>

        <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0">
          <p style="margin:0;color:#94a3b8;font-size:12px">Tenerife Weather Forum · Lucky Spin Admin</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function GET() {
  const TEST_TO = "harrietameliapearce@gmail.com";
  const month = "2026-07";

  const mockWinners = [
    { rank: 1, email: TEST_TO, display_name: "SunnyTenerife",  points: 4850 },
    { rank: 2, email: TEST_TO, display_name: "BeachDave",       points: 3200 },
    { rank: 3, email: TEST_TO, display_name: "TeideClimber",    points: 2975 },
  ];

  const results: string[] = [];

  // Send the winner email (uses rank 1 as demo)
  try {
    const r = await resend.emails.send({
      from:    FROM_EMAIL,
      to:      TEST_TO,
      subject: `[TEST] 🥇 You came 1st in the Lucky Spin — ${month}`,
      html:    winnerEmailHtml({ displayName: "SunnyTenerife", rank: 1, points: 4850, month }),
    });
    results.push(`Winner email: ${r.data?.id ?? "sent"}`);
  } catch (e) {
    results.push(`Winner email FAILED: ${String(e)}`);
  }

  // Send the Kevin summary email
  try {
    const r = await resend.emails.send({
      from:    FROM_EMAIL,
      to:      TEST_TO,
      subject: `[TEST] Lucky Spin Winners — July 2026`,
      html:    kevinEmailHtml({ month, winners: mockWinners }),
    });
    results.push(`Kevin summary email: ${r.data?.id ?? "sent"}`);
  } catch (e) {
    results.push(`Kevin summary email FAILED: ${String(e)}`);
  }

  return NextResponse.json({ results });
}
