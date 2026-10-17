import test from "node:test";
import assert from "node:assert/strict";
import { getAllPosts, getPostBySlug, parsePost } from "../src/lib/blog.ts";
import { CATEGORIES, formatPostDate } from "../src/lib/blog-types.ts";

const mdx = (frontmatter, body = "Some words about a photograph.") => `---\n${frontmatter}\n---\n\n${body}\n`;

test("post dates show the authored calendar day in every timezone", () => {
  // The blog index renders in the visitor's browser, so local time must not shift the day.
  for (const timeZone of ["UTC", "America/New_York", "America/Los_Angeles", "Pacific/Kiritimati"]) {
    process.env.TZ = timeZone;
    assert.equal(formatPostDate("2026-03-12"), "March 12, 2026", timeZone);
    assert.equal(formatPostDate("2026-01-01"), "January 1, 2026", timeZone);
  }
});

test("frontmatter dates are normalized whether or not they are quoted", () => {
  const quoted = parsePost("quoted", mdx(`title: "Quoted"\ndate: "2026-03-12"\nmodified: "2026-03-16"\ncategory: "Photography"`));
  assert.equal(quoted.date, "2026-03-12");
  assert.equal(quoted.modified, "2026-03-16");
  assert.equal(quoted.excerpt, "");
  assert.equal(quoted.coverImage, "");
  // Unquoted YAML dates parse as Date objects; they must not leak into the page as objects.
  const unquoted = parsePost("unquoted", mdx(`title: Unquoted\ndate: 2026-03-12\nmodified: 2026-03-12\ncategory: Automotive`));
  assert.equal(unquoted.date, "2026-03-12");
  assert.equal("modified" in unquoted, false, "a modified date equal to the publish date is omitted");
  assert.match(unquoted.readingTime, /min read/);
  assert.equal(unquoted.content.trim(), "Some words about a photograph.");
});

test("malformed frontmatter fails loudly and names the post", () => {
  for (const frontmatter of [
    `date: "2026-03-12"\ncategory: Photography`,
    `title: Missing date\ncategory: Photography`,
    `title: Wrong format\ndate: "March 12, 2026"\ncategory: Photography`,
    `title: Impossible day\ndate: "2026-02-30"\ncategory: Photography`,
    `title: Bad modified\ndate: "2026-03-12"\nmodified: "soon"\ncategory: Photography`,
    `title: Unknown category\ndate: "2026-03-12"\ncategory: Cooking`,
  ]) {
    assert.throws(() => parsePost("broken-post", mdx(frontmatter)), /broken-post/, frontmatter);
  }
});

test("published posts have valid frontmatter, sort newest first, and resolve by slug", () => {
  const posts = getAllPosts();
  assert.ok(posts.length > 0);
  const dates = posts.map((post) => post.date);
  assert.deepEqual(dates, [...dates].sort().reverse());
  for (const meta of posts) {
    assert.ok(CATEGORIES.includes(meta.category), meta.slug);
    assert.ok(meta.title && meta.excerpt, meta.slug);
    const post = getPostBySlug(meta.slug);
    assert.deepEqual({ ...post, content: undefined }, { ...meta, content: undefined });
    assert.ok(post.content.trim().length > 0);
  }
});

test("only files in the blog folder resolve as posts", () => {
  for (const slug of ["missing-post", "../README", "../../WRITEUP", "", "building-this-portfolio.mdx"]) {
    assert.equal(getPostBySlug(slug), null, slug);
  }
});

