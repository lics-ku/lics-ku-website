import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Research } from "@data/index";

/**
 * Research thrust card — used on the home highlights grid and the research
 * index. Links to /research/[id], which is intercepted as a modal from within
 * the app and rendered as a full page on hard load.
 */
export const ResearchAreaCard = ({
  research,
  scroll = false,
}: {
  research: Research;
  scroll?: boolean;
}) => {
  const thumbnail =
    research.resources?.find((r) => r.isThumbnail)?.url ??
    research.resources?.[0]?.url;

  return (
    <Link
      href={`/research/${research.id}`}
      scroll={scroll}
      prefetch={false}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-crimson/40 hover:shadow-[0_8px_30px_-12px] hover:shadow-crimson/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={research.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
            LICS
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        {research.subtitle ? (
          <span className="line-clamp-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-crimson">
            {research.subtitle}
          </span>
        ) : (
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">
            Research area
          </span>
        )}
        <h3 className="text-lg font-bold leading-snug tracking-tight text-foreground">
          {research.title}
        </h3>
        <p className="line-clamp-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {research.description}
        </p>
        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium text-foreground/70 transition-colors group-hover:text-crimson">
          Read more
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
};
