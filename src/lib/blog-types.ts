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
