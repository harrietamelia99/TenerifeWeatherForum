"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="text-center max-w-md">
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(66,158,189,0.12)" }}
        >
          <span className="text-3xl">⛅</span>
        </div>
        <h1
          className="text-2xl font-700 mb-3"
          style={{ color: "var(--color-deep)" }}
        >
          Something went wrong
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
          We couldn&apos;t load the latest weather data. This usually fixes itself in a moment.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-primary text-sm px-6 py-2.5"
          >
            Try again
          </button>
          <Link href="/" className="btn-outline text-sm px-6 py-2.5">
            Go home
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs mt-4" style={{ color: "var(--color-text-muted)" }}>
            Ref: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
