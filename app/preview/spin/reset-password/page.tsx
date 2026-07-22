"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") ?? "";

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [status,    setStatus]    = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message,   setMessage]   = useState("");

  if (!token) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-white font-semibold mb-2">Invalid reset link</p>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
          This link is missing a reset token.
        </p>
        <Link href="/preview/spin/forgot-password" className="text-sm font-semibold" style={{ color: "#fbbf24" }}>
          Request a new link →
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      setStatus("error");
      return;
    }
    setStatus("loading");

    const res = await fetch("/api/spin/reset-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token, password }),
    });

    const data = await res.json();
    if (res.ok) {
      setStatus("done");
      setTimeout(() => router.push("/preview/spin/login"), 2500);
    } else {
      setMessage(data.error ?? "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-lg font-bold text-white mb-2">Password updated!</h2>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
          Redirecting you to sign in…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          New password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full px-4 py-3 rounded-xl text-base text-white outline-none focus:ring-2 focus:ring-yellow-400/40"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}
          placeholder="Min. 8 characters"
        />
      </div>

      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Confirm password
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full px-4 py-3 rounded-xl text-base text-white outline-none focus:ring-2 focus:ring-yellow-400/40"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}
          placeholder="••••••••"
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
          background:  "linear-gradient(135deg, #f59e0b, #ea580c)",
          color:       "#0c0a08",
          touchAction: "manipulation",
        }}
      >
        {status === "loading" ? "Saving…" : "Set New Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
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

      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
              style={{ background: "rgba(251,191,36,0.15)", border: "2px solid rgba(251,191,36,0.4)" }}
            >
              <span className="text-3xl">🔒</span>
            </div>
            <h1 className="text-2xl font-black text-white">Set new password</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
              Choose something you&apos;ll remember.
            </p>
          </div>

          <div
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Suspense fallback={<p className="text-white/50 text-sm text-center py-4">Loading…</p>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
