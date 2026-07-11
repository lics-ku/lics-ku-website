import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";

import { MAIN_ANNOUNCEMENT } from "@data/home/MainAnnouncement";
import { NOTIFICATION_LIST } from "@data/home/NotificationList";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    // Date-only strings are parsed as UTC midnight; pin the zone so server and
    // client render identically (no off-by-one, no hydration mismatch).
    timeZone: "UTC",
  });

export const NotificationSection = () => {
  const showAnnouncement =
    MAIN_ANNOUNCEMENT.isDisplayed &&
    MAIN_ANNOUNCEMENT.startDate <= new Date() &&
    MAIN_ANNOUNCEMENT.endDate >= new Date();

  const recent = [...NOTIFICATION_LIST]
    .sort((a, b) => b.id - a.id)
    .slice(0, 4);

  return (
    <section className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <SectionHeading eyebrow="공지사항 · News" title="Recent updates" />

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          {/* Recent notices */}
          <Reveal>
            <ul className="flex flex-col">
              {recent.map((notice) => (
                <li key={notice.id}>
                  <Link
                    href={`/notices/${notice.id}`}
                    prefetch={false}
                    className="group flex items-baseline gap-4 border-b border-border py-5 transition-colors first:border-t hover:border-crimson/40"
                  >
                    <time className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
                      {formatDate(notice.createdAt)}
                    </time>
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="font-semibold text-foreground transition-colors group-hover:text-crimson">
                        {notice.title}
                      </span>
                      <span className="line-clamp-1 text-sm text-muted-foreground">
                        {notice.description}
                      </span>
                    </div>
                    <ArrowRight className="mt-1 size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Recruiting call-out */}
          {showAnnouncement && (
            <Reveal delay={120}>
              <Link
                href={`/notices/${MAIN_ANNOUNCEMENT.noticeId}`}
                prefetch={false}
                className="group flex h-full flex-col justify-between gap-6 rounded-2xl border border-crimson/25 bg-crimson/[0.06] p-7 transition-colors hover:bg-crimson/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex flex-col gap-4">
                  <span className="inline-flex size-11 items-center justify-center rounded-full bg-crimson/12 text-crimson">
                    <Megaphone className="size-5" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <p className="eyebrow">Now recruiting</p>
                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                      {MAIN_ANNOUNCEMENT.title}
                    </h3>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {MAIN_ANNOUNCEMENT.message}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-crimson">
                  View details
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
};
