// Turns Kevin's plain-text forecast into paragraphs, line breaks and links.
// He pastes the same text he posts on Facebook, including raw https:// URLs.

export type ForecastSegment =
  | { type: "text"; value: string }
  | { type: "break" }
  | { type: "link"; href: string; label: string };

const TRAILING_PUNCT = /[.,!?;:]+$/;

export function forecastParagraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function segmentForecastText(text: string): ForecastSegment[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const segments: ForecastSegment[] = [];
  const lines = normalized.split("\n");

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) segments.push({ type: "break" });

    const urlRe = /https?:\/\/[^\s<>"']+/gi;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = urlRe.exec(line)) !== null) {
      const start = match.index;
      if (start > last) {
        segments.push({ type: "text", value: line.slice(last, start) });
      }

      let raw = match[0];
      let trailing = "";
      const punct = raw.match(TRAILING_PUNCT);
      if (punct && punct[0].length < raw.length) {
        trailing = punct[0];
        raw = raw.slice(0, -trailing.length);
      }

      segments.push({ type: "link", href: raw, label: raw });
      if (trailing) segments.push({ type: "text", value: trailing });
      last = start + match[0].length;
    }

    if (last < line.length) {
      segments.push({ type: "text", value: line.slice(last) });
    }
  });

  return segments;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function forecastSegmentsToHtml(text: string, linkStyle: string): string {
  return segmentForecastText(text)
    .map((segment) => {
      if (segment.type === "break") return "<br>";
      if (segment.type === "link") {
        const href = escapeHtml(segment.href);
        const label = escapeHtml(segment.label);
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="${linkStyle}">${label}</a>`;
      }
      return escapeHtml(segment.value);
    })
    .join("");
}

export function forecastToParagraphsHtml(
  text: string,
  paragraphStyle: string,
  linkStyle: string
): string {
  return forecastParagraphs(text)
    .map(
      (paragraph) =>
        `<p style="${paragraphStyle}">${forecastSegmentsToHtml(paragraph, linkStyle)}</p>`
    )
    .join("");
}
