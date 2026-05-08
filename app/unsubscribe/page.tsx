import Link from "next/link";

export const metadata = { title: "Unsubscribe — Tenerife Weather Forum" };

export default function UnsubscribePage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  const type = searchParams?.success;
  const err  = searchParams?.error;

  const typeLabel =
    type === "daily"   ? "Daily Weather Digest" :
    type === "monthly" ? "Monthly Newsletter" :
    type === "all"     ? "all emails" : "";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-bg)" }}
    >
      <div
        className="max-w-md w-full rounded-3xl p-10 text-center"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 8px 40px rgba(5,63,92,0.08)",
        }}
      >
        {type ? (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-700 mb-3" style={{ color: "var(--color-deep)" }}>
              You&apos;ve been unsubscribed
            </h1>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-text-muted)" }}>
              You&apos;ve been removed from the <strong>{typeLabel}</strong>. You won&apos;t receive any more emails from that list.
            </p>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
              Changed your mind?{" "}
              <Link href="/subscribe" style={{ color: "var(--color-mid)" }}>
                Re-subscribe here
              </Link>
              .
            </p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-700 mb-3" style={{ color: "var(--color-deep)" }}>
              Something went wrong
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
              {err === "notfound"
                ? "We couldn't find your subscription. The link may have already been used."
                : "We couldn't process your unsubscribe request. Please try again or contact us."}
            </p>
          </>
        )}

        <Link
          href="/"
          className="btn-primary inline-block"
          style={{ fontSize: "0.875rem" }}
        >
          Back to the site
        </Link>
      </div>
    </div>
  );
}
