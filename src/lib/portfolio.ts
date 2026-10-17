export type Project = {
  id: number;
  title: string;
  category: string;
  type: "photo" | "video";
  /** Full-size file under public/, shown in the lightbox. */
  src: string;
  /** Grid thumbnail under public/. */
  thumb: string;
  height: "tall" | "medium" | "short";
};

export const projects: Project[] = [
  { id: 1, title: "America in the Wind", category: "Portrait", type: "photo", src: "/original/maxflag.jpg", thumb: "/thumb/maxflag.jpg", height: "tall" },
  { id: 2, title: "Cold Streetlight", category: "Landscape", type: "photo", src: "/original/streetlight.jpg", thumb: "/thumb/streetlight.jpg", height: "short" },
  { id: 3, title: "Car Show", category: "Automotive", type: "photo", src: "/original/carshow.jpg", thumb: "/thumb/carshow.jpg", height: "short" },
  { id: 4, title: "Emmaline & GlaDOS", category: "Film", type: "photo", src: "/original/emmachicken.jpg", thumb: "/thumb/emmachicken.jpg", height: "tall" },
  { id: 5, title: "Morning Fog", category: "Landscape", type: "photo", src: "/original/fog.jpg", thumb: "/thumb/fog.jpg", height: "short" },
  { id: 6, title: "Aquarium Drama", category: "Portrait", type: "photo", src: "/original/aquarium_drama.jpg", thumb: "/thumb/aquarium_drama.jpg", height: "tall" },
  { id: 7, title: "Burnt Alleyway", category: "Architecture", type: "photo", src: "/original/alley.jpg", thumb: "/thumb/alley.jpg", height: "tall" },
  { id: 8, title: "Fall Path", category: "Film", type: "photo", src: "/original/path.jpg", thumb: "/thumb/path.jpg", height: "medium" },
  { id: 9, title: "Barn", category: "Architecture", type: "photo", src: "/original/farm.jpg", thumb: "/thumb/farm.jpg", height: "tall" },
  { id: 10, title: "Elder Tanuvasa", category: "Portrait", type: "photo", src: "/original/street_tanuvasa.jpg", thumb: "/thumb/street_tanuvasa.jpg", height: "short" },
  { id: 11, title: "B&W Architecture", category: "Architecture", type: "photo", src: "/original/bw.jpg", thumb: "/thumb/bw.jpg", height: "tall" },
  { id: 12, title: "Stairs", category: "Architecture", type: "photo", src: "/original/stairs.jpg", thumb: "/thumb/stairs.jpg", height: "short" },
  { id: 13, title: "Paintful Lighting", category: "Film", type: "photo", src: "/original/painting.jpg", thumb: "/thumb/painting.jpg", height: "tall" },
  { id: 14, title: "Some Rock", category: "Film", type: "photo", src: "/original/rock.jpg", thumb: "/thumb/rock.jpg", height: "medium" },
  { id: 15, title: "Couple Goals", category: "Portrait", type: "photo", src: "/original/e4t.jpg", thumb: "/thumb/e4t.jpg", height: "tall" },
  { id: 16, title: "Liminal Halls", category: "Architecture", type: "photo", src: "/original/liminal.jpg", thumb: "/thumb/liminal.jpg", height: "tall" },
  { id: 17, title: "Skipper", category: "Portrait", type: "photo", src: "/original/skip.jpg", thumb: "/thumb/skip.jpg", height: "short" },
  { id: 18, title: "Ernie", category: "Portrait", type: "photo", src: "/original/ernie.jpg", thumb: "/thumb/ernie.jpg", height: "short" },
];

export const PORTFOLIO_CATEGORIES = ["All", ...new Set(projects.map((project) => project.category))];
