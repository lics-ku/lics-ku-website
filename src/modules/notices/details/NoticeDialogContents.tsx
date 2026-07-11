"use client";

import { useParams } from "next/navigation";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export const NoticeDialogContents = () => {
  const { id } = useParams();
  const notice = NOTIFICATION_LIST.find((item) => item.id === Number(id));

  return (
    <div className="flex flex-col gap-6">
      <DialogHeader className="space-y-2 text-left">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-crimson">
          {formatDate(notice?.createdAt)}
        </p>
        <DialogTitle className="display text-2xl leading-tight text-foreground sm:text-3xl">
          {notice?.title}
        </DialogTitle>
      </DialogHeader>
      <div className="rule" />
      {notice && <NoticeContents notice={notice} />}
    </div>
  );
};
