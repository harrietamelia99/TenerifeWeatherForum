/**
 * BLOG PAGE - /blog
 *
 * Blog posts are sourced from markdown files in /content/blog/
 * Each .md file should have the following frontmatter:
 *
 *   ---
 *   title: "Post Title"
 *   date: "2026-04-15"
 *   category: "Weather" | "Travel" | "Packing" | "Local Info" | "Climate"
 *   excerpt: "Short summary (1-2 sentences)"
 *   ---
 *
 * For a headless CMS integration, replace getAllPosts() in lib/getPosts.ts
 * with a Sanity, Contentlayer, or similar API call.
 */

import BlogCard from "@/components/ui/BlogCard";
import BlogFilterClient from "./BlogFilterClient";
import { getAllPosts } from "@/lib/getPosts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News & Travel Tips",
  description: "Weather updates, travel tips, packing guides and local information for Tenerife. Updated regularly by the Tenerife Weather Forum team.",
};

export default function BlogPage() {
  const allPosts = getAllPosts();

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Page header */}
      <div
        className="pt-36 sm:pt-40 lg:pt-44 pb-8 sm:pb-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #429ebd, #9fe7f5)" }}
      >
        <div
          className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full opacity-20"
          style={{ background: "var(--color-deep)", filter: "blur(70px)" }}
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="tag-pill mb-4 inline-block">Forum Posts</span>
          <h1 className="text-4xl sm:text-5xl font-700 text-white mb-3">
            News & Travel Tips
          </h1>
          <p className="text-white/70 text-lg max-w-xl">
            Weather updates, packing guides, travel advice and local knowledge - updated regularly.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BlogFilterClient posts={allPosts} />
      </div>
    </div>
  );
}
