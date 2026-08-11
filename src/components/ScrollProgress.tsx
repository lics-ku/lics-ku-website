"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** A compositor-only page progress trace mounted inside the fixed header. */
export function ScrollProgress() {
  const pathname = usePathname();
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let frame = 0;
    let scrollRange = 1;

    const measure = () => {
      scrollRange = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
    };

    const paint = () => {
      frame = 0;
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollRange));
      bar.style.transform = `scaleX(${progress})`;
    };

    const requestPaint = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    const resizeObserver = new ResizeObserver(() => {
      measure();
      requestPaint();
    });

    measure();
    paint();
    resizeObserver.observe(document.documentElement);
    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestPaint);
      window.removeEventListener("resize", measure);
    };
  }, [pathname]);

  return (
    <span
      aria-hidden="true"
      data-scroll-progress
      className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden"
    >
      <span
        ref={barRef}
        className="block h-full origin-left scale-x-0 bg-crimson will-change-transform"
      />
    </span>
  );
}
