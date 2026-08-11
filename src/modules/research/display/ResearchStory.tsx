"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { type Research } from "@data/index";
import { cn } from "@/lib/utils";
import { ResearchImage } from "@/modules/research/display/ResearchImage";

const getThumbnail = (research: Research) =>
  research.resources?.find((resource) => resource.isThumbnail) ??
  research.resources?.[0];

export function ResearchStory({ researches }: { researches: Research[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const active = researches[activeIndex] ?? researches[0];

  useEffect(() => {
    const ratios = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => ratios.set(entry.target, entry.intersectionRatio));

        let nextIndex = 0;
        let bestRatio = -1;
        stepRefs.current.forEach((step, index) => {
          if (!step) return;
          const ratio = ratios.get(step) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            nextIndex = index;
          }
        });
        setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
      },
      {
        rootMargin: "-24% 0px -34% 0px",
        threshold: [0, 0.15, 0.35, 0.6, 0.85],
      }
    );

    stepRefs.current.forEach((step) => {
      if (step) observer.observe(step);
    });
    return () => observer.disconnect();
  }, [researches]);

  if (!active) return null;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(250px,0.68fr)_minmax(0,1.32fr)] lg:gap-14">
      <aside className="hidden lg:block">
        <div className="sticky top-24 flex min-h-[calc(100svh-7rem)] flex-col justify-between py-8">
          <div key={active.id} data-research-active-copy>
            <p className="eyebrow mb-5">
              Direction {String(activeIndex + 1).padStart(2, "0")} ·{" "}
              {String(researches.length).padStart(2, "0")}
            </p>
            <h2 className="display text-[clamp(2rem,3.4vw,3.4rem)] text-foreground">
              {active.title}
            </h2>
            {active.subtitle && (
              <p className="mt-5 font-mono text-xs leading-relaxed text-crimson">
                {active.subtitle}
              </p>
            )}
            <p className="mt-5 line-clamp-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {active.description}
            </p>
            <Link
              href={`/research/${active.id}`}
              scroll={false}
              prefetch={false}
              className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-crimson focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Open research area
              <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <nav
            aria-label="Research directions"
            className="mt-8 grid grid-cols-7 gap-2"
          >
            {researches.map((research, index) => (
              <a
                key={research.id}
                href={`#research-${research.id}`}
                aria-label={`${index + 1}. ${research.title}`}
                aria-current={activeIndex === index ? "location" : undefined}
                className="group flex h-7 items-end focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={cn(
                    "block h-1 w-full origin-left rounded-full bg-border transition-[height,background-color] duration-300 group-hover:bg-crimson/60",
                    activeIndex === index && "h-2 bg-crimson"
                  )}
                />
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex flex-col gap-8 lg:gap-0">
        {researches.map((research, index) => {
          const thumbnail = getThumbnail(research);
          const staticThumbnail = research.resources?.find(
            (resource) => !resource.url.toLowerCase().endsWith(".gif")
          );
          const selected = activeIndex === index;

          return (
            <section
              key={research.id}
              id={`research-${research.id}`}
              ref={(node) => {
                stepRefs.current[index] = node;
              }}
              onFocusCapture={() => setActiveIndex(index)}
              data-research-step
              data-active={selected ? "true" : "false"}
              className="flex scroll-mt-24 items-center lg:min-h-[82svh] lg:py-10"
            >
              <Link
                href={`/research/${research.id}`}
                scroll={false}
                prefetch={false}
                className={cn(
                  "group block w-full overflow-hidden rounded-2xl border border-border bg-card transition-[opacity,transform,border-color,box-shadow] duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "lg:scale-100 lg:border-crimson/30 lg:opacity-100 lg:shadow-[0_24px_70px_-40px] lg:shadow-crimson/35"
                    : "lg:scale-[0.985] lg:opacity-55"
                )}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted/60">
                  {thumbnail ? (
                    <ResearchImage
                      src={thumbnail.url}
                      reducedSrc={staticThumbnail?.url}
                      alt={thumbnail.description || research.title}
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      priority={index === 0}
                      className="object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-[1.018] sm:p-7"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
                      LICS
                    </div>
                  )}
                  <span className="absolute left-4 top-4 rounded-full border border-border/70 bg-background/80 px-3 py-1 font-mono text-[0.68rem] tracking-[0.12em] text-foreground backdrop-blur sm:left-6 sm:top-6">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="flex flex-col gap-2 border-t border-border p-5 lg:hidden">
                  {research.subtitle && (
                    <p className="line-clamp-1 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-crimson">
                      {research.subtitle}
                    </p>
                  )}
                  <h2 className="text-xl font-bold leading-snug tracking-tight text-foreground">
                    {research.title}
                  </h2>
                  <p className="line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {research.description}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                    Read more <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </Link>
            </section>
          );
        })}
      </div>
    </div>
  );
}
