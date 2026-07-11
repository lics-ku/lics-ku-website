import type { Metadata } from "next";

import { RESEARCH_LIST } from "@data/research/ResearchList";
import { ResearchPageContents } from "@/modules/research/details/ResearchPageContents";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const research = RESEARCH_LIST.find((item) => item.id === Number(id));
  if (!research) return { title: "Research" };
  const description = research.description
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 155);
  return {
    title: research.title,
    description,
    openGraph: { title: research.title, description },
  };
}

export function generateStaticParams() {
  return RESEARCH_LIST.map((r) => ({ id: String(r.id) }));
}

const ResearchContentPage = () => {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <ResearchPageContents />
    </div>
  );
};

export default ResearchContentPage;
