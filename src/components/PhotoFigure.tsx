import Image from "next/image";
import Link from "next/link";
import { CAMERA_FIELDS, formatPhotoDate, type Photo, type CameraDetails } from "@/lib/photo-schema";
import { photoImageUrl } from "@/lib/r2";

export default function PhotoFigure({ photo, priority = false, detail = false }: { photo: Photo; priority?: boolean; detail?: boolean }) {
  const image = (
    <Image
      src={photoImageUrl(photo)} alt={photo.alt || photo.title} width={photo.width} height={photo.height}
      sizes="(max-width: 768px) calc(100vw - 48px), (max-width: 1280px) calc(100vw - 96px), 1120px"
      priority={priority}
      className="mx-auto block h-auto max-h-[85svh] w-auto max-w-full object-contain"
    />
  );
  return (
    <figure id={`photo-${photo.id}`} className="scroll-mt-28">
      <div className="flex min-h-40 items-center justify-center overflow-hidden bg-stone-100">
        {detail ? image : <Link href={`/photos/${photo.id}`} className="block w-full transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent" aria-label={`View ${photo.title}`}>{image}</Link>}
      </div>
      <figcaption className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-8">
        <div className="max-w-2xl">
          {detail ? <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl">{photo.title}</h1> : <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl"><Link href={`/photos/${photo.id}`} className="hover:text-accent">{photo.title}</Link></h2>}
          {photo.caption && <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-muted">{photo.caption}</p>}
          {Object.keys(photo.exif).length > 0 && <dl aria-label="Camera details" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs leading-relaxed text-muted">{(Object.entries(CAMERA_FIELDS) as [keyof CameraDetails, string][]).map(([key, label]) => photo.exif[key] && <div key={key} className="min-w-0 max-w-full"><dt className="sr-only">{label}</dt><dd className="break-words">{key === "iso" ? `ISO ${photo.exif[key]}` : photo.exif[key]}</dd></div>)}</dl>}
        </div>
        {photo.date && <span className="shrink-0 text-xs font-medium tracking-[0.12em] text-muted sm:pt-2">{formatPhotoDate(photo.date, photo.dateApproximate)}</span>}
      </figcaption>
    </figure>
  );
}
