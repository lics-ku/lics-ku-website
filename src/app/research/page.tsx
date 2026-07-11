import type { Metadata } from "next";

import { RESEARCH_LIST } from "@data/research/ResearchList";
import { Reveal } from "@/components/Reveal";
import { PageHeader } from "@/components/PageHeader";
import { ResearchAreaCard } from "@/modules/research/display/ResearchAreaCard";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Thirteen research directions at LICS — spanning wireless communications, networks, distributed optimization, machine learning, and signal processing.",
};

const ResearchPage = () => {
  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="Research · 연구"
        title="Thirteen directions, one thread: information in motion."
        lead="Our work runs from vehicular networks and wireless supercomputing to holographic communication and quantum algorithms — unified by distributed cooperation, learning, and rigorous systems thinking."
      />

      <div className="mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-6 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
        {RESEARCH_LIST.map((research, i) => (
          <Reveal key={research.id} delay={(i % 3) * 70}>
            <ResearchAreaCard research={research} />
          </Reveal>
        ))}
      </div>
    </div>
  );
};

export default ResearchPage;
