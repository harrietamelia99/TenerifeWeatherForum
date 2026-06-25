export interface SpinSegment {
  label: string;
  shortLabel: string; // fits inside SVG slice
  points: number;
  color: string;
  textColor: string;
  weight: number;
  isSpinAgain?: boolean;
}

// 12 segments in display order (index 0 = top of wheel)
export const SPIN_SEGMENTS: SpinSegment[] = [
  { label: "Spin Again",       shortLabel: "Spin Again",  points: 0,   color: "#dc2626", textColor: "#ffffff", weight: 20,  isSpinAgain: true },
  { label: "Sunshine Boost",   shortLabel: "+10",         points: 10,  color: "#f59e0b", textColor: "#1a0500", weight: 15  },
  { label: "Sunset Chill",     shortLabel: "+15",         points: 15,  color: "#ea580c", textColor: "#ffffff", weight: 15  },
  { label: "Dolphin Dash",     shortLabel: "+20",         points: 20,  color: "#3b82f6", textColor: "#ffffff", weight: 10  },
  { label: "Atlantic Bonus",   shortLabel: "+25",         points: 25,  color: "#0369a1", textColor: "#ffffff", weight: 10  },
  { label: "Siam Splash",      shortLabel: "+30",         points: 30,  color: "#0d9488", textColor: "#ffffff", weight: 8   },
  { label: "Holiday Boost",    shortLabel: "+40",         points: 40,  color: "#16a34a", textColor: "#ffffff", weight: 8   },
  { label: "Stargazer Bonus",  shortLabel: "+50",         points: 50,  color: "#7c3aed", textColor: "#ffffff", weight: 6   },
  { label: "Excursion Bonus",  shortLabel: "+75",         points: 75,  color: "#0f766e", textColor: "#ffffff", weight: 4   },
  { label: "Golden Teide",     shortLabel: "+100",        points: 100, color: "#b45309", textColor: "#ffffff", weight: 2   },
  { label: "Volcano Bonus",    shortLabel: "+150",        points: 150, color: "#9f1239", textColor: "#ffffff", weight: 1   },
  { label: "Island Jackpot",   shortLabel: "+250",        points: 250, color: "#0c4a6e", textColor: "#fcd34d", weight: 0.5 },
];

const TOTAL_WEIGHT = SPIN_SEGMENTS.reduce((s, seg) => s + seg.weight, 0);

/** Server-side weighted random — returns the winning segment index */
export function pickWeightedSegment(): number {
  const rand = Math.random() * TOTAL_WEIGHT;
  let cumulative = 0;
  for (let i = 0; i < SPIN_SEGMENTS.length; i++) {
    cumulative += SPIN_SEGMENTS[i].weight;
    if (rand < cumulative) return i;
  }
  return 0;
}
