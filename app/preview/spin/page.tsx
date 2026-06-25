"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import SpinWheel from "@/components/spin/SpinWheel";
import SpinCountdown from "@/components/spin/SpinCountdown";
import SpinLeaderboard from "@/components/spin/SpinLeaderboard";

interface UserData {
  email:              string;
  displayName:        string | null;
  totalPoints:        number;
  canSpin:            boolean;
  nextSpinAt:         string | null;
  bonusSpinAvailable: boolean;
}

export default function SpinPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData]   = useState<UserData | null>(null);
  const [loading, setLoading]     = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch("/api/spin/me");
      if (res.ok) setUserData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/preview/spin/login");
    } else if (status === "authenticated") {
      fetchUserData();
    }
  }, [status, router, fetchUserData]);

  const handleSpinComplete = useCallback(
    (newPoints: number, nextSpinAt: string | null, isSpinAgain: boolean) => {
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              totalPoints: newPoints,
              canSpin:     isSpinAgain,
              nextSpinAt:  isSpinAgain ? prev.nextSpinAt : nextSpinAt,
            }
          : prev
      );
    },
    []
  );

  const handleCountdownExpired = useCallback(() => {
    setUserData((prev) => (prev ? { ...prev, canSpin: true, nextSpinAt: null } : prev));
  }, []);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, #020f1e 0%, #0c2340 50%, #07101e 100%)" }}>
        <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || !userData) return null;

  const displayName = userData.displayName ?? session.user?.email?.split("@")[0] ?? "Player";

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #020f1e 0%, #0c2340 55%, #07101e 100%)" }}
    >
      {/* Preview banner */}
      <div className="w-full py-1.5 text-center text-xs font-bold uppercase tracking-widest" style={{ background: "#fbbf24", color: "#1a0500" }}>
        Preview — not live
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
            Tenerife Weather Forum
          </p>
          <h1 className="text-lg font-black" style={{ color: "#fbbf24" }}>
            Lucky Spin ✦
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Signed in as</p>
            <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{displayName}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/preview/spin/login" })}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start justify-center">

          {/* Wheel column */}
          <div className="flex flex-col items-center gap-6 w-full lg:w-auto">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
                Spin the Wheel, {displayName}!
              </h2>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                One spin every 24 hours • Subscribe for a bonus spin
              </p>
            </div>

            <SpinWheel
              canSpin={userData.canSpin}
              bonusAvailable={userData.bonusSpinAvailable}
              initialPoints={userData.totalPoints}
              onSpinComplete={handleSpinComplete}
            />

            {/* Countdown (only shown when spin not available) */}
            {!userData.canSpin && !userData.bonusSpinAvailable && userData.nextSpinAt && (
              <SpinCountdown
                nextSpinAt={userData.nextSpinAt}
                bonusAvailable={userData.bonusSpinAvailable}
                onExpired={handleCountdownExpired}
              />
            )}

            {userData.bonusSpinAvailable && (
              <div className="px-5 py-3 rounded-xl text-center" style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)" }}>
                <p className="text-sm font-bold" style={{ color: "#34d399" }}>
                  ✦ Bonus spin available! (Newsletter subscriber perk)
                </p>
              </div>
            )}

            {/* How it works */}
            <details className="w-full max-w-md">
              <summary className="text-xs cursor-pointer font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>
                How does it work?
              </summary>
              <div className="mt-3 text-sm space-y-1.5 pl-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                <p>• Spin once every 24 hours to win points.</p>
                <p>• Points accumulate on the monthly leaderboard.</p>
                <p>• Top 3 each month win prizes announced by Kevin.</p>
                <p>• Newsletter subscribers get an extra bonus spin.</p>
                <p>• Leaderboard resets on the 1st of each month.</p>
              </div>
            </details>
          </div>

          {/* Leaderboard column */}
          <div
            className="w-full lg:w-80 rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
          >
            <SpinLeaderboard />
          </div>
        </div>
      </main>
    </div>
  );
}
