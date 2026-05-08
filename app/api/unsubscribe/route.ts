import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { SITE_URL } from "@/lib/resend";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const type = searchParams.get("type") as "daily" | "monthly" | "all" | null;

  if (!token || !type) {
    return NextResponse.redirect(`${SITE_URL}/unsubscribe?error=invalid`);
  }

  try {
    const supabase = createServerClient();

    // Find subscriber by token
    const { data: subscriber, error: findError } = await supabase
      .from("subscribers")
      .select("id, email")
      .eq("unsubscribe_token", token)
      .single();

    if (findError || !subscriber) {
      return NextResponse.redirect(`${SITE_URL}/unsubscribe?error=notfound`);
    }

    // Update preferences
    let update: Record<string, boolean | null> = {};
    if (type === "daily")   update = { daily_digest: false };
    if (type === "monthly") update = { monthly_newsletter: false };
    if (type === "all")     update = { daily_digest: false, monthly_newsletter: false };

    const { error: updateError } = await supabase
      .from("subscribers")
      .update(update)
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("[unsubscribe] Update error:", updateError);
      return NextResponse.redirect(`${SITE_URL}/unsubscribe?error=update`);
    }

    return NextResponse.redirect(`${SITE_URL}/unsubscribe?success=${type}`);
  } catch (err) {
    console.error("[unsubscribe] Unexpected error:", err);
    return NextResponse.redirect(`${SITE_URL}/unsubscribe?error=unknown`);
  }
}
