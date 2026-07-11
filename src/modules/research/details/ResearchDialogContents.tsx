"use client";

import { useParams } from "next/navigation";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RESEARCH_LIST } from "@data/research/ResearchList";
import { ResearchContents } from "./contents/ResearchContents";

export const ResearchDialogContents = () => {
  const { id } = useParams();
  const research = RESEARCH_LIST.find((item) => item.id === Number(id));

  if (!research) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        Research area not found.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DialogHeader className="space-y-0 text-left">
        <DialogTitle className="display text-2xl leading-tight text-foreground sm:text-3xl">
          {research.title}
        </DialogTitle>
      </DialogHeader>
      <div className="rule" />
      <ResearchContents research={research} />
    </div>
  );
};
