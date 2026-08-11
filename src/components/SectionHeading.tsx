import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MotionWords } from "@/components/MotionWords";
import { Reveal } from "@/components/Reveal";

/**
 * Section header used across pages: mono eyebrow + display title + optional
 * "see all" link, separated from content by a hairline rule.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  link,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <Reveal variant="fade">
            <p className="eyebrow">{eyebrow}</p>
          </Reveal>
          <Reveal variant="words" delay={40}>
            <h2
              aria-label={title}
              className="display text-[clamp(1.9rem,4vw,3rem)] text-foreground"
            >
              <MotionWords text={title} />
            </h2>
          </Reveal>
        </div>
        {link && (
          <Link
            href={link.href}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-crimson"
          >
            {link.label}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      {description && (
        <Reveal delay={100}>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        </Reveal>
      )}
      <div className="rule rule-trace mt-1" />
    </div>
  );
}
