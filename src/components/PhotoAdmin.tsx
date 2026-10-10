"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CAMERA_FIELDS, MAX_PHOTO_BYTES, formatPhotoDate, validDate, type Photo, type CameraDetails } from "@/lib/photo-schema";
import { emptyPhotoMetadata, readPhotoMetadata } from "@/lib/photo-metadata";

const fieldClass = "mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-60";
const buttonClass = "rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-accent-hover disabled:cursor-wait disabled:opacity-50";

async function api(path: string, body?: unknown, method = "POST") {
  const response = await fetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again.");
  return result;
}

async function prepareImage(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Choose a JPEG, PNG, or WebP image. Export HEIC or RAW files first.");
  if (file.size > 40 * 1024 * 1024) throw new Error("Choose an image under 40 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 2560 / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare the image.");
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Could not prepare this image.")), "image/webp", 0.88));
    if (blob.size > MAX_PHOTO_BYTES) throw new Error("This image is too large after preparation. Try a smaller export.");
    return { blob, width, height };
  } finally {
    bitmap.close();
  }
}

export function PhotoLogin() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    try {
      await api("/api/photos/session", { password: new FormData(form).get("password") });
      form.reset();
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not sign in.");
    } finally { setBusy(false); }
  }
  return <form onSubmit={login} className="mx-auto max-w-md rounded-2xl border border-border bg-white p-8 sm:p-10">
    <p className="text-xs uppercase tracking-[0.2em] text-accent">For your eyes only</p>
    <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl">Your photo journal.</h1>
    <p className="mt-4 leading-relaxed text-muted">Sign in to share a new photograph.</p>
    <label className="mt-8 block text-sm font-medium" htmlFor="password">Owner password</label>
    <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={1024} disabled={busy} className={fieldClass} />
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    <button disabled={busy} className={`${buttonClass} mt-6 w-full`}>{busy ? "Signing in…" : "Sign in"}</button>
  </form>;
}

export function PhotoUploader({ photos, missingSettings, loadFailed }: { photos: (Photo & { imageUrl: string })[]; missingSettings: string[]; loadFailed: boolean }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [draft, setDraft] = useState(emptyPhotoMetadata);
  const [datePrecision, setDatePrecision] = useState("unknown");
  const [dateApproximate, setDateApproximate] = useState(false);
  const [readingMetadata, setReadingMetadata] = useState(false);
  const [metadataStatus, setMetadataStatus] = useState("");
  const busy = !!progress || readingMetadata;
  const blocked = missingSettings.length > 0;

  async function selectPhoto(selected: File | null) {
    setFile(selected); setFileName(selected?.name ?? ""); setError(""); setSuccess("");
    setDraft(emptyPhotoMetadata()); setDatePrecision("unknown"); setDateApproximate(false); setMetadataStatus("");
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type) || selected.size > 40 * 1024 * 1024) {
      setError("Choose a JPEG, PNG, or WebP image under 40 MB."); setFile(null); return;
    }
    setReadingMetadata(true);
    try {
      const metadata = await readPhotoMetadata(selected);
      setDraft(metadata);
      setDatePrecision(metadata.date ? metadata.date.length === 4 ? "year" : metadata.date.length === 7 ? "month" : "day" : "unknown");
      setDateApproximate(!!metadata.date && metadata.date.length < 10);
      setMetadataStatus(Object.values(metadata).some((value) => typeof value === "string" ? !!value : Object.keys(value).length > 0) ? "Available metadata filled in. Review it before publishing; anything can be changed or cleared." : "No supported metadata found. Add a title; everything else is optional.");
    } catch {
      setMetadataStatus("This photo’s metadata could not be read. Add a title; everything else is optional.");
    } finally { setReadingMetadata(false); }
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) { setError("Choose a photo first."); return; }
    const form = event.currentTarget;
    const fields = { ...draft, dateApproximate };
    setError("");
    setSuccess("");
    try {
      setProgress("Preparing your image…");
      const { blob, width, height } = await prepareImage(file);
      setProgress("Connecting to your bucket…");
      const upload = await api("/api/photos", { action: "prepare", contentType: blob.type, width, height, ...fields });
      setProgress("Uploading your photograph…");
      const response = await fetch(upload.url, { method: "PUT", headers: { "Content-Type": blob.type, "Cache-Control": "public, max-age=31536000, immutable" }, body: blob });
      if (!response.ok) throw new Error("The image upload failed. Check your bucket’s CORS settings and try again.");
      setProgress("Publishing to the journal…");
      await api("/api/photos", { action: "publish", id: upload.id, imageKey: upload.imageKey, width, height, ...fields });
      form.reset();
      setFile(null);
      setFileName("");
      setDraft(emptyPhotoMetadata()); setDatePrecision("unknown"); setDateApproximate(false); setMetadataStatus("");
      setSuccess("Your photo is published.");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not publish this photo.");
    } finally { setProgress(""); }
  }

  async function remove(id: string) {
    setRemoving(id);
    setError("");
    setSuccess("");
    try {
      await api("/api/photos", { id }, "DELETE");
      setSuccess("Photo removed from the journal.");
      setConfirmId(null);
      router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Could not remove this photo."); }
    finally { setRemoving(null); }
  }

  return <div>
    <header className="mb-10 flex flex-wrap items-end justify-between gap-5">
      <div><p className="text-xs uppercase tracking-[0.2em] text-accent">Behind the lens</p><h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl">Your photo journal.</h1><p className="mt-4 text-muted">A place for the next photograph.</p></div>
      <button className="text-sm text-muted underline underline-offset-4 disabled:opacity-50" disabled={busy || signingOut || !!removing} onClick={async () => {
        setSigningOut(true);
        try { await api("/api/photos/session", undefined, "DELETE"); router.refresh(); }
        catch { setError("Could not sign out. Please try again."); }
        finally { setSigningOut(false); }
      }}>{signingOut ? "Signing out…" : "Sign out"}</button>
    </header>
    {blocked && <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm leading-relaxed text-amber-950"><h2 className="font-semibold">Connect your R2 bucket to start publishing</h2><p className="mt-2">Add these environment variables in Vercel, then redeploy:</p><ul className="mt-3 list-inside list-disc font-mono text-xs">{missingSettings.map((key) => <li key={key}>{key}</li>)}</ul><p className="mt-3">The repository’s docs/PHOTO-JOURNAL.md walks through the bucket, public domain, and CORS setup.</p></div>}
    <form onSubmit={publish} className="rounded-2xl border border-border bg-white p-6 sm:p-8">
      <h2 className="font-[family-name:var(--font-playfair)] text-2xl">Share a photograph</h2>
      <fieldset disabled={busy || blocked} className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2"><label htmlFor="photo-file" className="block text-sm font-medium">Photograph</label><input id="photo-file" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required className={`${fieldClass} file:mr-4 file:rounded-full file:border-0 file:bg-stone-100 file:px-4 file:py-2 file:text-sm`} onChange={(event) => {
          void selectPhoto(event.target.files?.[0] ?? null);
        }} /><p className="mt-2 text-xs leading-relaxed text-muted">JPEG, PNG, or WebP, up to 40 MB. A web-sized copy is prepared automatically; your original stays with you. Location metadata is removed.</p>{fileName && <p className="mt-2 break-all text-sm text-accent">Selected: {fileName}</p>}</div>
        <p role="status" className="text-sm text-muted sm:col-span-2">{readingMetadata ? "Reading photo metadata…" : metadataStatus || "Only a title is required. Embedded titles, captions, capture dates, and camera details fill in when available."}</p>
        <label className="text-sm font-medium sm:col-span-2">Title <span className="font-normal text-muted">(required)</span><input name="title" required maxLength={160} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Morning on the back roads" className={fieldClass} /></label>
        <label className="text-sm font-medium">Date precision <span className="font-normal text-muted">(optional)</span><select name="datePrecision" value={datePrecision} onChange={(event) => {
          const precision = event.target.value;
          const length = precision === "year" ? 4 : precision === "month" ? 7 : precision === "day" ? 10 : 0;
          setDatePrecision(precision);
          setDraft({ ...draft, date: length && draft.date.length >= length ? draft.date.slice(0, length) : "" });
          setDateApproximate(precision === "year" || precision === "month");
        }} className={fieldClass}><option value="unknown">Unknown / leave blank</option><option value="year">Year</option><option value="month">Year and month</option><option value="day">Full date</option></select></label>
        {datePrecision !== "unknown" && <label className="text-sm font-medium">Date photographed<input name="date" type={datePrecision === "year" ? "text" : datePrecision === "month" ? "month" : "date"} {...(datePrecision === "year" ? { inputMode: "numeric" as const, pattern: "[1-9][0-9]{3}", maxLength: 4, placeholder: "1998" } : {})} value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className={fieldClass} /></label>}
        {datePrecision !== "unknown" && <div className="sm:col-span-2"><label className="flex items-center gap-3 text-sm"><input name="dateApproximate" type="checkbox" checked={datePrecision !== "day" || dateApproximate} disabled={datePrecision !== "day"} onChange={(event) => setDateApproximate(event.target.checked)} className="accent-accent" />Approximate date</label><p className="mt-2 text-xs text-muted">Year-only and month-only dates always show “approx.”{validDate(draft.date) && ` Preview: ${formatPhotoDate(draft.date, dateApproximate)}`}</p></div>}
        <label className="text-sm font-medium sm:col-span-2">Image description <span className="font-normal text-muted">(optional)</span><input name="alt" maxLength={500} value={draft.alt} onChange={(event) => setDraft({ ...draft, alt: event.target.value })} placeholder="Describe what is in the photograph" className={fieldClass} /><span className="mt-2 block text-xs font-normal leading-relaxed text-muted">Used by screen readers and search engines. If left blank, the title is used.</span></label>
        <label className="text-sm font-medium sm:col-span-2">Caption <span className="font-normal text-muted">(optional)</span><textarea name="caption" maxLength={3000} rows={4} value={draft.caption} onChange={(event) => setDraft({ ...draft, caption: event.target.value })} placeholder="A few words about this moment…" className={`${fieldClass} resize-y`} /></label>
        <div className="sm:col-span-2"><h3 className="font-[family-name:var(--font-playfair)] text-xl">Camera details <span className="font-sans text-sm font-normal text-muted">(optional)</span></h3><p className="mt-2 text-xs leading-relaxed text-muted">Read from the original photograph when available. Add, correct, or clear any field, including for film.</p><div className="mt-4 grid gap-4 sm:grid-cols-2">{(Object.entries(CAMERA_FIELDS) as [keyof CameraDetails, string][]).map(([key, label]) => <label key={key} className="text-sm font-medium">{label}<input name={key} value={draft.exif[key] ?? ""} maxLength={200} onChange={(event) => setDraft({ ...draft, exif: { ...draft.exif, [key]: event.target.value } })} className={fieldClass} /></label>)}</div></div>
      </fieldset>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><p className="max-w-md text-xs leading-relaxed text-muted">Publishing makes the photograph and the details above public.</p><button disabled={busy || blocked} className={buttonClass}>{readingMetadata ? "Reading metadata…" : progress || "Publish photograph ↗"}</button></div>
    </form>
    <div aria-live="polite" aria-atomic="true">{error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p>}{success && <p className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-800">{success} <Link href="/photos" className="underline">View the journal</Link></p>}</div>
    <section className="mt-14"><div className="mb-6 flex items-baseline justify-between"><h2 className="font-[family-name:var(--font-playfair)] text-3xl">Published photographs</h2><span className="text-sm text-muted">{photos.length} entries</span></div>
      {loadFailed && <p role="alert" className="mb-5 text-sm text-red-700">Could not load the journal. Check your R2 connection and refresh.</p>}
      {photos.length === 0 ? <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">Your first photograph starts the collection.</p> : <ul className="divide-y divide-border">{photos.map((photo) => <li key={photo.id} className="flex items-center gap-4 py-5">
        <Image src={photo.imageUrl} alt="" width={80} height={80} sizes="80px" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1"><Link href={`/photos/${photo.id}`} className="break-words font-medium hover:text-accent">{photo.title}</Link>{photo.date && <p className="mt-1 text-xs text-muted">{formatPhotoDate(photo.date, photo.dateApproximate)}</p>}</div>
        {confirmId === photo.id ? <div className="flex flex-col gap-2 text-right text-xs"><span>Remove permanently?</span><div className="flex gap-3"><button disabled={busy || !!removing} className="text-red-700 underline" onClick={() => remove(photo.id)}>{removing === photo.id ? "Removing…" : "Remove"}</button><button disabled={!!removing} className="text-muted underline" onClick={() => setConfirmId(null)}>Cancel</button></div></div> : <button disabled={busy || !!removing} className="text-xs text-muted underline underline-offset-4" aria-label={`Remove ${photo.title}`} onClick={() => setConfirmId(photo.id)}>Remove</button>}
      </li>)}</ul>}
    </section>
  </div>;
}
