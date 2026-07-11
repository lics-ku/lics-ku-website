import { type ReactNode } from "react";

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
    <header className="border-b border-border">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="eyebrow mb-5">{eyebrow}</p>
        <h1 className="display max-w-3xl text-[clamp(2.4rem,6vw,4.5rem)] text-foreground">
          {title}
        </h1>
        {lead && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {lead}
          </p>
        )}
        {children}
      </div>
    </header>
  );
}
