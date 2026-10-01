import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { resend, FROM_EMAIL } from "@/lib/resend";
import crypto from "crypto";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://www.tenerifeweatherforum.com";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Only Kevin's email (SPIN_NOTIFY_EMAIL) can reset the admin password
    const adminEmail = process.env.SPIN_NOTIFY_EMAIL;
    if (!adminEmail || !email || email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
      // Always return success to prevent email enumeration
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const supabase = createServerClient();
    await supabase
      .from("spin_admin")
      .update({ reset_token: token, reset_token_expires_at: expiresAt.toISOString() })
      .eq("id", 1);

    const resetUrl = `${SITE_URL}/spin/admin/reset-password?token=${token}`;

    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      adminEmail,
      subject: "Spin Admin — Password Reset",
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:480px;width:100%">
        <tr><td style="background:linear-gradient(135deg,#0c2340,#1e3a5f);padding:32px 40px;text-align:center">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:2px;text-transform:uppercase">Tenerife Weather Forum</p>
          <h1 style="margin:0;color:#fbbf24;font-size:22px;font-weight:900">Spin Admin — Password Reset</h1>
        </td></tr>
        <tr><td style="padding:32px 40px">
          <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">Hi Kevin, click the button below to set a new admin password. This link is valid for <strong>1 hour</strong>.</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#0c0a08;font-weight:900;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:12px">Reset Password →</a>
          </div>
          <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:16px 40px;text-align:center;border-top:1px solid #e2e8f0">
          <p style="margin:0;color:#94a3b8;font-size:12px">Tenerife Weather Forum · tenerifeweatherforum.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin-forgot-password]", err);
    return NextResponse.json({ success: true }); // Always succeed to prevent enumeration
  }
}
