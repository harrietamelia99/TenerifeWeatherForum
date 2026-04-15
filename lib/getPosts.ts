/**
 * Simple markdown file reader for blog posts and weather updates.
 * Posts are stored as .md files in /content/blog/
 *
 * To add a new blog post:
 * 1. Create a new .md file in /content/blog/ (e.g. my-post.md)
 * 2. Add frontmatter at the top:
 *    ---
 *    title: "Your Post Title"
 *    date: "2024-07-15"
 *    category: "Weather" (or Travel, Packing, Local Info, Climate)
 *    excerpt: "A one or two sentence summary."
 *    ---
 * 3. Write your post content in Markdown below the frontmatter.
 * 4. The post will appear automatically on the site.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BlogPost } from "@/types/blog";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const filePath = path.join(BLOG_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    const wordCount = content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    return {
      slug,
      title: data.title || "Untitled",
      date: data.date || "",
      category: data.category || "Weather",
      excerpt: data.excerpt || "",
      content,
      author: data.author || "Tenerife Weather Team",
      readTime,
      featured: data.featured || false,
      image: data.image || null,
    } as BlogPost;
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const wordCount = content.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return {
    slug,
    title: data.title || "Untitled",
    date: data.date || "",
    category: data.category || "Weather",
    excerpt: data.excerpt || "",
    content,
    author: data.author || "Tenerife Weather Team",
    readTime,
    featured: data.featured || false,
  } as BlogPost;
}

export function getPostsByCategory(category: string): BlogPost[] {
  if (category === "All") return getAllPosts();
  return getAllPosts().filter((p) => p.category === category);
}
