import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Forward to the monthly newsletter handler
  const base = req.nextUrl.origin;
  const res = await fetch(`${base}/api/cron/monthly-newsletter`, {
    method: "GET",
    headers: { "x-internal-trigger": "1" },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
