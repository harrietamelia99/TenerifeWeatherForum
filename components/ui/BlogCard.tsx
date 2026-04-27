import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/types/blog";
import { ArrowRight, Clock } from "lucide-react";

interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

const categoryColors: Record<string, string> = {
  Weather: "#9fe7f5",
  Travel: "#f7ad19",
  Packing: "#053f5c",
  "Local Info": "#429ebd",
  Climate: "#9fe7f5",
};

const categoryText: Record<string, string> = {
  Weather: "#053f5c",
  Travel: "#053f5c",
  Packing: "white",
  "Local Info": "#053f5c",
  Climate: "#053f5c",
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function BlogCard({ post, className = "" }: BlogCardProps) {
  const bgColor = categoryColors[post.category] ?? "#9fe7f5";
  const textColor = categoryText[post.category] ?? "#053f5c";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`rounded-3xl overflow-hidden card-hover group block ${className}`}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "0 2px 16px rgba(5,63,92,0.06)",
        textDecoration: "none",
      }}
    >
      {/* Image */}
      <div className="h-48 relative overflow-hidden">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "var(--gradient-sky)" }}
            aria-hidden="true"
          >
            <svg width="60" height="60" viewBox="0 0 48 48" fill="none" className="opacity-20">
              <circle cx="24" cy="24" r="11" fill="white" />
              <g stroke="white" strokeWidth="3" strokeLinecap="round">
                <line x1="24" y1="6" x2="24" y2="9" />
                <line x1="24" y1="39" x2="24" y2="42" />
                <line x1="6" y1="24" x2="9" y2="24" />
                <line x1="39" y1="24" x2="42" y2="24" />
              </g>
            </svg>
          </div>
        )}
        {/* Category tag */}
        <div className="absolute top-3 left-3 z-10">
          <span className="tag-pill text-xs" style={{ background: bgColor, color: textColor }}>
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.readTime && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {post.readTime} min read
              </span>
            </>
          )}
        </div>

        <h3
          className="font-700 text-lg leading-snug mb-3 group-hover:text-[--color-mid] transition-colors duration-200"
          style={{ color: "var(--color-deep)" }}
        >
          {post.title}
        </h3>

        <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--color-text-muted)" }}>
          {post.excerpt}
        </p>

        <span
          className="inline-flex items-center gap-1.5 text-sm font-600"
          style={{ color: "var(--color-mid)" }}
        >
          Read more
          <ArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}
