import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HeroMedia } from "@/modules/home/_components/HeroMedia";

const HERO_FACTS = [
  "13 research directions",
  "IEEE · Nature · Sci. Reports",
  "Seoul, Korea",
];

export const MainHeroSection = () => {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Signature: generative signal field. Swap for footage via videoSrc. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <HeroMedia />
      </div>
      {/* Contrast scrims: readable text over the canvas in both themes. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/85 to-background/30" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-background/40" />

      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col justify-center px-5 py-24 sm:px-8">
        <p className="eyebrow mb-6">
          Korea University · School of Electrical Engineering
        </p>

        <h1 className="display max-w-4xl text-[clamp(2.75rem,8vw,6.5rem)] text-foreground">
          Informatics,
          <br />
          Communications
          <span className="text-crimson"> &amp;</span> Systems
        </h1>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
          We study how information moves — across wireless links, sensor
          networks, and distributed systems — and design the algorithms that let
          those systems cooperate, learn, and scale.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/research"
            className="group inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-crimson-foreground transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Explore research
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Join the lab
          </Link>
        </div>

        <dl className="mt-16 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-6">
          {HERO_FACTS.map((fact) => (
            <dd
              key={fact}
              className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground"
            >
              {fact}
            </dd>
          ))}
        </dl>
      </div>
    </section>
  );
};
