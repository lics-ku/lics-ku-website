"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { label: "Professor", href: "/people", match: (p: string) => p === "/people" },
  {
    label: "Students",
    href: "/people/students",
    match: (p: string) => p.startsWith("/people/students"),
  },
  {
    label: "Alumni",
    href: "/people/alumnis",
    match: (p: string) => p.startsWith("/people/alumnis"),
  },
];

export const PeopleNavigation = () => {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-border">
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative px-4 py-3 text-sm font-medium transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-crimson transition-transform duration-300",
                active ? "scale-x-100" : "scale-x-0"
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
};
