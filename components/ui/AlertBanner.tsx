"use client";

import { useState } from "react";
import { X, AlertTriangle, Info, AlertOctagon } from "lucide-react";
import type { AlertLevel } from "@/types/weather";

interface AlertBannerProps {
  level: AlertLevel;
  message: string;
  id?: string;
  dismissible?: boolean;
}

const alertConfig = {
  info: {
    bg: "rgba(159,231,245,0.25)",
    border: "rgba(66,158,189,0.4)",
    text: "#053f5c",
    iconBg: "rgba(66,158,189,0.15)",
    iconColor: "#429ebd",
    label: "Information",
    icon: Info,
  },
  amber: {
    bg: "rgba(247,173,25,0.15)",
    border: "rgba(247,173,25,0.5)",
    text: "#4a3000",
    iconBg: "rgba(247,173,25,0.2)",
    iconColor: "#c87a00",
    label: "Weather Warning",
    icon: AlertTriangle,
  },
  red: {
    bg: "rgba(220,38,38,0.1)",
    border: "rgba(220,38,38,0.4)",
    text: "#7f1d1d",
    iconBg: "rgba(220,38,38,0.15)",
    iconColor: "#dc2626",
    label: "Severe Weather Alert",
    icon: AlertOctagon,
  },
};

export default function AlertBanner({
  level,
  message,
  id,
  dismissible = true,
}: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const config = alertConfig[level];
  const Icon = config.icon;

  if (dismissed) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="rounded-3xl p-5 flex items-start gap-4"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
      id={id}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center"
        style={{ background: config.iconBg }}
      >
        <Icon size={18} style={{ color: config.iconColor }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-700 uppercase tracking-widest mb-1"
          style={{ color: config.iconColor }}
        >
          {config.label}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: config.text }}>
          {message}
        </p>
      </div>

      {/* Dismiss */}
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-black/5 transition-colors duration-150"
          aria-label="Dismiss alert"
          style={{ color: config.text }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
