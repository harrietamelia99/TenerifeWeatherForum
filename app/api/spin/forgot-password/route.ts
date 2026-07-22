import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { resend, FROM_EMAIL } from "@/lib/resend";
import crypto from "crypto";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://www.tenerifeweatherforum.com";
const TOKEN_TTL_HOURS = 1;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const supabase = createServerClient();

    // Look up the user — but always return the same response to prevent
    // email-enumeration attacks.
    const { data: user } = await supabase
      .from("spin_users")
      .select("id, email, display_name")
      .eq("email", emailLower)
      .maybeSingle();

    if (user) {
      const token     = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString();

      await supabase
        .from("spin_users")
        .update({ reset_token: token, reset_token_expires_at: expiresAt })
        .eq("id", user.id);

      const resetUrl = `${SITE_URL}/preview/spin/reset-password?token=${token}`;
      const name     = user.display_name ?? "there";

      await resend.emails.send({
        from:    FROM_EMAIL,
        to:      user.email,
        subject: "Reset your Lucky Spin password",
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;padding:32px 24px;background:#0c1a2e;color:#fff;border-radius:16px;">
            <div style="text-align:center;margin-bottom:24px;">
              <span style="font-size:48px;">🎰</span>
              <h1 style="margin:8px 0 4px;font-size:22px;color:#fbbf24;">Lucky Spin</h1>
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.45);">Tenerife Weather Forum</p>
            </div>
            <p style="font-size:15px;line-height:1.6;color:rgba(255,255,255,0.85);">Hi ${name},</p>
            <p style="font-size:15px;line-height:1.6;color:rgba(255,255,255,0.85);">
              We received a request to reset your Lucky Spin password.
              Click the button below to choose a new one.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${resetUrl}"
                 style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#0c0a08;font-weight:700;font-size:15px;border-radius:12px;text-decoration:none;">
                Reset Password
              </a>
            </div>
            <p style="font-size:13px;color:rgba(255,255,255,0.4);text-align:center;">
              This link expires in ${TOKEN_TTL_HOURS} hour. If you didn't request this, you can safely ignore this email.
            </p>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;"/>
            <p style="font-size:12px;color:rgba(255,255,255,0.25);text-align:center;">
              Tenerife Weather Forum · tenerifeweatherforum.com
            </p>
          </div>
        `,
      });
    }

    // Always return success to prevent enumeration
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[spin/forgot-password]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
