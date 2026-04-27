import { NextRequest, NextResponse } from "next/server";
import { parseFacebookPost } from "@/lib/getDailyUpdate";

/**
 * POST /api/daily-update
 *
 * Called by Make.com whenever Kevin posts a new Tenerife Weather Update
 * to the Facebook Group. Parses the post text and writes the structured
 * JSON to content/daily-update.json in the GitHub repo via the GitHub API.
 * Vercel detects the push and auto-deploys within ~60 seconds.
 *
 * Required env vars:
 *   DAILY_UPDATE_SECRET  — a random secret string you choose (e.g. openssl rand -hex 32)
 *   GITHUB_TOKEN         — GitHub Personal Access Token with repo write scope
 *   GITHUB_REPO          — owner/repo  (e.g. "harrietamelia99/TenerifeWeatherForum")
 *   GITHUB_BRANCH        — branch name (default: "main")
 */

const FILE_PATH = "content/daily-update.json";

export async function POST(req: NextRequest) {
  // ── 1. Authenticate ──────────────────────────────────────────────────────
  const secret = process.env.DAILY_UPDATE_SECRET;
  const authHeader = req.headers.get("x-webhook-secret");

  if (!secret || authHeader !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Parse body ────────────────────────────────────────────────────────
  let postText: string;
  try {
    const body = await req.json();
    postText = body.text ?? body.message ?? body.post ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!postText.trim()) {
    return NextResponse.json({ error: "Empty post text" }, { status: 400 });
  }

  // ── 3. Parse Kevin's format ───────────────────────────────────────────────
  let update;
  try {
    update = parseFacebookPost(postText);
  } catch (err) {
    console.error("Parse error:", err);
    return NextResponse.json({ error: "Failed to parse post" }, { status: 422 });
  }

  // ── 4. Write to GitHub ────────────────────────────────────────────────────
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO ?? "harrietamelia99/TenerifeWeatherForum";
  const branch = process.env.GITHUB_BRANCH ?? "main";

  if (!token) {
    // No GitHub token — still return the parsed data so you can test locally
    return NextResponse.json({ ok: true, parsed: update, note: "GITHUB_TOKEN not set — file not updated" });
  }

  try {
    // Get the current file SHA (required for updates)
    const getRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/${FILE_PATH}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const currentSha = getRes.ok ? (await getRes.json()).sha : undefined;

    // Encode new content as base64
    const newContent = JSON.stringify(update, null, 2);
    const encoded = Buffer.from(newContent).toString("base64");

    // Commit the updated file
    const putRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Daily weather update — ${update.date}`,
          content: encoded,
          sha: currentSha,
          branch,
        }),
      }
    );

    if (!putRes.ok) {
      const err = await putRes.json();
      console.error("GitHub API error:", err);
      return NextResponse.json(
        { error: "Failed to write to GitHub", details: err },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("GitHub write error:", err);
    return NextResponse.json({ error: "GitHub write failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, date: update.date });
}

// Health check — useful for testing the endpoint is reachable
export async function GET() {
  return NextResponse.json({ status: "Daily update webhook is active" });
}
