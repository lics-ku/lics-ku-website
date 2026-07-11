import { RESEARCH_LIST } from "@data/research/ResearchList";

import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { ResearchAreaCard } from "@/modules/research/display/ResearchAreaCard";

const HIGHLIGHT_COUNT = 6;

export const TopResearchSection = () => {
  const highlights = RESEARCH_LIST.slice(0, HIGHLIGHT_COUNT);

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionHeading
        eyebrow="What we work on"
        title="Research directions"
        description="From vehicular networks and wireless supercomputing to distributed optimization and quantum algorithms — spanning communications, learning, and systems."
        link={{ href: "/research", label: "All 13 areas" }}
      />

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((research, i) => (
          <Reveal key={research.id} delay={(i % 3) * 80}>
            <ResearchAreaCard research={research} />
          </Reveal>
        ))}
      </div>
    </section>
  );
};
