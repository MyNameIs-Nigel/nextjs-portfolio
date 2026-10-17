import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { CAMERA_FIELDS, formatPhotoDate, type Photo, type CameraDetails } from "@/lib/photo-schema";
import { photoImageUrl } from "@/lib/r2";

// Rendered width of a photo capped at 85svh tall; --ar is width / height.
const FIT_WIDTH = "w-[min(100%,calc(85svh*var(--ar)))]";

export default function PhotoFigure({ photo, preload = false, detail = false }: { photo: Photo; preload?: boolean; detail?: boolean }) {
  // Portraits sit beside their details, editorial style; everything else runs full width with the caption below.
  const portrait = photo.height > photo.width;
  const href = `/photos/${photo.id}`;
  const date = photo.date ? formatPhotoDate(photo.date, photo.dateApproximate) : "";
  const exif = (Object.entries(CAMERA_FIELDS) as [keyof CameraDetails, string][]).filter(([key]) => photo.exif[key]);
  const style = { "--ar": photo.width / photo.height } as CSSProperties;
  const image = (
    <Image
      src={photoImageUrl(photo)} alt={photo.alt || photo.title} width={photo.width} height={photo.height}
      sizes={portrait ? "(max-width: 768px) calc(100vw - 48px), (max-width: 1280px) 58vw, 690px" : "(max-width: 768px) calc(100vw - 48px), (max-width: 1280px) calc(100vw - 96px), 1184px"}
      preload={preload}
      className="block h-auto w-full bg-stone-100 shadow-paper"
    />
  );
  const media = detail ? image : <Link href={href} className="block transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent" aria-label={`View ${photo.title}`}>{image}</Link>;
  const title = (className: string) => detail
    ? <h1 className={`font-display ${className}`}>{photo.title}</h1>
    : <h2 className={`font-display ${className}`}><Link href={href} className="hover:text-accent">{photo.title}</Link></h2>;
  const caption = photo.caption && <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-muted">{photo.caption}</p>;

  if (portrait) return (
    <figure id={`photo-${photo.id}`} style={style} className="grid scroll-mt-28 gap-8 md:grid-cols-[min(calc(85svh*var(--ar)),58%)_minmax(0,1fr)] md:items-end md:gap-[clamp(2.5rem,6vw,6rem)]">
      <div className={`${FIT_WIDTH} md:w-full`}>{media}</div>
      <figcaption className="min-w-0 md:pb-1">
        {date && <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-accent"><span className="h-px w-8 bg-accent" aria-hidden="true" />{date}</p>}
        {title("mt-4 text-[length:clamp(2rem,3.6vw,3rem)] leading-[1.1] tracking-[-0.01em]")}
        {caption}
        {exif.length > 0 && <dl aria-label="Camera details" className="mt-8 border-t border-border text-[0.8125rem]">{exif.map(([key, label]) => <div key={key} className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-4 border-b border-border py-2.5"><dt className="pt-px text-[0.7rem] uppercase tracking-[0.14em] text-muted">{label}</dt><dd className="break-words">{photo.exif[key]}</dd></div>)}</dl>}
        {!detail && <Link href={href} className="mt-7 inline-block border-b border-accent pb-1 text-sm font-medium text-accent">View photo <span aria-hidden="true">↗</span></Link>}
      </figcaption>
    </figure>
  );
  return (
    <figure id={`photo-${photo.id}`} style={style} className={`mx-auto scroll-mt-28 ${FIT_WIDTH}`}>
      {media}
      <figcaption className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-8">
        <div className="max-w-2xl">
          {title(detail ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl")}
          {caption}
          {exif.length > 0 && <dl aria-label="Camera details" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs leading-relaxed text-muted">{exif.map(([key, label]) => <div key={key} className="min-w-0 max-w-full"><dt className="sr-only">{label}</dt><dd className="break-words">{key === "iso" ? `ISO ${photo.exif[key]}` : photo.exif[key]}</dd></div>)}</dl>}
        </div>
        {date && <span className="shrink-0 text-xs font-medium tracking-[0.12em] text-muted sm:pt-2">{date}</span>}
      </figcaption>
    </figure>
  );
}
