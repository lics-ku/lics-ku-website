import Image from "next/image";
import { Mail, MapPin, Phone, Printer } from "lucide-react";

import {
  PROFESSOR_EDUCATION,
  PROFESSOR_EXPERIENCES,
} from "@data/people/professor";
import { CONTACT } from "@/constants/contact";

type TimelineItem = { title: string; date: string; institution: string };

const Timeline = ({ items }: { items: TimelineItem[] }) => (
  <ol className="flex flex-col">
    {items.map((item) => (
      <li
        key={item.title}
        className="grid grid-cols-1 gap-1 border-l border-border py-4 pl-6 sm:grid-cols-[130px_1fr] sm:gap-6"
      >
        <span className="font-mono text-xs tracking-wide text-crimson">
          {item.date}
        </span>
        <span className="text-sm leading-relaxed text-foreground/85">
          {item.title}
        </span>
      </li>
    ))}
  </ol>
);

const PeoplePage = () => {
  return (
    <div className="flex flex-col gap-16">
      {/* Profile */}
      <section className="grid grid-cols-1 gap-10 md:grid-cols-[260px_1fr]">
        <div className="mx-auto w-full max-w-[260px] md:mx-0">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-muted">
            <Image
              src="/people/professor.jpg"
              alt="Prof. Sang Hyun Lee"
              fill
              sizes="260px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="eyebrow">Principal investigator</p>
            <h2 className="display text-4xl text-foreground">Sang Hyun Lee</h2>
            <p className="text-lg text-muted-foreground">
              Associate Professor · {CONTACT.school}
            </p>
          </div>

          <p className="max-w-2xl text-base leading-relaxed text-foreground/80">
            Prof. Lee leads LICS, working across communications, learning,
            networking, optimization, control, signal processing, and system
            theory — with applications spanning information systems, materials,
            biomedical engineering, physics, social science, and energy.
          </p>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-crimson" />
              {CONTACT.office}
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Phone className="size-4 shrink-0 text-crimson" />
              {CONTACT.tel}
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Mail className="size-4 shrink-0 text-crimson" />
              <a
                href={`mailto:${CONTACT.professorEmail}`}
                className="link-crimson"
              >
                {CONTACT.professorEmail}
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Printer className="size-4 shrink-0 text-crimson" />
              {CONTACT.fax}
            </div>
          </dl>
        </div>
      </section>

      {/* Experience & Education */}
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-bold tracking-tight">Experience</h3>
          <Timeline items={PROFESSOR_EXPERIENCES} />
        </div>
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-bold tracking-tight">Education</h3>
          <Timeline
            items={PROFESSOR_EDUCATION.map((e) => ({
              title: `${e.title}, ${e.institution}`,
              date: e.date,
              institution: e.institution,
            }))}
          />
        </div>
      </section>
    </div>
  );
};

export default PeoplePage;
