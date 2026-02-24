"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";

type Project = {
  id: number;
  title: string;
  category: string;
  type: "photo" | "video";
  src: string;
  thumb: string;
  height: "tall" | "medium" | "short";
};

const projects: Project[] = [
  {
    id: 1,
    title: "America in the Wind",
    category: "Portrait",
    type: "photo",
    src: "/original/maxflag.jpg",
    thumb:
      "/thumb/maxflag.jpg",
    height: "tall",
  },
  {
    id: 2,
    title: "Cold Streetlight",
    category: "Landscape",
    type: "photo",
    src: "/original/streetlight.jpg",
    thumb:
      "/thumb/streetlight.jpg",
    height: "short",
  },
  {
    id: 3,
    title: "Car Show",
    category: "Automotive",
    type: "photo",
    src: "/original/carshow.jpg",
    thumb:
      "/thumb/carshow.jpg",
    height: "short",
  },
  {
    id: 4,
    title: "Emmaline & GlaDOS",
    category: "Film",
    type: "photo",
    src: "/original/emmachicken.jpg",
    thumb:
      "/thumb/emmachicken.jpg",
    height: "tall",
  },
  {
    id: 5,
    title: "Morning Fog",
    category: "Landscape",
    type: "photo",
    src: "/original/fog.jpg",
    thumb:
      "/thumb/fog.jpg",
    height: "short",
  },
  {
    id: 6,
    title: "Aquarium Drama",
    category: "Portrait",
    type: "photo",
    src: "/original/aquarium_drama.jpg",
    thumb:
      "/thumb/aquarium_drama.jpg",
    height: "tall",
  },
  {
    id: 7,
    title: "Burnt Alleyway",
    category: "Architecture",
    type: "photo",
    src: "/original/alley.jpg",
    thumb:
      "/thumb/alley.jpg",
    height: "tall",
  },
  {
    id: 8,
    title: "Fall Path",
    category: "Film",
    type: "photo",
    src: "/original/path.jpg",
    thumb:
      "/thumb/path.jpg",
    height: "medium",
  },
  {
    id: 9,
    title: "Barn",
    category: "Architecture",
    type: "photo",
    src: "/original/farm.jpg",
    thumb:
      "/thumb/farm.jpg",
    height: "tall",
  },  
  {
    id: 10,
    title: "Elder Tanuvasa",
    category: "Portrait",
    type: "photo",
    src: "/original/street_tanuvasa.jpg",
    thumb:
      "/thumb/street_tanuvasa.jpg",
    height: "short",
  },  
  {
    id: 11,
    title: "B&W Architecture",
    category: "Architecture",
    type: "photo",
    src: "/original/bw.jpg",
    thumb:
      "/thumb/bw.jpg",
    height: "tall",
  },  
  {
    id: 12,
    title: "Stairs",
    category: "Architecture",
    type: "photo",
    src: "/original/stairs.jpg",
    thumb:
      "/thumb/stairs.jpg",
    height: "short",
  },  
  {
    id: 13,
    title: "Paintful Lighting",
    category: "Film",
    type: "photo",
    src: "/original/painting.jpg",
    thumb:
      "/thumb/painting.jpg",
    height: "tall",
  },  
  {
    id: 14,
    title: "Some Rock",
    category: "Film",
    type: "photo",
    src: "/original/rock.jpg",
    thumb:
      "/thumb/rock.jpg",
    height: "medium",
  },  
  {
    id: 15,
    title: "Couple Goals",
    category: "Portrait",
    type: "photo",
    src: "/original/e4t.jpg",
    thumb:
      "/thumb/e4t.jpg",
    height: "tall",
  },  
  {
    id: 16,
    title: "Liminal Halls",
    category: "Architecture",
    type: "photo",
    src: "/original/liminal.jpg",
    thumb:
      "/thumb/liminal.jpg",
    height: "tall",
  },  
  {
    id: 17,
    title: "Skipper",
    category: "Portrait",
    type: "photo",
    src: "/original/skip.jpg",
    thumb:
      "/thumb/skip.jpg",
    height: "short",
  },  
  {
    id: 18,
    title: "Ernie",
    category: "Portrait",
    type: "photo",
    src: "/original/ernie.jpg",
    thumb:
      "/thumb/ernie.jpg",
    height: "short",
  },  
];

const categories = ["All", ...new Set(projects.map((p) => p.category))];

function ProjectCard({
  project,
  index,
  onClick,
}: {
  project: Project;
  index: number;
  onClick: () => void;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const heightClass =
    project.height === "tall"
      ? "aspect-[3/4]"
      : project.height === "medium"
        ? "aspect-[4/3]"
        : "aspect-square";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group relative mb-4 cursor-pointer overflow-hidden rounded-lg break-inside-avoid"
      onClick={onClick}
    >
      <div className={`relative w-full ${heightClass}`}>
        <Image
          src={project.thumb}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Video icon */}
        {project.type === "video" && (
          <div className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 backdrop-blur-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M4 2.5v11l9-5.5-9-5.5z" />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="text-xs font-medium uppercase tracking-widest text-accent">
            {project.category}
          </span>
          <h3 className="mt-1 font-[family-name:var(--font-playfair)] text-xl font-bold text-white">
            {project.title}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}

function Lightbox({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          aria-label="Close lightbox"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {project.type === "video" ? (
          <video
            autoPlay
            controls
            className="max-h-[85vh] w-full rounded-lg"
            src={project.src}
          />
        ) : (
          <Image
            src={project.src}
            alt={project.title}
            width={1200}
            height={800}
            className="max-h-[85vh] w-auto rounded-lg object-contain"
          />
        )}

        {/* Caption */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <span className="text-xs font-medium uppercase tracking-widest text-accent">
            {project.category}
          </span>
          <h3 className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
            {project.title}
          </h3>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const sectionRef = useRef(null);
  const headerInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const filtered =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="work" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section header */}
        <div ref={sectionRef} className="mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium uppercase tracking-[0.2em] text-accent"
          >
            Selected Work
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-3 font-[family-name:var(--font-playfair)] text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Portfolio
          </motion.h2>
        </div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 flex flex-wrap gap-3"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-foreground text-white"
                  : "bg-stone-100 text-muted hover:bg-stone-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* CSS Columns masonry grid */}
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {filtered.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              onClick={() => {
                setSelectedProject(project);
                document.body.classList.add("no-scroll");
              }}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedProject && (
          <Lightbox
            project={selectedProject}
            onClose={() => {
              setSelectedProject(null);
              document.body.classList.remove("no-scroll");
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
