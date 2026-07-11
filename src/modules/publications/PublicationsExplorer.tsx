"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";

import type { Paper, PublicationsData } from "@data/publications/schema";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Kind = "journal" | "conference" | "book-chapter" | "patent";

type Entry = {
  id: string;
  kind: Kind;
  title: string;
  people: string[];
  meta: string | null;
  year: number | null;
  doi: string | null;
  url: string | null;
  haystack: string;
};

const KIND_LABEL: Record<Kind, string> = {
  journal: "Journal",
  conference: "Conference",
  "book-chapter": "Book chapter",
  patent: "Patent",
};

const FILTERS: { value: "all" | Kind; label: string }[] = [
  { value: "all", label: "All" },
  { value: "journal", label: "Journals" },
  { value: "conference", label: "Conferences" },
  { value: "book-chapter", label: "Book chapters" },
  { value: "patent", label: "Patents" },
];

const paperToEntry = (p: Paper): Entry => ({
  id: p.id,
  kind: p.type as Kind,
  title: p.title,
  people: p.authors,
  meta: p.venue,
  year: p.year,
  doi: p.doi,
  url: p.url,
  haystack: `${p.title} ${p.authors.join(" ")} ${p.venue ?? ""} ${
    p.raw ?? ""
  }`.toLowerCase(),
});

export function PublicationsExplorer({ data }: { data: PublicationsData }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Kind>("all");

  const entries = useMemo<Entry[]>(() => {
    const papers = data.papers.map(paperToEntry);
    const patents: Entry[] = data.patents.map((pt) => ({
      id: pt.id,
      kind: "patent",
      title: pt.title,
      people: pt.inventors,
      meta: pt.number,
      year: pt.year,
      doi: null,
      url: null,
      haystack: `${pt.title} ${pt.number ?? ""} ${pt.raw ?? ""}`.toLowerCase(),
    }));
    return [...papers, ...patents];
  }, [data]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: entries.length };
    for (const e of entries) c[e.kind] = (c[e.kind] ?? 0) + 1;
    return c;
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (filter !== "all" && e.kind !== filter) return false;
      if (q && !e.haystack.includes(q)) return false;
      return true;
    });
  }, [entries, filter, query]);

  const groups = useMemo(() => {
    const map = new Map<number | "undated", Entry[]>();
    for (const e of filtered) {
      const key = e.year ?? "undated";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return [...map.entries()].sort((a, b) => {
      if (a[0] === "undated") return 1;
      if (b[0] === "undated") return -1;
      return (b[0] as number) - (a[0] as number);
    });
  }, [filtered]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
      {/* Controls */}
      <div className="sticky top-16 z-30 -mx-5 mb-10 border-b border-border bg-background/85 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, author, or venue…"
              aria-label="Search publications"
              className="h-11 pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-crimson bg-crimson text-crimson-foreground"
                      : "border-border text-muted-foreground hover:border-crimson/40 hover:text-foreground"
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      "font-mono text-xs",
                      active ? "text-crimson-foreground" : "text-muted-foreground"
                    )}
                  >
                    {counts[f.value] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No publications match “{query}”. Try a different search.
        </p>
      ) : (
        <div className="flex flex-col gap-14">
          {groups.map(([year, items]) => (
            <section key={String(year)} className="flex flex-col gap-2">
              <div className="mb-3 flex items-baseline gap-3 border-b border-border pb-2">
                <h2 className="display text-3xl text-foreground">
                  {year === "undated" ? "Undated" : year}
                </h2>
                <span className="font-mono text-xs text-muted-foreground">
                  {String(items.length).padStart(2, "0")}
                </span>
              </div>
              <ol className="flex flex-col">
                {items.map((e) => (
                  <li
                    key={e.id}
                    className="grid grid-cols-1 gap-1.5 border-b border-border py-5 sm:grid-cols-[120px_1fr] sm:gap-6"
                  >
                    <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-crimson">
                      {KIND_LABEL[e.kind]}
                    </span>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold leading-snug text-foreground">
                        {e.title}
                      </h3>
                      {e.people.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {e.people.join(", ")}
                        </p>
                      )}
                      {e.meta && (
                        <p className="text-sm italic text-muted-foreground">
                          {e.meta}
                        </p>
                      )}
                      {(e.doi || e.url) && (
                        <div className="mt-1 flex flex-wrap gap-3">
                          {e.doi && (
                            <a
                              href={`https://doi.org/${e.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-crimson hover:underline"
                            >
                              DOI <ExternalLink className="size-3" />
                            </a>
                          )}
                          {e.url && (
                            <a
                              href={e.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-crimson hover:underline"
                            >
                              Link <ExternalLink className="size-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
