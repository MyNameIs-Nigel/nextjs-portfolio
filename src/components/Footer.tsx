import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-foreground px-6 py-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-stone-500">
          &copy; {new Date().getFullYear()} Nigel Smith. All rights reserved.
        </p>
        <nav aria-label="Footer" className="flex gap-6">
          {[{ label: "Selected work", href: "/#work" }, { label: "Photo journal", href: "/photos" }, { label: "Contact", href: "/#contact" }].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-stone-500 transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
