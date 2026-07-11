import { ResearchContentCarousels } from "@/modules/research/details/contents/ResearchContentCarousels";
import { type Notification } from "@data/index";

export const NoticeContents = ({ notice }: { notice: Notification }) => {
  return (
    <div className="flex flex-col gap-7">
      {notice.resources && notice.resources.length > 0 && (
        <ResearchContentCarousels resources={notice.resources} />
      )}
      {notice.subtitle && (
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-crimson">
          {notice.subtitle}
        </p>
      )}
      <p className="whitespace-pre-line text-base leading-[1.85] text-foreground/80">
        {notice.description}
      </p>
    </div>
  );
};
