import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const supabase = createServerClient();

    // Find user with matching unexpired token
    const { data: user } = await supabase
      .from("spin_users")
      .select("id, reset_token_expires_at")
      .eq("reset_token", token)
      .maybeSingle();

    if (!user) {
      return NextResponse.json({ error: "This reset link is invalid or has already been used." }, { status: 400 });
    }

    if (new Date(user.reset_token_expires_at) < new Date()) {
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and clear the token in a single operation
    const { error } = await supabase
      .from("spin_users")
      .update({
        password_hash:           passwordHash,
        reset_token:             null,
        reset_token_expires_at:  null,
      })
      .eq("id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[spin/reset-password]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
