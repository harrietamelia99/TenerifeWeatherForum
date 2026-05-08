"use client";

import { useState, useEffect } from "react";

const EMOJIS = ["☀️", "🌤️", "⛅", "🌥️", "☁️", "🌦️", "🌧️", "⛈️", "🌫️", "🌬️"];

const MICROCLIMATE =
  "Conditions can vary significantly across different parts of the island due to Tenerife's microclimates, and weather can be completely different just 15 minutes away from one location to another.";

function today() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Atlantic/Canary",
  });
}

const defaultForm = () => ({
  date: today(),
  south: {
    emoji: "🌤️",
    label: "Tenerife South (Costa Adeje / Playa de las Américas)",
    temperature: "" as string | number,
    high: "" as string | number,
    conditions: "",
    wind: "",
  },
  north: {
    emoji: "🌤️",
    label: "Tenerife North (Santa Cruz / Puerto de la Cruz)",
    temperature: "" as string | number,
    high: "" as string | number,
    conditions: "",
    wind: "",
  },
  warnings: "There are no active weather warnings for Tenerife today.",
  hasWarnings: false,
  forecast: "",
});

export default function AdminForecastPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [form, setForm] = useState(defaultForm());
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("twf_admin_pw");
    if (saved) setAuthed(true);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Quick local check — actual verification happens server-side on save
    if (password.length < 4) {
      setAuthError("Please enter the admin password.");
      return;
    }
    localStorage.setItem("twf_admin_pw", password);
    setAuthed(true);
  }

  function handleLogout() {
    localStorage.removeItem("twf_admin_pw");
    setAuthed(false);
    setPassword("");
  }

  function setSouth(field: string, value: string | number | boolean) {
    setForm((f) => ({ ...f, south: { ...f.south, [field]: value } }));
  }

  function setNorth(field: string, value: string | number | boolean) {
    setForm((f) => ({ ...f, north: { ...f.north, [field]: value } }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");

    const pw = localStorage.getItem("twf_admin_pw") ?? password;

    // Append microclimate sentence to forecast if not already there
    const forecastText = form.forecast.includes("microclimates")
      ? form.forecast
      : form.forecast.trim() + "\n\n" + MICROCLIMATE;

    const payload = {
      ...form,
      south: {
        ...form.south,
        temperature: Number(form.south.temperature),
        high: Number(form.south.high),
      },
      north: {
        ...form.north,
        temperature: Number(form.north.temperature),
        high: Number(form.north.high),
      },
      forecast: forecastText,
      hasWarnings:
        !form.warnings.toLowerCase().includes("no active") &&
        !form.warnings.toLowerCase().includes("no weather warnings"),
    };

    const res = await fetch("/api/admin/forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw, forecast: payload }),
    });

    if (res.ok) {
      setStatus("saved");
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error ?? "Something went wrong. Try again.");
      if (res.status === 401) {
        localStorage.removeItem("twf_admin_pw");
        setAuthed(false);
      }
      setStatus("error");
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#f0f4f8" }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🌤️</div>
            <h1 className="text-xl font-bold text-gray-900">Tenerife Weather Forum</h1>
            <p className="text-sm text-gray-500 mt-1">Forecast Admin</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoComplete="current-password"
              />
              {authError && <p className="text-red-500 text-sm mt-1">{authError}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-semibold text-base"
            >
              Log in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: "#f0f4f8" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="font-bold text-gray-900 text-lg">Today&apos;s Forecast</h1>
          <p className="text-xs text-gray-500">{form.date}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Log out
        </button>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl mx-auto px-4 pt-6 space-y-6">

        {/* South */}
        <Section
          title="🌤️ Tenerife South"
          subtitle="Costa Adeje / Playa de las Américas"
          emoji={form.south.emoji}
          temperature={form.south.temperature}
          high={form.south.high}
          conditions={form.south.conditions}
          wind={form.south.wind}
          onEmoji={(v) => setSouth("emoji", v)}
          onTemperature={(v) => setSouth("temperature", v)}
          onHigh={(v) => setSouth("high", v)}
          onConditions={(v) => setSouth("conditions", v)}
          onWind={(v) => setSouth("wind", v)}
        />

        {/* North */}
        <Section
          title="🌤️ Tenerife North"
          subtitle="Santa Cruz / Puerto de la Cruz"
          emoji={form.north.emoji}
          temperature={form.north.temperature}
          high={form.north.high}
          conditions={form.north.conditions}
          wind={form.north.wind}
          onEmoji={(v) => setNorth("emoji", v)}
          onTemperature={(v) => setNorth("temperature", v)}
          onHigh={(v) => setNorth("high", v)}
          onConditions={(v) => setNorth("conditions", v)}
          onWind={(v) => setNorth("wind", v)}
        />

        {/* Warnings */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">⚠️ Weather Warnings</h2>
          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.warnings.toLowerCase().includes("no active")}
              onChange={(e) => {
                if (e.target.checked) {
                  setForm((f) => ({
                    ...f,
                    warnings: "There are no active weather warnings for Tenerife today.",
                    hasWarnings: false,
                  }));
                } else {
                  setForm((f) => ({
                    ...f,
                    warnings: "",
                    hasWarnings: true,
                  }));
                }
              }}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-700">No active warnings today</span>
          </label>
          {!form.warnings.toLowerCase().includes("no active") && (
            <textarea
              value={form.warnings}
              onChange={(e) => setForm((f) => ({ ...f, warnings: e.target.value }))}
              rows={3}
              placeholder="Describe the active warning..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          )}
        </div>

        {/* Forecast */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-1">📝 Forecast Summary</h2>
          <p className="text-xs text-gray-400 mb-3">
            3–4 sentences covering the island-wide picture. The microclimate closing sentence is added automatically.
          </p>
          <textarea
            value={form.forecast}
            onChange={(e) => setForm((f) => ({ ...f, forecast: e.target.value }))}
            rows={5}
            required
            placeholder="A settled day across Tenerife with dry conditions expected island-wide..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <p className="text-xs text-gray-400 mt-2 italic">
            Will end with: &ldquo;Conditions can vary significantly across different parts of the island…&rdquo;
          </p>
        </div>

        {/* Save */}
        {status === "saved" ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <div className="text-2xl mb-1">✅</div>
            <p className="font-semibold text-green-800">Forecast saved!</p>
            <p className="text-sm text-green-600 mt-1">The site is now showing today&apos;s forecast.</p>
            <button
              type="button"
              onClick={() => { setStatus("idle"); setForm(defaultForm()); }}
              className="mt-4 text-sm text-green-700 underline"
            >
              Post a new one
            </button>
          </div>
        ) : (
          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold text-lg shadow disabled:opacity-60"
          >
            {status === "saving" ? "Saving…" : "Save Today's Forecast"}
          </button>
        )}

        {status === "error" && (
          <p className="text-red-500 text-sm text-center">{errorMsg}</p>
        )}
      </form>
    </div>
  );
}

// ─── Reusable region section ──────────────────────────────────────────────────

interface SectionProps {
  title: string;
  subtitle: string;
  emoji: string;
  temperature: string | number;
  high: string | number;
  conditions: string;
  wind: string;
  onEmoji: (v: string) => void;
  onTemperature: (v: string) => void;
  onHigh: (v: string) => void;
  onConditions: (v: string) => void;
  onWind: (v: string) => void;
}

function Section({
  title, subtitle, emoji, temperature, high, conditions, wind,
  onEmoji, onTemperature, onHigh, onConditions, onWind,
}: SectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>

      {/* Emoji */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Sky condition</label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => onEmoji(e)}
              className={`text-2xl w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                emoji === e ? "bg-blue-100 ring-2 ring-blue-400" : "bg-gray-100"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Temp row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Current temp (°C)</label>
          <input
            type="number"
            value={temperature}
            onChange={(e) => onTemperature(e.target.value)}
            required
            min={0}
            max={50}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">High today (°C)</label>
          <input
            type="number"
            value={high}
            onChange={(e) => onHigh(e.target.value)}
            required
            min={0}
            max={50}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Conditions */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Conditions</label>
        <textarea
          value={conditions}
          onChange={(e) => onConditions(e.target.value)}
          required
          rows={3}
          placeholder="Mostly clear across the south with light cloud at times..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
      </div>

      {/* Wind */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Wind</label>
        <input
          type="text"
          value={wind}
          onChange={(e) => onWind(e.target.value)}
          required
          placeholder="15–25 km/h"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </div>
  );
}
