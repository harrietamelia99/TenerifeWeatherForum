"use client";

import { useState } from "react";

interface Props {
  compact?: boolean;
  onDark?: boolean; // Use white text when sitting on a dark/coloured background
}

export default function SubscribeForm({ compact = false, onDark = false }: Props) {
  const labelColor  = onDark ? "rgba(255,255,255,0.95)" : "var(--color-deep)";
  const mutedColor  = onDark ? "rgba(255,255,255,0.65)" : "var(--color-text-muted)";
  const inputStyle  = onDark
    ? { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#ffffff" }
    : { background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-deep)" };
  const [email, setEmail]               = useState("");
  const [daily, setDaily]               = useState(true);
  const [monthly, setMonthly]           = useState(false);
  const [status, setStatus]             = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg]         = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!daily && !monthly) {
      setErrorMsg("Please select at least one option.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        daily_digest: daily,
        monthly_newsletter: monthly,
      }),
    });

    if (res.ok) {
      setStatus("success");
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error ?? "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        className={`rounded-2xl p-6 text-center ${compact ? "" : "py-10"}`}
        style={{
          background: "rgba(159,231,245,0.12)",
          border: "1.5px solid rgba(66,158,189,0.3)",
        }}
      >
        <div className="text-3xl mb-3">✅</div>
        <p className="font-700 text-base mb-1" style={{ color: "var(--color-deep)" }}>You&apos;re subscribed!</p>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Check your inbox for a confirmation email. Welcome to the forum.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label
          htmlFor="sub-email"
          className={`block font-600 mb-1.5 ${compact ? "text-sm" : "text-base"}`}
          style={{ color: labelColor }}
        >
          Email address
        </label>
        <input
          id="sub-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-white/40"
          style={inputStyle}
        />
      </div>

      {/* Checkboxes */}
      <div className="space-y-2.5">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={daily}
            onChange={(e) => setDaily(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded accent-sky-600 cursor-pointer"
          />
          <div>
            <p className={`font-600 ${compact ? "text-sm" : "text-base"}`} style={{ color: labelColor }}>
              Daily Weather Digest
            </p>
            <p className="text-xs mt-0.5" style={{ color: mutedColor }}>
              Each morning at 7am — today&apos;s conditions, temperatures and a short outlook
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={monthly}
            onChange={(e) => setMonthly(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded accent-sky-600 cursor-pointer"
          />
          <div>
            <p className={`font-600 ${compact ? "text-sm" : "text-base"}`} style={{ color: labelColor }}>
              Monthly Newsletter
            </p>
            <p className="text-xs mt-0.5" style={{ color: mutedColor }}>
              1st of each month — climate overview, events &amp; what to expect
            </p>
          </div>
        </label>
      </div>

      {/* Error */}
      {status === "error" && (
        <p className="text-sm text-red-500">{errorMsg}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full btn-primary py-3 text-sm font-700 disabled:opacity-60"
      >
        {status === "loading" ? "Subscribing…" : "Subscribe →"}
      </button>

      <p className="text-xs text-center" style={{ color: mutedColor }}>
        No spam. Unsubscribe any time from any email.
      </p>
    </form>
  );
}
