import { revalidatePath, revalidateTag } from "next/cache";
import { isPhotoAdmin, privateJson, readJson, sameOrigin } from "@/lib/photo-auth";
import { prepareUpload, publishPhoto, deletePhoto, missingR2Settings } from "@/lib/r2";
import { parsePhotoFields } from "@/lib/photo-schema";

export const runtime = "nodejs";

function refreshPhotos() {
  revalidateTag("photos", { expire: 0 });
  revalidatePath("/photos", "layout");
  revalidatePath("/sitemap.xml");
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "Invalid request origin." }, 403);
  if (!await isPhotoAdmin()) return privateJson({ error: "Sign in to upload photos." }, 401);
  if (missingR2Settings().length) return privateJson({ error: "Connect the R2 bucket before uploading." }, 503);
  let input: Record<string, unknown>;
  try {
    input = await readJson(request);
    if (input.action === "prepare") {
      parsePhotoFields(input);
      if (typeof input.contentType !== "string" || !["image/webp", "image/jpeg", "image/png"].includes(input.contentType)) throw new Error("Unsupported image format.");
    } else if (input.action !== "publish") {
      throw new Error("Unknown upload action.");
    } else {
      parsePhotoFields(input);
    }
  } catch (error) {
    return privateJson({ error: error instanceof Error ? error.message : "Invalid photo details." }, 400);
  }
  try {
    if (input.action === "prepare") return privateJson(await prepareUpload(input.contentType as string));
    const photo = await publishPhoto(input);
    refreshPhotos();
    return privateJson({ photo }, 201);
  } catch {
    console.error("R2 photo publishing failed. Check bucket permissions, the uploaded object, and connectivity.");
    return privateJson({ error: "Could not publish this photo. Check the R2 connection and try again." }, 502);
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "Invalid request origin." }, 403);
  if (!await isPhotoAdmin()) return privateJson({ error: "Sign in to manage photos." }, 401);
  try {
    const { id } = await readJson(request);
    if (typeof id !== "string") return privateJson({ error: "Invalid photo ID." }, 400);
    await deletePhoto(id);
    refreshPhotos();
    return privateJson({ ok: true });
  } catch {
    return privateJson({ error: "Could not remove this photo. Please try again." }, 502);
  }
}
