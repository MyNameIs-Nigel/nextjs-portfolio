export type Category =
  | "Automotive"
  | "Classwork"
  | "Coding Projects"
  | "Photography";

export const CATEGORIES: Category[] = [
  "Automotive",
  "Classwork",
  "Coding Projects",
  "Photography",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Automotive: "bg-amber-100 text-amber-800",
  Classwork: "bg-blue-100 text-blue-800",
  "Coding Projects": "bg-emerald-100 text-emerald-800",
  Photography: "bg-rose-100 text-rose-800",
};

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  modified?: string;
  category: Category;
  excerpt: string;
  coverImage: string;
  readingTime: string;
}

export interface Post extends PostMeta {
  content: string;
}

const postDateFormat = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

/** Formats a `YYYY-MM-DD` post date as the authored day, whatever the viewer's timezone. */
export function formatPostDate(date: string) {
  return postDateFormat.format(new Date(`${date}T12:00:00Z`));
}
