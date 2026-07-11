import type { Metadata } from "next";

import { PageHeader } from "@/components/PageHeader";
import { getPublicationsData } from "@/lib/publications";
import { PublicationsExplorer } from "@/modules/publications/PublicationsExplorer";

export const metadata: Metadata = {
  title: "Publications",
  description:
    "Journal articles, conference papers, book chapters, and patents from LICS at Korea University — searchable and grouped by year.",
};

const PublicationsPage = async () => {
  const data = await getPublicationsData();
  const total = data.papers.length + data.patents.length;

  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="Publications · 논문"
        title="A record of the work."
        lead={`${total} journal articles, conference papers, book chapters, and patents — from LDPC codes and message-passing to deep learning for wireless systems.`}
      />
      <PublicationsExplorer data={data} />
    </div>
  );
};

export default PublicationsPage;
