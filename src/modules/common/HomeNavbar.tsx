"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { Logo } from "@/modules/common/logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DEFAULT_NAVIGATION_ITEMS } from "@/constants/navigationContents";
import { cn } from "@/lib/utils";

const isActive = (pathname: string, url: string) =>
  url === "/" ? pathname === "/" : pathname.startsWith(url);

export const HomeNavbar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-16 transition-colors duration-300",
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/65"
          : "border-b border-transparent bg-background/0"
      )}
    >
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="LICS home" className="shrink-0">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 sm:flex">
          {DEFAULT_NAVIGATION_ITEMS.map((item) => {
            const active = isActive(pathname, item.url);
            return (
              <Link
                key={item.label}
                href={item.url}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-crimson transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </Link>
            );
          })}
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-4/5 max-w-xs gap-0 p-0"
            >
              <SheetHeader className="h-16 justify-center border-b border-border px-5">
                <SheetTitle className="text-left text-lg font-extrabold tracking-tight">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col px-5 py-4">
                {DEFAULT_NAVIGATION_ITEMS.map((item, i) => {
                  const active = isActive(pathname, item.url);
                  return (
                    <SheetClose asChild key={item.label}>
                      <Link
                        href={item.url}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-baseline gap-3 border-b border-border py-4 text-2xl font-semibold tracking-tight transition-colors",
                          active ? "text-crimson" : "text-foreground"
                        )}
                      >
                        <span className="font-mono text-xs text-muted-foreground">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {item.label}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};
