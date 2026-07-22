"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [status,  setStatus]  = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/spin/forgot-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email }),
    });

    if (res.ok) {
      setStatus("sent");
    } else {
      const data = await res.json();
      setMessage(data.error ?? "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(160deg, #020f1e 0%, #0c2340 55%, #07101e 100%)",
        overflowY: "auto",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center px-4 py-3 flex-shrink-0">
        <Link href="/preview/spin/login" className="btn-ghost text-sm py-1.5 px-4">
          ← Back to sign in
        </Link>
      </div>

      {/* Centred form area */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-sm">
          {/* Icon + title */}
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
              style={{ background: "rgba(251,191,36,0.15)", border: "2px solid rgba(251,191,36,0.4)" }}
            >
              <span className="text-3xl">🔑</span>
            </div>
            <h1 className="text-2xl font-black text-white">Forgot password?</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
              We&apos;ll send a reset link to your email.
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {status === "sent" ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-4">📬</div>
                <h2 className="text-lg font-bold text-white mb-2">Check your email</h2>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                  If an account exists for <span className="text-yellow-400 font-medium">{email}</span>,
                  you&apos;ll receive a reset link shortly. It expires in 1 hour.
                </p>
                <Link
                  href="/preview/spin/login"
                  className="inline-block mt-6 text-sm font-semibold hover:opacity-80"
                  style={{ color: "#fbbf24" }}
                >
                  ← Back to sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    inputMode="email"
                    className="w-full px-4 py-3 rounded-xl text-base text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-yellow-400/40"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}
                    placeholder="you@example.com"
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50"
                  style={{
                    background:   "linear-gradient(135deg, #f59e0b, #ea580c)",
                    color:        "#0c0a08",
                    touchAction:  "manipulation",
                  }}
                >
                  {status === "loading" ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
