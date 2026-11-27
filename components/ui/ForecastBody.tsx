import { forecastParagraphs, segmentForecastText } from "@/lib/forecastText";
import type { CSSProperties } from "react";

interface Props {
  text: string;
  paragraphClassName?: string;
  paragraphStyle?: CSSProperties;
  linkClassName?: string;
  linkStyle?: CSSProperties;
}

export default function ForecastBody({
  text,
  paragraphClassName,
  paragraphStyle,
  linkClassName,
  linkStyle,
}: Props) {
  const paragraphs = forecastParagraphs(text ?? "");

  return (
    <>
      {paragraphs.map((paragraph, i) => (
        <p key={i} className={paragraphClassName} style={paragraphStyle}>
          {segmentForecastText(paragraph).map((segment, j) => {
            if (segment.type === "break") return <br key={j} />;
            if (segment.type === "link") {
              return (
                <a
                  key={j}
                  href={segment.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClassName}
                  style={linkStyle}
                >
                  {segment.label}
                </a>
              );
            }
            return <span key={j}>{segment.value}</span>;
          })}
        </p>
      ))}
    </>
  );
}
