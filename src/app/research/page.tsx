import type { Metadata } from "next";

import { RESEARCH_LIST } from "@data/research/ResearchList";
import { PageHeader } from "@/components/PageHeader";
import { ResearchStory } from "@/modules/research/display/ResearchStory";

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

      <div className="mx-auto mt-10 max-w-7xl px-5 sm:px-8">
        <ResearchStory researches={RESEARCH_LIST} />
      </div>
    </div>
  );
};

export default ResearchPage;
