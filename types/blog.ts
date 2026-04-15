export type BlogCategory =
  | "Weather"
  | "Travel"
  | "Packing"
  | "Local Info"
  | "Climate";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: BlogCategory;
  excerpt: string;
  content?: string;
  author?: string;
  readTime?: number;
  featured?: boolean;
  image?: string;
}
