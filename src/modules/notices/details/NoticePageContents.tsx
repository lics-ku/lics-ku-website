"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { NOTIFICATION_LIST } from "@data/home/NotificationList";
import { NoticeContents } from "./contents/NoticeContents";

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : "";

export const NoticePageContents = () => {
  const { id } = useParams();
  const notice = NOTIFICATION_LIST.find((item) => item.id === Number(id));

  return (
    <article className="flex w-full flex-col gap-8">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-crimson"
      >
        <ArrowLeft className="size-4" /> Back to home
      </Link>
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-crimson">
          {formatDate(notice?.createdAt)}
        </p>
        <h1 className="display text-[clamp(1.9rem,4.5vw,3.2rem)] text-foreground">
          {notice?.title}
        </h1>
      </div>
      <div className="rule" />
      {notice && <NoticeContents notice={notice} />}
    </article>
  );
};
