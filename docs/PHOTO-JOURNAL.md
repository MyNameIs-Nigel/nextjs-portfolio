# Photo journal setup

The public stream is at `/photos`. The owner-only uploader is at `/admin/photos`;
it is not linked from public navigation and is marked `noindex`. The blog stays
available at `/blog` and `/blog/[slug]`, with no navigation or sitemap promotion.

## 1. Create the R2 bucket

In Cloudflare, open **R2 Object Storage → Create bucket**, choose Standard storage,
and use a dedicated bucket such as `nigel-photo-journal`. Only public journal
images and their published descriptions belong in this bucket.

Under **Settings → Custom Domains**, attach a public subdomain such as
`photos.ndsironwood.com`. Its DNS zone must be active in Cloudflare. The main
website stays on Vercel; keep its existing Vercel DNS records. `r2.dev` is a
development endpoint, not the production delivery URL.

Create an R2 S3 API token with **Object Read & Write** permission scoped only to
this bucket. Save its access key and secret privately. Do not use a global
Cloudflare API key or put credentials in chat, Git, or `NEXT_PUBLIC_*` variables.

## 2. Configure Vercel

Add these variables to the intended Vercel project/environment:

| Variable | Value |
| --- | --- |
| `SITE_URL` | Your canonical website origin, e.g. `https://ndsironwood.com` |
| `R2_ACCOUNT_ID` | Cloudflare account ID from the R2 dashboard |
| `R2_BUCKET_NAME` | The dedicated bucket name |
| `R2_ACCESS_KEY_ID` | The bucket-scoped S3 access key |
| `R2_SECRET_ACCESS_KEY` | The bucket-scoped S3 secret |
| `R2_PUBLIC_URL` | The public custom domain, e.g. `https://photos.ndsironwood.com`, with no query or fragment |
| `PHOTO_ADMIN_PASSWORD` | A unique random password of at least 32 characters |

Generate the owner password locally with `openssl rand -hex 24` and save it in
your password manager and Vercel. Sessions last 12 hours, use HttpOnly cookies,
and are invalidated by changing this password and redeploying. Use a generated
password rather than a memorable phrase; the uploader has no account recovery
or multi-user access system. Production cookies require HTTPS.

Redeploy after changing environment variables. `R2_PUBLIC_URL` also configures
Next.js's exact image host/path allowlist at build time. For local development,
put the same variables in ignored `.env.local`. Keep preview environments on a
separate bucket if you do not want previews to publish to the real journal.

## 3. Allow direct browser uploads

Under the bucket's **Settings → CORS Policy**, use:

```json
[
  {
    "AllowedOrigins": ["https://ndsironwood.com", "https://www.ndsironwood.com", "http://localhost:3000"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type", "Cache-Control"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Remove any origins you do not use; add an exact Vercel preview origin only when
you intend to upload from that deployment. CORS permits the browser request;
the signed URL still authorizes the write. Never use `*` for uploader origins.

## 4. Publish photos

1. Visit `https://YOUR_SITE/admin/photos` and sign in.
2. Choose a JPEG, PNG, or WebP image under 40 MB. Export RAW/HEIC first.
3. Add a title, the date photographed, a descriptive alt text, and an optional caption.
4. Publish. The browser resizes to a maximum edge of 2560 pixels and creates a
   WebP copy at 88% quality, removing EXIF/GPS metadata. It never enlarges an image.
5. Open the journal. Entries sort by the date photographed, newest first.

Keep your full-resolution originals separately. Uploads go directly to R2 using
a five-minute signed URL, bypassing Vercel's function request-body limit. The
server verifies the uploaded object's size/type before publishing its record.
The form accepts one photo at a time. Published entries can be removed using the
confirmation control below the uploader; removal unpublishes the entry and deletes
the image. If image cleanup fails after unpublishing, the server logs that an
unlisted object needs manual cleanup in R2.
Caption editing and bulk uploading are not included.

Each publication has an independent `photos/entries/UUID.json` record and a
`photos/images/UUID.webp` image. This avoids competing uploads overwriting a
shared manifest. Images in the bucket alone are not published: use the uploader
to create their corresponding metadata. Failed uploads can leave an unlisted
image; those can be removed from R2 after verifying no entry references them.

The stream and sitemap share a five-minute cache, invalidated immediately by
successful publication/removal. External bucket edits appear after cache refresh
on the next request. If the bucket is unavailable, the journal displays a retry
message; the sitemap fails rather than publishing an empty replacement.

## SEO and verification

`prebuild` and `predev` discover static public pages from the actual App Router
tree. `/sitemap.xml` combines those with current R2 photo records and journal
pagination, including image URLs and real modification timestamps. Blog,
admin, API, and private routes are excluded from this discovery. Dynamic routes
added in the future need their own content provider in `sitemap.ts`.

The blog remains indexable. The admin page is `noindex` and may be crawled so
search engines can see that instruction. `/robots.txt` links the sitemap and
excludes API/health endpoints. Public pages use canonical URLs, social previews,
and structured data; each photo has its own shareable URL.

After deployment:

- Verify that `SITE_URL` matches Vercel's preferred domain, and redirect alternate
  domains to it in Vercel Domains settings.
- Publish a test photo, check its detail page, then remove it from the admin page.
- Confirm `/sitemap.xml` contains public pages/photos and no `/blog` or `/admin` URLs.
- Submit the sitemap in Google Search Console. If the photo subdomain is outside
  an existing Domain property, verify that host too.
- Review real mobile performance after photos are present. Image optimization
  and delivery usage remain subject to your Vercel and R2 plans.

Run `npm test`, `npx tsc --noEmit`, and `npm run build` locally.
`npm run test:integration` starts an in-memory S3 fixture and a development server
on port 4310, tests the full publishing/auth/sitemap lifecycle and storage outage
recovery, then stops both. It never uses real bucket credentials. Override the
port with `PHOTO_TEST_PORT` if needed. Live bucket access,
DNS, and browser CORS require the actual Cloudflare/Vercel configuration.

Next.js and its ESLint configuration were updated from 16.2.9 to 16.4.0 to
resolve the framework/image-processing advisories found during implementation.
Compatible transitive security updates were also applied. The remaining npm
audit findings are the `sprintf-js` chain used by the existing MDX frontmatter
parser and the `braces` chain used by lint tooling (nine affected package entries,
representing two advisory chains). npm's proposed forced fixes downgrade the
blog parser or ESLint configuration and were not applied. Blog content remains
repository-controlled; this uploader does not accept MDX or YAML.

References: [R2 public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/),
[R2 S3 SDK and signed URLs](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/),
[R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/),
[Next.js generated sitemaps](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap).
