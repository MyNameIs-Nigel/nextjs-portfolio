import Image from "next/image";
import Link from "next/link";
import { formatPhotoDate, type Photo } from "@/lib/photo-schema";
import { photoImageUrl } from "@/lib/r2";

export default function PhotoFigure({ photo, priority = false, detail = false }: { photo: Photo; priority?: boolean; detail?: boolean }) {
  const image = (
    <Image
      src={photoImageUrl(photo)} alt={photo.alt} width={photo.width} height={photo.height}
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
        </div>
        <time dateTime={photo.date} className="shrink-0 text-xs font-medium uppercase tracking-[0.12em] text-muted sm:pt-2">{formatPhotoDate(photo.date)}</time>
      </figcaption>
    </figure>
  );
}
