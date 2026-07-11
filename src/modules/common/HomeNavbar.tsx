"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { Logo } from "@/modules/common/logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { DEFAULT_NAVIGATION_ITEMS } from "@/constants/navigationContents";
import { cn } from "@/lib/utils";

const isActive = (pathname: string, url: string) =>
  url === "/" ? pathname === "/" : pathname.startsWith(url);

export const HomeNavbar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock scroll while the mobile overlay is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
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
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {menuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </nav>
      </header>

      {/* Mobile overlay menu — full-screen, opaque, above the header */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-background sm:hidden">
          <div className="flex h-16 shrink-0 items-center justify-between px-5">
            <Logo />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="flex flex-col gap-1 px-5 py-4">
            {DEFAULT_NAVIGATION_ITEMS.map((item, i) => {
              const active = isActive(pathname, item.url);
              return (
                <Link
                  key={item.label}
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
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
