import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllPosts } from "@/lib/getPosts";
import type { Metadata } from "next";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import ShareButtons from "./ShareButtons";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

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

/** Markdown-to-HTML renderer */
function renderMarkdown(content: string): string {
  const lines = content.split("\n");
  const out: string[] = [];
  let inUl = false;
  let inTable = false;
  let tableHtml = "";

  const flushUl = () => { if (inUl) { out.push("</ul>"); inUl = false; } };
  const flushTable = () => {
    if (inTable) {
      out.push(`<div class="overflow-x-auto mb-6"><table class="w-full text-sm border-collapse">${tableHtml}</table></div>`);
      tableHtml = "";
      inTable = false;
    }
  };

  const inline = (s: string) =>
    s
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold" style="color:var(--color-deep)">$1</strong>')
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded text-sm font-mono bg-gray-100">$1</code>');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Horizontal rule / section divider
    if (/^---+$/.test(line.trim())) { flushUl(); flushTable(); out.push('<hr class="my-8 border-t border-gray-200" />'); continue; }

    // Headings
    if (/^### /.test(line)) { flushUl(); flushTable(); out.push(`<h3 class="text-xl font-bold mt-8 mb-3" style="color:var(--color-deep)">${inline(line.slice(4))}</h3>`); continue; }
    if (/^## /.test(line)) { flushUl(); flushTable(); out.push(`<h2 class="text-2xl font-bold mt-10 mb-4" style="color:var(--color-deep)">${inline(line.slice(3))}</h2>`); continue; }
    if (/^# /.test(line)) { flushUl(); flushTable(); out.push(`<h1 class="text-3xl font-bold mt-10 mb-5" style="color:var(--color-deep)">${inline(line.slice(2))}</h1>`); continue; }

    // Tables
    if (/^\|/.test(line)) {
      flushUl();
      if (!inTable) inTable = true;
      if (/^\|[-| :]+\|/.test(line)) {
        // Separator row - mark previous row as header
        tableHtml = tableHtml.replace(/<tr>/, '<tr class="border-b-2" style="border-color:var(--color-mid)">').replace(/<td/g, '<th class="text-left py-2 px-3 font-semibold text-xs uppercase tracking-wide" style="color:var(--color-deep)"').replace(/<\/td>/g, "</th>");
      } else {
        const cells = line.split("|").filter((_, i2, a) => i2 > 0 && i2 < a.length - 1);
        const isFirst = !tableHtml.includes("<tr");
        const cellTag = isFirst ? "td" : "td";
        const rowClass = isFirst ? "" : ' class="border-b border-gray-100 hover:bg-gray-50"';
        tableHtml += `<tr${rowClass}>${cells.map((c) => `<${cellTag} class="py-2.5 px-3" style="color:var(--color-text-muted)">${inline(c.trim())}</${cellTag}>`).join("")}</tr>`;
      }
      continue;
    } else {
      flushTable();
    }

    // List items
    if (/^- /.test(line)) {
      if (!inUl) { out.push('<ul class="mb-4 space-y-2 ml-5 list-disc">'); inUl = true; }
      out.push(`<li class="leading-relaxed" style="color:var(--color-text-muted)">${inline(line.slice(2))}</li>`);
      continue;
    } else { flushUl(); }

    // Blank line
    if (!line.trim()) { out.push(""); continue; }

    // Normal paragraph line
    out.push(`<p class="mb-4 leading-relaxed text-base" style="color:var(--color-text-muted)">${inline(line)}</p>`);
  }

  flushUl();
  flushTable();
  return out.join("\n");
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const html = post.content ? renderMarkdown(post.content) : "";

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Hero */}
      <div
        className="pt-36 sm:pt-40 lg:pt-44 pb-10 sm:pb-16 relative overflow-hidden"
        style={{ background: "var(--gradient-sky)" }}
      >
        <div
          className="absolute -right-10 -top-10 w-64 h-64 rounded-full opacity-20"
          style={{ background: "var(--color-deep)", filter: "blur(70px)" }}
          aria-hidden="true"
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-600 mb-6 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to blog
          </Link>

          <span
            className="tag-pill mb-4 inline-block"
            style={{ background: "var(--color-deep)", color: "white" }}
          >
            {post.category}
          </span>

          <h1 className="text-3xl sm:text-4xl font-700 text-white mb-5 leading-snug">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-white/65 text-sm flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {formatDate(post.date)}
            </span>
            {post.readTime && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {post.readTime} min read
              </span>
            )}
            {post.author && <span>By {post.author}</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article
          className="rounded-3xl p-8 md:p-12 mb-8"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 2px 16px rgba(5,63,92,0.06)",
          }}
        >
          <p className="text-lg leading-relaxed mb-6" style={{ color: "var(--color-text-muted)" }}>
            {post.excerpt}
          </p>

          <div
            className="prose-custom"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>

        {/* Share */}
        <div
          className="rounded-3xl p-5 flex items-center justify-between flex-wrap gap-4"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p className="text-sm font-600" style={{ color: "var(--color-deep)" }}>
            Found this useful? Share it:
          </p>
          <ShareButtons title={post.title} />
        </div>
        {/* Future: embed TikTok latest video feed and Facebook group widget in sidebar */}
      </div>
    </div>
  );
}
