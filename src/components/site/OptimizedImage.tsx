import { useState, type ImgHTMLAttributes } from "react";
import { optimizeImageUrl, optimizeImageSrcSet } from "@/lib/media";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "loading"> & {
  src: string;
  /** Display width used for CDN resize (device pixels roughly). */
  widthHint: number;
  heights?: number;
  quality?: number;
  /** Eager = above-the-fold hero; lazy = everything else. */
  priority?: boolean;
  sizes?: string;
  /** Extra widths for srcSet (defaults derived from widthHint). */
  srcSetWidths?: number[];
};

export function OptimizedImage({
  src,
  widthHint,
  heights,
  quality = 72,
  priority = false,
  sizes,
  srcSetWidths,
  alt = "",
  className,
  style,
  onError,
  ...rest
}: Props) {
  const [failedOptimized, setFailedOptimized] = useState(false);
  const widths = srcSetWidths ?? uniqueWidths([Math.round(widthHint * 0.6), widthHint, Math.round(widthHint * 1.5)]);

  const optimized = failedOptimized
    ? src
    : optimizeImageUrl(src, { width: widthHint, height: heights, quality, resize: "cover" });
  const srcSet = failedOptimized ? undefined : optimizeImageSrcSet(src, widths, { quality, resize: "cover" });

  return (
    <img
      src={optimized}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      style={style}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "low"}
      onError={(e) => {
        if (!failedOptimized && optimized !== src) {
          setFailedOptimized(true);
          return;
        }
        onError?.(e);
      }}
      {...rest}
    />
  );
}

function uniqueWidths(list: number[]) {
  return [...new Set(list.map((n) => Math.max(80, Math.round(n))))].sort((a, b) => a - b);
}
