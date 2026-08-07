import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

function verifyAdmin(req: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD_WHEEL;
  const provided = req.headers.get("x-admin-password");
  return !!adminPassword && provided === adminPassword;
}

// One-time cleanup: deletes any spin_users whose display_name or email
// contains "test" (case-insensitive), plus their spin history.
export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createServerClient();

  // Find test users
  const { data: testUsers, error: findErr } = await supabase
    .from("spin_users")
    .select("id, email, display_name")
    .or("display_name.ilike.%test%,email.ilike.%test%");

  if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 });
  if (!testUsers?.length) return NextResponse.json({ ok: true, deleted: 0, message: "No test users found." });

  const ids = testUsers.map((u) => u.id);

  // Delete spin history first
  await supabase.from("spin_history").delete().in("user_id", ids);

  // Delete users
  const { error: delErr } = await supabase.from("spin_users").delete().in("id", ids);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    deleted: testUsers.length,
    users: testUsers.map((u) => u.display_name ?? u.email),
  });
}
