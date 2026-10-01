"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const searchParams  = useSearchParams();
  const token         = searchParams.get("token");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Invalid or missing reset link.</p>
        <Link href="/spin/admin" className="text-sm underline" style={{ color: "rgba(255,255,255,0.4)" }}>Back to admin login</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">✅</div>
        <p className="font-bold text-white text-lg">Password updated!</p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>You can now log in with your new password.</p>
        <Link href="/spin/admin" className="inline-block mt-2 py-2.5 px-6 rounded-xl font-bold text-sm" style={{ background: "linear-gradient(135deg,#f59e0b,#ea580c)", color: "#0c0a08" }}>
          Go to Admin Login
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }

    setLoading(true);
    const res = await fetch("/api/spin/admin-reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
    } else {
      setError(data.error ?? "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>New password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}
        />
      </div>
      <div>
        <label className="block text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Confirm password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat new password"
          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
          style={{ background: "rgba(255,255,255,0.07)", border: `1px solid ${error ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.14)"}` }}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-60"
        style={{ background: "linear-gradient(135deg,#f59e0b,#ea580c)", color: "#0c0a08" }}
      >
        {loading ? "Updating…" : "Set New Password"}
      </button>
      <div className="text-center">
        <Link href="/spin/admin" className="text-xs underline" style={{ color: "rgba(255,255,255,0.3)" }}>Back to login</Link>
      </div>
    </form>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(160deg, #020f1e 0%, #0c2340 55%, #07101e 100%)" }}
    >
      <div className="w-full max-w-xs">
        <h1 className="text-2xl font-black text-white text-center mb-2">Spin Admin</h1>
        <p className="text-sm text-center mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>Set a new password</p>
        <Suspense>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
