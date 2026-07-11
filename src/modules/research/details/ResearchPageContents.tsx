"use client";

import { RESEARCH_LIST } from "@data/research/ResearchList";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ResearchContents } from "./contents/ResearchContents";

export const ResearchPageContents = () => {
  const { id } = useParams();
  const research = RESEARCH_LIST.find((item) => item.id === Number(id));

  if (!research) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/research"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-crimson"
        >
          <ArrowLeft className="size-4" /> Back to research
        </Link>
        <p className="text-muted-foreground">Research area not found.</p>
      </div>
    );
  }

  return (
    <article className="flex w-full flex-col gap-8">
      <Link
        href="/research"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-crimson"
      >
        <ArrowLeft className="size-4" /> Back to research
      </Link>
      <h1 className="display text-[clamp(1.9rem,4.5vw,3.2rem)] text-foreground">
        {research.title}
      </h1>
      <div className="rule" />
      <ResearchContents research={research} />
    </article>
  );
};
