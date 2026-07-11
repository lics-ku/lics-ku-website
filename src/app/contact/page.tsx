import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone, Printer } from "lucide-react";

import { CONTACT } from "@/constants/contact";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with LICS at Korea University — address, phone, email, and information for prospective graduate students.",
};

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  CONTACT.mapQuery
)}`;

const ContactPage = () => {
  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="Contact · 오시는 길"
        title="Come say hello."
        lead="Questions about our research, collaborations, or joining the lab? Here's how to reach us."
      />

      <div className="mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-6 px-5 sm:px-8 lg:grid-cols-2">
        {/* Details */}
        <Reveal>
          <div className="flex h-full flex-col gap-8 rounded-2xl border border-border bg-card p-8">
            <div className="flex flex-col gap-1">
              <p className="eyebrow">Laboratory</p>
              <h2 className="text-2xl font-bold tracking-tight">
                LICS @ Korea University
              </h2>
              <p className="text-sm text-muted-foreground">{CONTACT.school}</p>
            </div>

            <dl className="flex flex-col gap-5 text-sm">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-crimson" />
                <div>
                  <dt className="mb-1 font-medium text-foreground">Address</dt>
                  <dd className="leading-relaxed text-muted-foreground">
                    {CONTACT.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                    <span className="mt-1 block text-foreground">
                      Office · {CONTACT.professorOffice}
                    </span>
                    <span className="block text-foreground">
                      Lab · {CONTACT.labRoom}
                    </span>
                  </dd>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-crimson" />
                <div>
                  <dt className="mb-1 font-medium text-foreground">Phone</dt>
                  <dd className="text-muted-foreground">{CONTACT.tel}</dd>
                </div>
              </div>

              <div className="flex gap-3">
                <Printer className="mt-0.5 size-5 shrink-0 text-crimson" />
                <div>
                  <dt className="mb-1 font-medium text-foreground">Fax</dt>
                  <dd className="text-muted-foreground">{CONTACT.fax}</dd>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-crimson" />
                <div>
                  <dt className="mb-1 font-medium text-foreground">Email</dt>
                  <dd className="flex flex-col gap-0.5 text-muted-foreground">
                    <a
                      href={`mailto:${CONTACT.professorEmail}`}
                      className="link-crimson w-fit"
                    >
                      {CONTACT.professorEmail}
                    </a>
                  </dd>
                </div>
              </div>
            </dl>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-crimson"
            >
              View on Google Maps
              <ArrowRight className="size-4" />
            </a>
          </div>
        </Reveal>

        {/* Prospective students */}
        <Reveal delay={100}>
          <div className="flex h-full flex-col justify-between gap-8 rounded-2xl bg-primary p-8 text-primary-foreground">
            <div className="flex flex-col gap-4">
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-primary-foreground/70">
                Prospective students · 대학원생 지원 안내
              </p>
              <h2 className="display text-[clamp(1.7rem,3.2vw,2.4rem)]">
                Interested in joining LICS?
              </h2>
              <div className="flex flex-col gap-3 text-sm leading-relaxed text-primary-foreground/80">
                <p>
                  We welcome graduate and undergraduate students with a strong
                  interest in wireless communications, networks, optimization,
                  signal processing, and machine learning. A solid background in
                  probability, linear algebra, and programming helps, but
                  curiosity matters most.
                </p>
                <p>
                  Prospective applicants: email {CONTACT.professor} with a short
                  note about your interests, along with your CV and transcript.
                  We&apos;re happy to talk through directions before you apply.
                </p>
              </div>
            </div>
            <a
              href={`mailto:${CONTACT.professorEmail}?subject=Prospective%20student%20inquiry`}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-crimson-foreground transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-foreground/50"
            >
              <Mail className="size-4" />
              Email the PI
            </a>
          </div>
        </Reveal>
      </div>

      <div className="mx-auto mt-6 max-w-7xl px-5 sm:px-8">
        <Reveal>
          <Link
            href="/people"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-crimson/40"
          >
            <span className="text-sm text-muted-foreground">
              Want to know who you&apos;d be working with?
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors group-hover:text-crimson">
              Meet the group
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </Reveal>
      </div>
    </div>
  );
};

export default ContactPage;
