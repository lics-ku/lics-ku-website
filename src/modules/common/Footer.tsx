import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { CONTACT } from "@/constants/contact";

const QUICK_LINKS = [
  { label: "Research", href: "/research" },
  { label: "Publications", href: "/publications" },
  { label: "People", href: "/people" },
  { label: "Contact", href: "/contact" },
];

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Identity */}
          <div className="flex flex-col gap-4">
            <span className="text-2xl font-extrabold tracking-tight">
              LICS<span className="text-crimson">.</span>
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {CONTACT.labName}. {CONTACT.school}. Led by {CONTACT.professor}.
            </p>
            <address className="mt-2 text-sm not-italic leading-relaxed text-muted-foreground">
              {CONTACT.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Contact</p>
            <dl className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <dt className="w-10 shrink-0 font-mono text-xs text-muted-foreground">
                  Tel
                </dt>
                <dd>{CONTACT.tel}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-10 shrink-0 font-mono text-xs text-muted-foreground">
                  Mail
                </dt>
                <dd>
                  <a
                    href={`mailto:${CONTACT.professorEmail}`}
                    className="link-crimson"
                  >
                    {CONTACT.professorEmail}
                  </a>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-10 shrink-0 font-mono text-xs text-muted-foreground">
                  Lab
                </dt>
                <dd>
                  <a href={`mailto:${CONTACT.labEmail}`} className="link-crimson">
                    {CONTACT.labEmail}
                  </a>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-10 shrink-0 font-mono text-xs text-muted-foreground">
                  Room
                </dt>
                <dd>{CONTACT.office}</dd>
              </div>
            </dl>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Navigate</p>
            <nav className="flex flex-col gap-1.5">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LICS, Korea University. All rights
            reserved.
          </p>
          <p className="font-mono text-[0.68rem] tracking-[0.15em] text-muted-foreground">
            INFORMATICS · COMMUNICATIONS · SYSTEMS
          </p>
        </div>
      </div>
    </footer>
  );
};
