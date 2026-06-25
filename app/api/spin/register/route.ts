import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const supabase = createServerClient();

    // Check for existing account
    const { data: existing } = await supabase
      .from("spin_users")
      .select("id")
      .eq("email", emailLower)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { error } = await supabase.from("spin_users").insert({
      email:        emailLower,
      password_hash: passwordHash,
      display_name: displayName?.trim() || null,
    });

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[spin/register]", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
