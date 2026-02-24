"use client";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-foreground px-6 py-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-stone-500">
          &copy; {new Date().getFullYear()} Alex Mercer. All rights reserved.
        </p>
        <div className="flex gap-6">
          {["Instagram", "Vimeo", "Behance"].map((social) => (
            <a
              key={social}
              href="#"
              className="text-sm text-stone-500 transition-colors hover:text-accent"
            >
              {social}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
