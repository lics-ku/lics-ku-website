import type { Metadata } from "next";

import { NOTIFICATION_LIST } from "@data/home/NotificationList";
import { NoticePageContents } from "@/modules/notices/details/NoticePageContents";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const notice = NOTIFICATION_LIST.find((item) => item.id === Number(id));
  if (!notice) return { title: "Notice" };
  return {
    title: notice.title,
    description: notice.description,
    openGraph: { title: notice.title, description: notice.description },
  };
}

export function generateStaticParams() {
  return NOTIFICATION_LIST.map((n) => ({ id: String(n.id) }));
}

const NoticeContentPage = () => {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <NoticePageContents />
    </div>
  );
};

export default NoticeContentPage;
