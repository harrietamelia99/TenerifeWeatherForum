import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--gradient-full)" }}
    >
      <div
        className="absolute top-10 left-10 w-64 h-64 rounded-full opacity-20"
        style={{ background: "var(--color-sky)", filter: "blur(80px)" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 w-48 h-48 rounded-full opacity-15"
        style={{ background: "var(--color-sun)", filter: "blur(60px)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 text-center px-4">
        <div
          className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-8 mx-auto"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}
        >
          <span className="text-5xl font-700 text-white tabular-nums">☁️</span>
        </div>

        <h1 className="text-8xl font-700 text-white tabular-nums mb-4 leading-none">404</h1>
        <h2 className="text-2xl font-600 text-white/80 mb-4">Page not found</h2>
        <p className="text-white/60 mb-8 max-w-sm mx-auto">
          Looks like this page drifted off like a trade wind cloud. Let&apos;s get you back on track.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
          <Link href="/weather" className="btn-ghost">
            Today&apos;s Forecast
          </Link>
        </div>
      </div>
    </div>
  );
}
