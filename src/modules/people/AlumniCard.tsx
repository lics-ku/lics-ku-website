import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { type Alumni } from "@data/index";

export const AlumniCard = ({ alumni }: { alumni: Alumni }) => {
  const image = alumni.image ?? "/people/default_profile.png";
  const hasWebsite = Boolean(alumni.website);

  const inner = (
    <>
      <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-muted">
        <Image
          src={image}
          alt={alumni.name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-0.5">
        <span className="flex items-center gap-1 font-semibold tracking-tight text-foreground">
          {alumni.name}
          {hasWebsite && (
            <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-crimson" />
          )}
        </span>
        {alumni.field && (
          <span className="text-sm text-muted-foreground">{alumni.field}</span>
        )}
      </div>
    </>
  );

  const className =
    "group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors";

  if (hasWebsite) {
    return (
      <a
        href={alumni.website}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} hover:border-crimson/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
      >
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
};
