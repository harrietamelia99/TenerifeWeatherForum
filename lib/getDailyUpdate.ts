import fs from "fs";
import path from "path";

export interface DailyUpdateSection {
  emoji: string;
  label: string;
  temperature: number;
  high: number;
  conditions: string;
  wind: string;
}

export interface DailyUpdate {
  date: string;
  south: DailyUpdateSection;
  north: DailyUpdateSection;
  warnings: string;
  hasWarnings: boolean;
  forecast: string;
  postedAt: string;
  source: string;
}

export function getDailyUpdate(): DailyUpdate {
  const filePath = path.join(process.cwd(), "content", "daily-update.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as DailyUpdate;
}

// ─── Parse Kevin's raw Facebook post text into structured data ───────────────
// Handles his exact posting format automatically.
export function parseFacebookPost(text: string): DailyUpdate {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Date is the second non-empty line after "Tenerife Weather Update"
  const titleIdx = lines.findIndex((l) =>
    l.toLowerCase().includes("tenerife weather update")
  );
  const date = lines[titleIdx + 1] ?? new Date().toDateString();

  // Helper: get bullet value
  const bullet = (block: string[], key: string): string => {
    const line = block.find((l) =>
      l.toLowerCase().startsWith(`• ${key.toLowerCase()}`)
    );
    if (!line) return "";
    return line.replace(/^•\s*/i, "").replace(/^[^:]+:\s*/i, "").trim();
  };

  // Helper: extract a section between two emoji/header lines
  const extractSection = (
    startPattern: RegExp,
    endPatterns: RegExp[]
  ): string[] => {
    const start = lines.findIndex((l) => startPattern.test(l));
    if (start === -1) return [];
    let end = lines.length;
    for (const pat of endPatterns) {
      const idx = lines.findIndex((l, i) => i > start && pat.test(l));
      if (idx !== -1 && idx < end) end = idx;
    }
    return lines.slice(start, end);
  };

  const southLines = extractSection(
    /tenerife south/i,
    [/tenerife north/i, /weather warnings/i, /^forecast$/i]
  );
  const northLines = extractSection(
    /tenerife north/i,
    [/weather warnings/i, /^forecast$/i]
  );
  const warningsLines = extractSection(
    /weather warnings/i,
    [/^forecast$/i]
  );
  const forecastIdx = lines.findIndex((l) => /^forecast$/i.test(l));
  const forecastLines =
    forecastIdx !== -1 ? lines.slice(forecastIdx + 1) : [];

  // Detect emoji for each section (first char of header line)
  const emojiOf = (sectionLines: string[]) => {
    const header = sectionLines[0] ?? "";
    // Grab the first character — emoji are multi-byte so use Array.from
    const first = Array.from(header)[0] ?? "";
    // If it's outside normal ASCII range it's likely an emoji
    return first.codePointAt(0)! > 127 ? first : "🌤️";
  };

  // Temperature/high: strip °C and spaces
  const parseTemp = (raw: string) =>
    parseInt(raw.replace(/[°c\s]/gi, ""), 10) || 0;

  const southTemp = parseTemp(bullet(southLines, "Temperature"));
  const southHigh = parseTemp(bullet(southLines, "High"));
  const northTemp = parseTemp(bullet(northLines, "Temperature"));
  const northHigh = parseTemp(bullet(northLines, "High"));

  // Warnings: everything after the header line (excluding "⚠️ Weather Warnings")
  const warningText = warningsLines
    .slice(1)
    .join(" ")
    .trim();
  const hasWarnings = !warningText.toLowerCase().includes("no active");

  return {
    date,
    south: {
      emoji: emojiOf(southLines),
      label: southLines[0]?.replace(/^[^\w]+/, "").trim() ?? "Tenerife South",
      temperature: southTemp,
      high: southHigh,
      conditions: bullet(southLines, "Conditions"),
      wind: bullet(southLines, "Wind"),
    },
    north: {
      emoji: emojiOf(northLines),
      label: northLines[0]?.replace(/^[^\w]+/, "").trim() ?? "Tenerife North",
      temperature: northTemp,
      high: northHigh,
      conditions: bullet(northLines, "Conditions"),
      wind: bullet(northLines, "Wind"),
    },
    warnings: warningText || "No active weather warnings for Tenerife today.",
    hasWarnings,
    forecast: forecastLines.join("\n\n"),
    postedAt: new Date().toISOString(),
    source: "Kevin's Daily Update",
  };
}
