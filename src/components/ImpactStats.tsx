"use client";

import { useEffect, useRef } from "react";

export type ImpactMetric = {
  value: number;
  label: string;
};

export function ImpactStats({ metrics }: { metrics: ImpactMetric[] }) {
  const rootRef = useRef<HTMLDListElement>(null);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const finish = () => {
      metrics.forEach((metric, index) => {
        const node = valueRefs.current[index];
        if (node) node.textContent = String(metric.value);
      });
      root.setAttribute("data-counted", "true");
    };

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      finish();
      return;
    }

    let animationFrame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const startedAt = performance.now();
        const duration = 1050;

        const tick = (now: number) => {
          const linear = Math.min(1, (now - startedAt) / duration);
          const eased = 1 - Math.pow(1 - linear, 3);

          metrics.forEach((metric, index) => {
            const node = valueRefs.current[index];
            if (node) node.textContent = String(Math.round(metric.value * eased));
          });

          if (linear < 1) {
            animationFrame = window.requestAnimationFrame(tick);
          } else {
            finish();
          }
        };

        animationFrame = window.requestAnimationFrame(tick);
      },
      { threshold: 0.35 }
    );

    observer.observe(root);
    return () => {
      observer.disconnect();
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [metrics]);

  return (
    <dl
      ref={rootRef}
      className="grid grid-cols-3 border-y border-border"
      aria-label="Laboratory output at a glance"
    >
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className="flex min-w-0 flex-col gap-1 border-r border-border px-3 py-6 last:border-r-0 sm:px-6 sm:py-8"
        >
          <dd
            className="display text-[clamp(2rem,5vw,4rem)] tabular-nums text-foreground"
            aria-label={`${metric.value} ${metric.label}`}
          >
            <span
              ref={(node) => {
                valueRefs.current[index] = node;
              }}
              aria-hidden="true"
            >
              0
            </span>
          </dd>
          <dt className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
            {metric.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
