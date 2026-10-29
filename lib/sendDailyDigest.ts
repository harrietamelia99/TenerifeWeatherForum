import { kv } from "@vercel/kv";
import { createServerClient } from "@/lib/supabase";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { getForecast } from "@/lib/getForecast";
import { dailyDigestHtml, dailyDigestSubject } from "@/lib/emailTemplates";

// v2: the 29 Oct 2026 send failed but still wrote digest-sent-2026-10-29,
// which blocked every retry. A new prefix ignores that stale flag.
const SENT_KEY_PREFIX = "digest-sent-v2-";

// Resend rejects the entire batch if it contains more than 100 emails,
// or if any single address fails validation. Either way nobody is sent
// the forecast, so chunk at the limit and isolate bad addresses.
const BATCH_SIZE = 100;
const PAGE_SIZE = 1000;

const EMAIL_RE =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

type SubscriberRow = { email: string; unsubscribe_token: string };

type EmailPayload = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

type BatchError = { message?: string; statusCode?: number | null; name?: string };

interface ChunkResult {
  sent: number;
  failed: number;
  error?: string;
}

function todayCanary(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Atlantic/Canary" });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isDeliverableEmail(email: string): boolean {
  const value = email.trim();
  if (!value || value.length > 254) return false;
  if (!EMAIL_RE.test(value)) return false;
  const domain = value.slice(value.lastIndexOf("@") + 1);
  const tld = domain.slice(domain.lastIndexOf(".") + 1);
  return tld.length >= 2 && !domain.includes("..");
}

function readBatchResult(
  data: unknown,
  expected: number
): { sent: number; failed: number; error?: string } {
  if (!data || typeof data !== "object") {
    return { sent: expected, failed: 0 };
  }

  const body = data as {
    data?: unknown;
    errors?: { index?: number; message?: string }[];
  };
  const ids = Array.isArray(body.data) ? body.data : Array.isArray(data) ? (data as unknown[]) : null;
  const errors = Array.isArray(body.errors) ? body.errors : [];
  if (!ids) return { sent: expected, failed: 0 };

  const sent = ids.length;
  const failed = errors.length + Math.max(0, expected - ids.length - errors.length);
  const message = errors.find((item) => item.message)?.message;
  return { sent, failed, ...(message ? { error: message } : {}) };
}

function shouldSplitBatch(error: BatchError, size: number): boolean {
  if (size <= 1) return false;
  const status = error.statusCode ?? 0;
  if (status === 429 || status === 401 || status === 403 || status >= 500) return false;
  if (status === 400 || status === 413 || status === 422) return true;
  const message = (error.message ?? "").toLowerCase();
  return /invalid|validation|maximum of|too many|exceed|payload/.test(message);
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

async function loadDailySubscribers(): Promise<SubscriberRow[]> {
  const supabase = createServerClient();
  const rows: SubscriberRow[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("subscribers")
      .select("email, unsubscribe_token")
      .eq("daily_digest", true)
      .order("created_at", { ascending: true })
      .order("email", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`DB error: ${error.message}`);
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }

  return rows;
}

async function sendBatchChunk(payloads: EmailPayload[], attempt = 0): Promise<ChunkResult> {
  try {
    // Permissive mode sends the valid addresses even if one address is rejected.
    // Strict mode (the default) throws away the entire batch for a single bad address.
    const { data, error } = await resend.batch.send(payloads, {
      batchValidation: "permissive",
    });
    if (!error) {
      return readBatchResult(data, payloads.length);
    }

    const batchError = error as BatchError;
    const message = batchError.message ?? "Batch send failed";
    const rateLimited = batchError.statusCode === 429 || /rate limit/i.test(message);
    if (rateLimited && attempt < 2) {
      await sleep(1000 * (attempt + 1));
      return sendBatchChunk(payloads, attempt + 1);
    }

    if (shouldSplitBatch(batchError, payloads.length)) {
      const mid = Math.ceil(payloads.length / 2);
      await sleep(600);
      const left = await sendBatchChunk(payloads.slice(0, mid));
      await sleep(600);
      const right = await sendBatchChunk(payloads.slice(mid));
      const childError = left.error ?? right.error;
      return {
        sent: left.sent + right.sent,
        failed: left.failed + right.failed,
        ...(childError ? { error: childError } : {}),
      };
    }

    console.error("[sendDailyDigest] Batch send error:", error);
    return { sent: 0, failed: payloads.length, error: message };
  } catch (err) {
    console.error("[sendDailyDigest] Batch send threw:", err);
    const message = err instanceof Error ? err.message : "Batch send failed";
    return { sent: 0, failed: payloads.length, error: message };
  }
}

export interface SendResult {
  alreadySent: boolean;
  sent: number;
  failed: number;
  subscribers: number;
  error?: string;
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

  const subscribers = await loadDailySubscribers();
  if (subscribers.length === 0) {
    return { alreadySent: false, sent: 0, failed: 0, subscribers: 0 };
  }

  const forecast = forecastOverride ?? await getForecast();
  const subject = dailyDigestSubject(forecast);

  const deliverable = subscribers.filter((sub) => isDeliverableEmail(sub.email));
  const invalid = subscribers.length - deliverable.length;
  if (invalid > 0) {
    console.error(`[sendDailyDigest] Skipping ${invalid} undeliverable subscriber address(es)`);
  }

  if (deliverable.length === 0) {
    return {
      alreadySent: false,
      sent: 0,
      failed: subscribers.length,
      subscribers: subscribers.length,
      error: "Every subscriber address was rejected as undeliverable.",
    };
  }

  const emailPayloads: EmailPayload[] = deliverable.map((sub) => ({
    from: FROM_EMAIL,
    to: sub.email.trim(),
    subject,
    html: dailyDigestHtml({ forecast, subscriberToken: sub.unsubscribe_token }),
  }));

  let sent = 0;
  let failed = invalid;
  let error: string | undefined;

  for (let i = 0; i < emailPayloads.length; i += BATCH_SIZE) {
    if (i > 0) await sleep(600);
    const result = await sendBatchChunk(emailPayloads.slice(i, i + BATCH_SIZE));
    sent += result.sent;
    failed += result.failed;
    if (!error && result.error) error = result.error;
  }

  // Only block the backup cron after at least one email actually went out.
  // A failed send used to set this flag anyway, so the 10:00 retry never ran
  // and the admin page reported the failure as "no subscribers".
  if (sent > 0) {
    await markSentToday();
  } else {
    console.error("[sendDailyDigest] Nothing sent — daily flag left clear so the backup cron can retry.");
  }

  console.log(`[sendDailyDigest] Sent: ${sent}, Failed: ${failed}, Subscribers: ${subscribers.length}`);
  return {
    alreadySent: false,
    sent,
    failed,
    subscribers: subscribers.length,
    ...(error ? { error } : {}),
  };
}
