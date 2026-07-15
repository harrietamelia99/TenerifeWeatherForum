"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SpinRegisterPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ email: "", displayName: "", password: "", confirm: "" });
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/spin/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:       form.email,
          password:    form.password,
          displayName: form.displayName.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email:    form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/preview/spin/login");
      } else {
        router.push("/preview/spin");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
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
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <a href="/" className="btn-ghost text-sm py-1.5 px-4">← Return to site</a>
        <Link
          href="/preview/spin/login"
          className="text-sm font-semibold hover:opacity-80"
          style={{ color: "#fbbf24" }}
        >
          Sign in →
        </Link>
      </div>

      {/* Form area — scrollable on very short screens */}
      <div className="flex-1 flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-5">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3"
              style={{ background: "rgba(251,191,36,0.15)", border: "2px solid rgba(251,191,36,0.4)" }}
            >
              <span className="text-2xl">🎰</span>
            </div>
            <h1 className="text-xl font-black text-white">Lucky Spin</h1>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              Create your account to play
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <h2 className="text-base font-bold text-white mb-4">Create account</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  required
                  autoComplete="email"
                  inputMode="email"
                  className="w-full px-3 py-2.5 rounded-xl text-base text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-yellow-400/40"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Display name{" "}
                  <span style={{ color: "rgba(255,255,255,0.3)", textTransform: "none", letterSpacing: 0 }}>
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={set("displayName")}
                  maxLength={30}
                  className="w-full px-3 py-2.5 rounded-xl text-base text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-yellow-400/40"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}
                  placeholder="Shown on leaderboard"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Password *
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-3 py-2.5 rounded-xl text-base text-white outline-none focus:ring-2 focus:ring-yellow-400/40"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}
                  placeholder="Min. 8 characters"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Confirm password *
                </label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={set("confirm")}
                  required
                  autoComplete="new-password"
                  className="w-full px-3 py-2.5 rounded-xl text-base text-white outline-none focus:ring-2 focus:ring-yellow-400/40"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 mt-1"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                  color: "#0c0a08",
                  touchAction: "manipulation",
                }}
              >
                {loading ? "Creating account…" : "Create Account & Play"}
              </button>
            </form>

            <p className="text-center text-sm mt-4" style={{ color: "rgba(255,255,255,0.4)" }}>
              Already have an account?{" "}
              <Link
                href="/preview/spin/login"
                className="font-semibold hover:opacity-80"
                style={{ color: "#fbbf24" }}
              >
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-center text-xs mt-4 pb-4" style={{ color: "rgba(255,255,255,0.2)" }}>
            Preview build · not publicly linked
          </p>
        </div>
      </div>
    </div>
  );
}
