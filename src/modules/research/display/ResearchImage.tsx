"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Research simulations include animated GIFs. In reduced-motion contexts we
 * draw one decoded frame to a canvas and keep the descriptive image in the
 * accessibility tree behind that frozen poster.
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
  const freezeRequired = animated && !reducedSrc;
  const activeSrc = reduced && animated && reducedSrc ? reducedSrc : src;

  const freezeFrame = useCallback(() => {
    if (!freezeRequired) return;
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas || !image.complete || !image.naturalWidth) return;

    const maxDimension = 1400;
    const ratio = Math.min(
      1,
      maxDimension / Math.max(image.naturalWidth, image.naturalHeight)
    );
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    setPosterReady(true);
  }, [freezeRequired]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(query.matches);
      if (query.matches) window.requestAnimationFrame(freezeFrame);
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [freezeFrame]);

  return (
    <>
      {freezeRequired && (
        <canvas
          ref={canvasRef}
          role={reduced && posterReady ? "img" : undefined}
          aria-label={reduced && posterReady ? alt : undefined}
          aria-hidden={reduced && posterReady ? undefined : "true"}
          data-reduced-poster
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full object-contain opacity-0",
            reduced && posterReady && "opacity-100"
          )}
        />
      )}
      {(!freezeRequired || !reduced || !posterReady) && (
        <Image
          ref={imageRef}
          src={activeSrc}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onLoad={() => {
            if (reduced && freezeRequired) freezeFrame();
          }}
          className={className}
        />
      )}
    </>
  );
}
