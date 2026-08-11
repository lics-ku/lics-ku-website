"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export type RevealVariant = "rise" | "fade" | "scale" | "words";

/**
 * Scroll-reveal wrapper. Toggles [data-visible] via IntersectionObserver so the
 * CSS in globals.css can fade/translate content in. Reduced-motion users get the
 * content immediately (no transform), enforced both here and in CSS.
 */
export function Reveal({
  children,
  delay = 0,
  variant = "rise",
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  variant?: RevealVariant;
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

    if (!("IntersectionObserver" in window)) {
      reveal();
      return;
    }

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

    return () => {
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={variant}
      className={className}
      style={{ ["--reveal-delay" as string]: `${delay}ms`, ...style }}
      onFocusCapture={() => ref.current?.setAttribute("data-visible", "true")}
    >
      {children}
    </div>
  );
}
