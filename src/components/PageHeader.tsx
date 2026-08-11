import { type ReactNode } from "react";

import { MotionWords } from "@/components/MotionWords";
import { Reveal } from "@/components/Reveal";

/**
 * Interior-page header band: mono eyebrow + display title + lead paragraph.
 * Keeps every top-level page on the same typographic rhythm as the home hero.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <header data-page-header className="overflow-hidden border-b border-border">
      <div
        data-page-header-inner
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20"
      >
        <Reveal variant="fade">
          <p className="eyebrow mb-5">{eyebrow}</p>
        </Reveal>
        <Reveal variant="words" delay={50}>
          <h1
            aria-label={title}
            className="display max-w-3xl text-[clamp(2.4rem,6vw,4.5rem)] text-foreground"
          >
            <MotionWords text={title} />
          </h1>
        </Reveal>
        {lead && (
          <Reveal delay={140}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {lead}
            </p>
          </Reveal>
        )}
        {children && (
          <Reveal delay={200}>
            <div>{children}</div>
          </Reveal>
        )}
      </div>
    </header>
  );
}
