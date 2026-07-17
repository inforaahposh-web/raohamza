export type ImageOptimizeOpts = {
  width: number;
  height?: number;
  quality?: number;
  /** cover | contain | fill — Supabase transform resize mode */
  resize?: "cover" | "contain" | "fill";
};

/**
 * Resize/compress Supabase Storage images via the render endpoint.
 * Falls back to the original URL if the URL is not a public storage object.
 * OptimizedImage should fall back again on load error (free plans without transforms).
 */
export function optimizeImageUrl(url: string | null | undefined, opts: ImageOptimizeOpts): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (!match) return url;
    const [, bucket, path] = match;
    const params = new URLSearchParams({
      width: String(Math.round(opts.width)),
      quality: String(opts.quality ?? 72),
      resize: opts.resize ?? "cover",
    });
    if (opts.height) params.set("height", String(Math.round(opts.height)));
    return `${u.origin}/storage/v1/render/image/public/${bucket}/${path}?${params.toString()}`;
  } catch {
    return url;
  }
}

/** Build a srcSet of resized widths for responsive images. */
export function optimizeImageSrcSet(
  url: string | null | undefined,
  widths: number[],
  opts?: Omit<ImageOptimizeOpts, "width">,
): string {
  if (!url) return "";
  return widths
    .map((w) => `${optimizeImageUrl(url, { ...opts, width: w })} ${w}w`)
    .join(", ");
}
