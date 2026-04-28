"use client";

import { useState } from "react";
import BlogCard from "@/components/ui/BlogCard";
import type { BlogPost, BlogCategory } from "@/types/blog";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = ["All", "Weather", "Travel", "Packing", "Local Info", "Climate"] as const;
const POSTS_PER_PAGE = 6;

interface BlogFilterClientProps {
  posts: BlogPost[];
}

export default function BlogFilterClient({ posts }: BlogFilterClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [page, setPage] = useState(1);

  const filtered =
    activeCategory === "All"
      ? posts
      : posts.filter((p) => p.category === (activeCategory as BlogCategory));

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  return (
    <>
      {/* Filter bar */}
      <div
        className="flex items-center gap-2 overflow-x-auto mb-10 p-1.5 rounded-full"
        role="tablist"
        aria-label="Filter posts by category"
        style={{ background: "rgba(5,63,92,0.06)", width: "fit-content", maxWidth: "100%" }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat}
            onClick={() => handleCategoryChange(cat)}
            className="px-5 py-2 rounded-full text-sm font-600 transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0"
            style={
              activeCategory === cat
                ? {
                    background: "var(--color-deep)",
                    color: "white",
                    boxShadow: "0 2px 8px rgba(5,63,92,0.2)",
                  }
                : {
                    background: "transparent",
                    color: "var(--color-text-muted)",
                  }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {paginated.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {paginated.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div
          className="rounded-3xl p-16 text-center mb-10"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <p style={{ color: "var(--color-text-muted)" }}>
            No posts in this category yet.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-600 transition-all duration-200 disabled:opacity-40 cursor-pointer"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-deep)",
              touchAction: "manipulation",
            }}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
            Prev
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className="w-9 h-9 rounded-full text-sm font-600 transition-all duration-200 cursor-pointer"
                style={
                  p === page
                    ? { background: "var(--color-deep)", color: "white", touchAction: "manipulation" }
                    : { background: "transparent", color: "var(--color-text-muted)", touchAction: "manipulation" }
                }
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-600 transition-all duration-200 disabled:opacity-40 cursor-pointer"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-deep)",
              touchAction: "manipulation",
            }}
            aria-label="Next page"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </>
  );
}
