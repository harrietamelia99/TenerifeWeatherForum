"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "twf_admin_pw";

export default function AdminForecastPage() {
  const [password, setPassword] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [authed, setAuthed] = useState(false);

  // Restore password from localStorage so they don't re-type it every time
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPassword(saved);
      setAuthed(true);
    }
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong.");
        if (res.status === 401) {
          setAuthed(false);
          localStorage.removeItem(STORAGE_KEY);
        }
        return;
      }

      localStorage.setItem(STORAGE_KEY, password);
      setAuthed(true);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setErrorMsg("Network error — please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-start justify-center p-6 pt-32">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-bold text-white mb-1">Daily Forecast</h1>
        <p className="text-slate-400 text-sm mb-8">
          Write today&apos;s forecast below and press Save. It goes live on the site immediately.
        </p>

        <form onSubmit={handleSave} className="space-y-6">
          {!authed && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Today&apos;s forecast
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              placeholder={`A settled and pleasant day ahead across Tenerife with light winds and comfortable temperatures expected island-wide. The south looks set to enjoy plenty of sunshine through the day, making it feel warm in sheltered spots. The north is also expected to see brighter conditions, with cloud breaking to allow sunny spells to develop through the afternoon.\n\nConditions can vary significantly across different parts of the island due to Tenerife's microclimates, and weather can be completely different just 15 minutes away from one location to another.`}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y leading-relaxed"
              required
            />
            <p className="text-slate-500 text-xs mt-2">
              This text appears in the Forecast section on the weather page. Temperatures, wind speeds, and conditions for each region are pulled automatically from live weather data.
            </p>
          </div>

          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {status === "saving" ? "Saving…" : "Save forecast"}
          </button>

          {status === "saved" && (
            <p className="text-emerald-400 text-sm text-center">
              ✓ Forecast saved — it&apos;s now live on the site.
            </p>
          )}
          {status === "error" && (
            <p className="text-red-400 text-sm text-center">{errorMsg}</p>
          )}
        </form>

        {authed && (
          <button
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              setAuthed(false);
              setPassword("");
            }}
            className="mt-8 text-xs text-slate-600 hover:text-slate-400 underline"
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}
