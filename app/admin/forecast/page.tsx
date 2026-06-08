"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "twf_admin_pw";

export default function AdminForecastPage() {
  const [password, setPassword] = useState("");
  const [text, setText] = useState("");
  const [hasWarnings, setHasWarnings] = useState(false);
  const [warnings, setWarnings] = useState("");
  const [warningLevel, setWarningLevel] = useState<"yellow" | "amber" | "red">("yellow");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [emailsSent, setEmailsSent] = useState<number | null>(null);
  const [authed, setAuthed] = useState(false);

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
        body: JSON.stringify({ password, text, hasWarnings, warnings, warningLevel }),
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
      setEmailsSent(data.emailsSent ?? null);
      setStatus("saved");
      setTimeout(() => { setStatus("idle"); setEmailsSent(null); }, 6000);
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

          {/* Forecast text */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Today&apos;s forecast
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              placeholder="Write your forecast here — same as what you'd post on Facebook..."
              className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y leading-relaxed"
              required
            />
          </div>

          {/* Weather warnings */}
          <div className="rounded-lg border border-slate-700 overflow-hidden">
            <button
              type="button"
              onClick={() => setHasWarnings(!hasWarnings)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                hasWarnings
                  ? "bg-amber-500/20 border-b border-amber-500/30 text-amber-300"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>⚠️</span>
                <span>Weather warning active today</span>
              </span>
              <span className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                hasWarnings ? "bg-amber-500 border-amber-500" : "border-slate-500"
              }`}>
                {hasWarnings && <span className="text-white text-xs font-bold">✓</span>}
              </span>
            </button>

            {hasWarnings && (
              <div className="bg-slate-800 px-4 pb-4 pt-3 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-amber-300 mb-2">
                    Warning level
                  </label>
                  <div className="flex gap-2">
                    {(["yellow", "amber", "red"] as const).map((lvl) => {
                      const colours = {
                        yellow: { active: "bg-yellow-400/20 border-yellow-400 text-yellow-300", idle: "border-slate-600 text-slate-400 hover:border-yellow-400/50" },
                        amber:  { active: "bg-amber-500/20 border-amber-500 text-amber-300",   idle: "border-slate-600 text-slate-400 hover:border-amber-500/50" },
                        red:    { active: "bg-red-500/20 border-red-500 text-red-300",         idle: "border-slate-600 text-slate-400 hover:border-red-500/50" },
                      };
                      const isActive = warningLevel === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setWarningLevel(lvl)}
                          className={`flex-1 py-2 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-colors ${isActive ? colours[lvl].active : colours[lvl].idle}`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-300 mb-2">
                    Warning details
                  </label>
                  <textarea
                    value={warnings}
                    onChange={(e) => setWarnings(e.target.value)}
                    rows={3}
                    placeholder="e.g. Yellow wind warning in force for Tenerife today. Gusts possible near exposed coastal areas and at altitude."
                    className="w-full rounded-lg bg-slate-700 border border-amber-500/30 text-white px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y leading-relaxed"
                    required={hasWarnings}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {status === "saving" ? "Saving…" : "Save forecast"}
          </button>

          {status === "saved" && (
            <div className="text-center">
              <p className="text-emerald-400 text-sm font-medium">
                ✓ Forecast saved — it&apos;s now live on the site.
              </p>
              {emailsSent !== null && (
                <p className="text-slate-400 text-xs mt-1">
                  {emailsSent > 0
                    ? `📧 Newsletter sent to ${emailsSent} subscriber${emailsSent !== 1 ? "s" : ""}`
                    : "📧 No subscribers to email yet"}
                </p>
              )}
            </div>
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
