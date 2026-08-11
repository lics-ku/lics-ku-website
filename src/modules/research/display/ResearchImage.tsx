"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { getResearchGifPoster } from "@/modules/research/display/researchGifPosters";

/**
 * Research simulations include animated GIFs. A picture source swaps each GIF
 * for its preselected static poster before the browser fetches image pixels in
 * reduced-motion contexts. The canvas mirrors that static image while the
 * descriptive image remains in the accessibility tree behind it.
 */
export function ResearchImage({
  src,
  reducedSrc,
  alt,
  sizes,
  className,
  priority = false,
}: {
  src: string;
  reducedSrc?: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reduced, setReduced] = useState(false);
  const [posterReady, setPosterReady] = useState(false);
  const animated = src.toLowerCase().endsWith(".gif");
  const mappedPoster = animated ? getResearchGifPoster(src) : undefined;
  const posterSrc = mappedPoster?.src ?? reducedSrc;

  const drawPoster = useCallback(() => {
    if (!animated || !posterSrc) return;
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas || !image.complete || !image.naturalWidth) return;

    const expectedPosterUrl = new URL(posterSrc, window.location.href).href;
    if (image.currentSrc !== expectedPosterUrl) return;

    const maxDimension = 1400;
    const ratio = Math.min(
      1,
      maxDimension / Math.max(image.naturalWidth, image.naturalHeight)
    );
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    setPosterReady(true);
  }, [animated, posterSrc]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(query.matches);
      setPosterReady(false);
      if (query.matches) window.requestAnimationFrame(drawPoster);
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [drawPoster]);

  if (animated) {
    return (
      <>
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          data-reduced-poster
          data-poster-source={src}
          data-poster-ready={reduced && posterReady ? "" : undefined}
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full object-contain opacity-0",
            className,
            reduced && posterReady && "opacity-100"
          )}
        />
        <picture>
          {posterSrc && (
            <source
              media="(prefers-reduced-motion: reduce)"
              srcSet={posterSrc}
            />
          )}
          {/* The picture source guarantees that reduced-motion users never
              receive animated pixels, including before React hydrates. */}
          <Image
            ref={imageRef}
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            unoptimized
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            onLoad={() => {
              if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                drawPoster();
              }
            }}
            data-animated-research-source={posterSrc ? undefined : ""}
            className={className}
          />
        </picture>
      </>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
