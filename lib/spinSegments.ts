export interface SpinSegment {
  label:        string;
  shortLabel:   string;
  points:       number;
  color:        string;
  textColor:    string;
  weight:       number;
  icon:         string;
  isSpinAgain?: boolean;
}

// 12 segments in display order (index 0 = top of wheel)
export const SPIN_SEGMENTS: SpinSegment[] = [
  { label: "Spin Again",      shortLabel: "Spin Again", points: 0,   color: "#7c3aed", textColor: "#ffffff", weight: 20,   icon: "🔄",  isSpinAgain: true },
  { label: "Sunshine Boost",  shortLabel: "+10",        points: 10,  color: "#f59e0b", textColor: "#ffffff", weight: 15,   icon: "☀️"  },
  { label: "Sunset Chill",    shortLabel: "+15",        points: 15,  color: "#ea580c", textColor: "#ffffff", weight: 15,   icon: "🌅"  },
  { label: "Dolphin Dash",    shortLabel: "+20",        points: 20,  color: "#0891b2", textColor: "#ffffff", weight: 10,   icon: "🐬"  },
  { label: "Atlantic Bonus",  shortLabel: "+25",        points: 25,  color: "#2563eb", textColor: "#ffffff", weight: 10,   icon: "🌊"  },
  { label: "Siam Splash",     shortLabel: "+30",        points: 30,  color: "#059669", textColor: "#ffffff", weight: 8,    icon: "🏝️" },
  { label: "Holiday Boost",   shortLabel: "+40",        points: 40,  color: "#db2777", textColor: "#ffffff", weight: 8,    icon: "✈️" },
  { label: "Stargazer Bonus", shortLabel: "+50",        points: 50,  color: "#1e3a8a", textColor: "#ffffff", weight: 6,    icon: "🔭"  },
  { label: "Excursion Bonus", shortLabel: "+75",        points: 75,  color: "#6d28d9", textColor: "#ffffff", weight: 4,    icon: "🎫"  },
  { label: "Golden Teide",    shortLabel: "+100",       points: 100, color: "#b45309", textColor: "#ffffff", weight: 2,    icon: "🌋"  },
  { label: "Volcano Bonus",   shortLabel: "+150",       points: 150, color: "#16a34a", textColor: "#ffffff", weight: 1,    icon: "🔥"  },
  { label: "Island Jackpot",  shortLabel: "+250",       points: 250, color: "#dc2626", textColor: "#fde68a", weight: 0.5,  icon: "🏝️" },
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
