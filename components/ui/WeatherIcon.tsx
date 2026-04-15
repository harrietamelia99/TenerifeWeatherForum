import type { WeatherCondition } from "@/types/weather";

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: number;
  className?: string;
}

export default function WeatherIcon({ condition, size = 56, className = "" }: WeatherIconProps) {
  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "22%",
    background: "var(--color-surface)",
    boxShadow: "inset 0 1px 3px rgba(5,63,92,0.1), 0 4px 16px rgba(5,63,92,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const iconSize = Math.round(size * 0.6);

  return (
    <div style={containerStyle} className={className} aria-hidden="true">
      {getIcon(condition, iconSize)}
    </div>
  );
}

function getIcon(condition: WeatherCondition, size: number) {
  switch (condition) {
    case "sunny":
      return <SunIcon size={size} />;
    case "partly-cloudy":
      return <PartlyCloudyIcon size={size} />;
    case "cloudy":
      return <CloudIcon size={size} />;
    case "rain":
    case "showers":
      return <RainIcon size={size} />;
    case "thunderstorm":
      return <StormIcon size={size} />;
    case "windy":
      return <WindIcon size={size} />;
    case "fog":
      return <FogIcon size={size} />;
    case "clear":
    default:
      return <SunIcon size={size} />;
  }
}

export function SunIcon({ size = 40 }: { size?: number }) {
  const id = `sun-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ filter: `drop-shadow(0 3px 6px rgba(247,173,25,0.35))` }}>
      <defs>
        <radialGradient id={`${id}-grad`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffcc55" />
          <stop offset="100%" stopColor="#f7ad19" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="11" fill={`url(#${id}-grad)`} />
      <g stroke="#f7ad19" strokeWidth="3" strokeLinecap="round">
        <line x1="24" y1="6" x2="24" y2="9" />
        <line x1="24" y1="39" x2="24" y2="42" />
        <line x1="6" y1="24" x2="9" y2="24" />
        <line x1="39" y1="24" x2="42" y2="24" />
        <line x1="11.51" y1="11.51" x2="13.63" y2="13.63" />
        <line x1="34.37" y1="34.37" x2="36.49" y2="36.49" />
        <line x1="36.49" y1="11.51" x2="34.37" y2="13.63" />
        <line x1="13.63" y1="34.37" x2="11.51" y2="36.49" />
      </g>
    </svg>
  );
}

export function PartlyCloudyIcon({ size = 40 }: { size?: number }) {
  const id = `partly-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ filter: `drop-shadow(0 3px 6px rgba(66,158,189,0.3))` }}>
      <defs>
        <radialGradient id={`${id}-sun`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffcc55" />
          <stop offset="100%" stopColor="#f7ad19" />
        </radialGradient>
        <linearGradient id={`${id}-cloud`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9fe7f5" />
          <stop offset="100%" stopColor="#429ebd" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="18" r="8" fill={`url(#${id}-sun)`} />
      <g stroke="#f7ad19" strokeWidth="2" strokeLinecap="round" opacity="0.8">
        <line x1="20" y1="6" x2="20" y2="8" />
        <line x1="28" y1="10" x2="26.5" y2="11.5" />
        <line x1="32" y1="18" x2="30" y2="18" />
      </g>
      <rect x="10" y="26" width="28" height="14" rx="7" fill={`url(#${id}-cloud)`} />
      <circle cx="17" cy="27" r="7" fill={`url(#${id}-cloud)`} />
      <circle cx="29" cy="26" r="9" fill={`url(#${id}-cloud)`} />
    </svg>
  );
}

export function CloudIcon({ size = 40 }: { size?: number }) {
  const id = `cloud-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ filter: `drop-shadow(0 3px 6px rgba(66,158,189,0.3))` }}>
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9fe7f5" />
          <stop offset="100%" stopColor="#429ebd" />
        </linearGradient>
      </defs>
      <rect x="7" y="26" width="34" height="14" rx="7" fill={`url(#${id}-grad)`} />
      <circle cx="18" cy="27" r="9" fill={`url(#${id}-grad)`} />
      <circle cx="30" cy="25" r="11" fill={`url(#${id}-grad)`} />
    </svg>
  );
}

export function RainIcon({ size = 40 }: { size?: number }) {
  const id = `rain-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ filter: `drop-shadow(0 3px 6px rgba(5,63,92,0.25))` }}>
      <defs>
        <linearGradient id={`${id}-cloud`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9fe7f5" />
          <stop offset="100%" stopColor="#429ebd" />
        </linearGradient>
        <linearGradient id={`${id}-rain`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#429ebd" />
          <stop offset="100%" stopColor="#053f5c" />
        </linearGradient>
      </defs>
      <rect x="7" y="16" width="34" height="14" rx="7" fill={`url(#${id}-cloud)`} />
      <circle cx="18" cy="17" r="9" fill={`url(#${id}-cloud)`} />
      <circle cx="30" cy="15" r="11" fill={`url(#${id}-cloud)`} />
      <g stroke={`url(#${id}-rain)`} strokeWidth="2.5" strokeLinecap="round">
        <line x1="15" y1="34" x2="13" y2="41" />
        <line x1="24" y1="34" x2="22" y2="41" />
        <line x1="33" y1="34" x2="31" y2="41" />
      </g>
    </svg>
  );
}

export function StormIcon({ size = 40 }: { size?: number }) {
  const id = `storm-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ filter: `drop-shadow(0 3px 6px rgba(247,173,25,0.35))` }}>
      <defs>
        <linearGradient id={`${id}-cloud`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#429ebd" />
          <stop offset="100%" stopColor="#053f5c" />
        </linearGradient>
        <linearGradient id={`${id}-bolt`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7ad19" />
          <stop offset="100%" stopColor="#ffcc55" />
        </linearGradient>
      </defs>
      <rect x="7" y="14" width="34" height="14" rx="7" fill={`url(#${id}-cloud)`} />
      <circle cx="18" cy="15" r="9" fill={`url(#${id}-cloud)`} />
      <circle cx="30" cy="13" r="11" fill={`url(#${id}-cloud)`} />
      <path d="M27 26 L22 35 L26 35 L21 44 L32 31 L27 31 Z" fill={`url(#${id}-bolt)`} />
    </svg>
  );
}

export function WindIcon({ size = 40 }: { size?: number }) {
  const id = `wind-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ filter: `drop-shadow(0 3px 6px rgba(66,158,189,0.3))` }}>
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9fe7f5" />
          <stop offset="100%" stopColor="#429ebd" />
        </linearGradient>
      </defs>
      <path d="M8 16 Q24 10 34 16 Q40 20 36 24 Q32 28 26 24" stroke={`url(#${id}-grad)`} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M8 24 Q20 20 28 24 Q36 28 32 32 Q28 36 22 32" stroke={`url(#${id}-grad)`} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M8 32 Q18 28 24 32 Q30 36 26 40" stroke={`url(#${id}-grad)`} strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function FogIcon({ size = 40 }: { size?: number }) {
  const id = `fog-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ filter: `drop-shadow(0 3px 6px rgba(66,158,189,0.2))` }}>
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c8eef7" />
          <stop offset="100%" stopColor="#9fe7f5" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${id}-grad)`} strokeWidth="3.5" strokeLinecap="round">
        <line x1="8" y1="16" x2="40" y2="16" />
        <line x1="10" y1="24" x2="38" y2="24" />
        <line x1="14" y1="32" x2="34" y2="32" />
        <line x1="18" y1="40" x2="30" y2="40" />
      </g>
    </svg>
  );
}
