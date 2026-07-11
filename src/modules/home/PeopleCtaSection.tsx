import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

import { CONTACT } from "@/constants/contact";
import { Reveal } from "@/components/Reveal";

export const PeopleCtaSection = () => {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Principal investigator */}
        <Reveal>
          <div className="flex h-full flex-col gap-6 rounded-2xl border border-border bg-card p-7 sm:flex-row sm:items-center">
            <Image
              src="/people/professor.jpg"
              alt={CONTACT.professor}
              width={140}
              height={180}
              className="h-44 w-36 shrink-0 rounded-xl object-cover"
            />
            <div className="flex flex-col gap-2">
              <p className="eyebrow">Principal investigator</p>
              <h3 className="text-2xl font-bold tracking-tight">
                Sang Hyun Lee
              </h3>
              <p className="text-sm text-muted-foreground">
                Associate Professor, {CONTACT.school}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Ph.D., University of Texas at Austin. Formerly at ETRI and
                Samsung Advanced Institute of Technology.
              </p>
              <Link
                href="/people"
                className="mt-3 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-foreground/70 transition-colors hover:text-crimson"
              >
                Meet the group
                <ArrowRight className="size-4 transition-transform" />
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Join CTA */}
        <Reveal delay={100}>
          <div className="flex h-full flex-col justify-between gap-8 rounded-2xl bg-primary p-8 text-primary-foreground">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-primary-foreground/70">
                Prospective students
              </p>
              <h3 className="display text-[clamp(1.8rem,3.5vw,2.6rem)]">
                Come build the next generation of connected systems.
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-primary-foreground/75">
                We welcome graduate and undergraduate students curious about
                wireless communications, networks, optimization, and machine
                learning. Reach out — we&apos;d love to hear from you.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-crimson-foreground transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-foreground/50"
              >
                Get in touch
                <ArrowRight className="size-4" />
              </Link>
              <a
                href={`mailto:${CONTACT.professorEmail}`}
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                <Mail className="size-4" />
                Email the PI
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
