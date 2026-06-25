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

      // Auto sign-in after successful registration
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
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: "linear-gradient(160deg, #020f1e 0%, #0c2340 55%, #07101e 100%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: "rgba(251,191,36,0.15)", border: "2px solid rgba(251,191,36,0.4)" }}
          >
            <span className="text-3xl">🎰</span>
          </div>
          <h1 className="text-2xl font-black text-white">Lucky Spin</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            Create your account to play
          </p>
        </div>

        <div
          className="rounded-2xl p-7"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <h2 className="text-lg font-bold text-white mb-5">Create account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Display name <span style={{ color: "rgba(255,255,255,0.3)" }}>(optional)</span>
              </label>
              <input
                type="text"
                value={form.displayName}
                onChange={set("displayName")}
                maxLength={30}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}
                placeholder="Shown on leaderboard"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Password *
              </label>
              <input
                type="password"
                value={form.password}
                onChange={set("password")}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Confirm password *
              </label>
              <input
                type="password"
                value={form.confirm}
                onChange={set("confirm")}
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
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
              className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "#0c0a08" }}
            >
              {loading ? "Creating account…" : "Create Account & Play"}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Already have an account?{" "}
            <Link href="/preview/spin/login" className="font-semibold hover:opacity-80" style={{ color: "#fbbf24" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
