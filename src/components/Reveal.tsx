"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Scroll-reveal wrapper. Toggles [data-visible] via IntersectionObserver so the
 * CSS in globals.css can fade/translate content in. Reduced-motion users get the
 * content immediately (no transform), enforced both here and in CSS.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      el.setAttribute("data-visible", "true");
      return;
    }

    const reveal = () => el.setAttribute("data-visible", "true");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px 10% 0px" }
    );
    io.observe(el);

    // Safety net: never leave content stuck hidden if the observer never fires
    // (odd scroll timing, virtualized capture, background tab, etc.).
    const fallback = window.setTimeout(reveal, 1600);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-reveal
      className={className}
      style={{ ["--reveal-delay" as string]: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}
