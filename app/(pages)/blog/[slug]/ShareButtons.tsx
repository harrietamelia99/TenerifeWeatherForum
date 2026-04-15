"use client";

import { useState } from "react";
import { Facebook, Link2, Check } from "lucide-react";

interface ShareButtonsProps {
  title: string;
}

export default function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "width=600,height=400");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={shareToFacebook}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-600 transition-all duration-200"
        style={{ background: "#1877f2", color: "white" }}
        aria-label="Share on Facebook"
      >
        <Facebook size={14} />
        Facebook
      </button>
      <button
        onClick={copyLink}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-600 transition-all duration-200"
        style={{
          background: copied ? "var(--color-sky)" : "var(--color-bg)",
          color: "var(--color-deep)",
          border: "1px solid var(--color-border)",
        }}
        aria-label="Copy link to clipboard"
      >
        {copied ? (
          <>
            <Check size={14} />
            Copied!
          </>
        ) : (
          <>
            <Link2 size={14} />
            Copy Link
          </>
        )}
      </button>
    </div>
  );
}
