import { Research } from "@data/index";
import { ResearchContentCarousels } from "./ResearchContentCarousels";

export const ResearchContents = ({ research }: { research: Research }) => {
  return (
    <div className="flex flex-col gap-7">
      {research.resources && research.resources.length > 0 && (
        <ResearchContentCarousels resources={research.resources} />
      )}
      {research.subtitle && (
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-crimson">
          {research.subtitle}
        </p>
      )}
      <p className="whitespace-pre-line text-base leading-[1.85] text-foreground/80">
        {research.description}
      </p>
    </div>
  );
};
