/** Curated starter frames. Null metadata renders as Unknown.
 * Film stock comes from the supplied folder, never from scan filenames.
 * Titles are descriptive working titles; replace story with your own words.
 * WebP derivatives have a minimal scan-edge crop to exact 135 proportions.
 */
export type FilmFrame = {
  id: string;
  title: string;
  alt: string;
  orientation: "portrait" | "landscape";
  filmStock: string | null;
  cameraLens: string | null;
  estimatedDate: string | null;
  story: string | null;
  source: string;
};

export const filmFrames: FilmFrame[] = [
  {
    id: "afternoon-drive", title: "An afternoon, parked.",
    alt: "A silver coupe parked on grass beside a sunlit house.",
    orientation: "portrait", filmStock: "Kodak Gold 200",
    cameraLens: null, estimatedDate: null, story: null,
    source: "Kodak Gold 200/0586309_0586309-R1-060-28A.jpg",
  },
  {
    id: "window-light", title: "Where the light settles.",
    alt: "Warm sunlight falling through dining room windows onto a wooden table and chairs.",
    orientation: "landscape", filmStock: null,
    cameraLens: null, estimatedDate: null, story: null,
    source: "Currently Unknown/000966870007.jpg",
  },
  {
    id: "along-the-fence", title: "The quieter way around.",
    alt: "A weathered wooden fence and metal gate surrounded by green and autumn-colored foliage.",
    orientation: "portrait", filmStock: "Fuji 400",
    cameraLens: null, estimatedDate: null, story: null,
    source: "Fuji 400/003879400015.jpg",
  },
  {
    id: "snow-day", title: "A little winter joy.",
    alt: "A dog running through bright snow beneath long shadows from the trees.",
    orientation: "portrait", filmStock: null,
    cameraLens: null, estimatedDate: null, story: null,
    source: "Currently Unknown/000966870016.jpg",
  },
  {
    id: "last-light", title: "After the sun goes down.",
    alt: "A glowing wall light and street lamp against a pink and orange evening sky.",
    orientation: "portrait", filmStock: "Kodak Gold 200",
    cameraLens: null, estimatedDate: null, story: null,
    source: "Kodak Gold 200/0586309_0586309-R1-064-30A.jpg",
  },
];
