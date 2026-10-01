import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const supabase = createServerClient();

    // Find the admin row with this token
    const { data, error } = await supabase
      .from("spin_admin")
      .select("reset_token, reset_token_expires_at")
      .eq("id", 1)
      .single();

    if (error || !data?.reset_token) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }

    if (data.reset_token !== token) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }

    if (!data.reset_token_expires_at || new Date(data.reset_token_expires_at) < new Date()) {
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    // Hash new password and clear the token
    const password_hash = await bcrypt.hash(password, 12);

    await supabase
      .from("spin_admin")
      .update({ password_hash, reset_token: null, reset_token_expires_at: null })
      .eq("id", 1);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin-reset-password]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
