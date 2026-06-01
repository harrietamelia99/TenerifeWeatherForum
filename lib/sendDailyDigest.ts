import { kv } from "@vercel/kv";
import { createServerClient } from "@/lib/supabase";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { getForecast } from "@/lib/getForecast";
import { dailyDigestHtml, dailyDigestSubject } from "@/lib/emailTemplates";

const SENT_KEY_PREFIX = "digest-sent-";

function todayCanary(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Atlantic/Canary" });
}

async function hasBeenSentToday(): Promise<boolean> {
  try {
    const flag = await kv.get<boolean>(`${SENT_KEY_PREFIX}${todayCanary()}`);
    return flag === true;
  } catch {
    return false;
  }
}

async function markSentToday(): Promise<void> {
  try {
    // Expires after 26 hours so the key cleans itself up
    await kv.set(`${SENT_KEY_PREFIX}${todayCanary()}`, true, { ex: 60 * 60 * 26 });
  } catch (err) {
    console.error("[sendDailyDigest] Failed to mark sent flag:", err);
  }
}

export interface SendResult {
  alreadySent: boolean;
  sent: number;
  failed: number;
  subscribers: number;
}

/**
 * Sends the daily digest to all subscribers.
 * Safe to call multiple times — will no-op if already sent today.
 *
 * @param forecastOverride — pass the forecast directly from the admin save
 *   to avoid a KV race condition where the email fires before the write
 *   has fully propagated.
 * @param force — if true, bypasses the "already sent today" check so Kevin's
 *   manual forecast always goes out even if the backup cron already ran.
 */
export async function sendDailyDigest(
  forecastOverride?: Awaited<ReturnType<typeof getForecast>>,
  force = false
): Promise<SendResult> {
  if (!force && await hasBeenSentToday()) {
    console.log("[sendDailyDigest] Already sent today — skipping.");
    return { alreadySent: true, sent: 0, failed: 0, subscribers: 0 };
  }

  const supabase = createServerClient();
  const { data: subscribers, error } = await supabase
    .from("subscribers")
    .select("email, unsubscribe_token")
    .eq("daily_digest", true);

  if (error) throw new Error(`DB error: ${error.message}`);
  if (!subscribers || subscribers.length === 0) {
    return { alreadySent: false, sent: 0, failed: 0, subscribers: 0 };
  }

  const forecast = forecastOverride ?? await getForecast();

  const BATCH = 50;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < subscribers.length; i += BATCH) {
    const batch = subscribers.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (sub) => {
        try {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: sub.email,
            subject: dailyDigestSubject(forecast),
            html: dailyDigestHtml({
              forecast,
              subscriberToken: sub.unsubscribe_token,
            }),
          });
          sent++;
        } catch (err) {
          console.error(`[sendDailyDigest] Failed to send to ${sub.email}:`, err);
          failed++;
        }
      })
    );
  }

  // Mark as sent so the cron doesn't double-send later in the day
  await markSentToday();

  console.log(`[sendDailyDigest] Sent: ${sent}, Failed: ${failed}`);
  return { alreadySent: false, sent, failed, subscribers: subscribers.length };
}
