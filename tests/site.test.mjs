import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { absoluteUrl, siteOpenGraph, siteUrl } from "../src/lib/site.ts";
import { getDailyHeroImage, getHeroImages } from "../src/lib/hero-images.ts";
import { PORTFOLIO_CATEGORIES, projects } from "../src/lib/portfolio.ts";

const DAY = 86_400_000;
const publicFile = (webPath) => existsSync(path.join("public", webPath));

test("absolute URLs resolve against the canonical origin", () => {
  assert.equal(siteUrl, "https://ndsironwood.com");
  assert.equal(absoluteUrl("/"), "https://ndsironwood.com/");
  assert.equal(absoluteUrl("/photos?page=2"), "https://ndsironwood.com/photos?page=2");
  assert.equal(absoluteUrl("sitemap.xml"), "https://ndsironwood.com/sitemap.xml");
  assert.equal(siteOpenGraph.title, "Nigel Smith — Photographer");
});

test("the hero rotates through every hero image once per UTC day", () => {
  const images = getHeroImages();
  assert.ok(images.length > 1);
  assert.deepEqual(images, [...images].sort());
  for (const image of images) {
    assert.match(image, /^\/hero\/hero.*\.jpe?g$/i);
    assert.ok(publicFile(image), image);
  }
  const day = Date.UTC(2026, 9, 17);
  assert.equal(getDailyHeroImage(day), getDailyHeroImage(day + DAY - 1), "stable within a day");
  assert.notEqual(getDailyHeroImage(day), getDailyHeroImage(day + DAY), "changes at midnight UTC");
  const cycle = images.map((_, index) => getDailyHeroImage(day + index * DAY));
  assert.deepEqual([...cycle].sort(), images, "each image appears once per cycle");
  assert.equal(getDailyHeroImage(day + images.length * DAY), getDailyHeroImage(day));
});

test("every portfolio project points at images that exist", () => {
  assert.equal(new Set(projects.map((project) => project.id)).size, projects.length, "ids are unique keys");
  for (const project of projects) {
    assert.ok(project.title.trim(), project.id);
    assert.ok(publicFile(project.src), project.src);
    assert.ok(publicFile(project.thumb), project.thumb);
  }
  assert.equal(PORTFOLIO_CATEGORIES[0], "All");
  assert.equal(new Set(PORTFOLIO_CATEGORIES).size, PORTFOLIO_CATEGORIES.length);
  for (const category of PORTFOLIO_CATEGORIES.slice(1)) assert.ok(projects.some((project) => project.category === category));
});
