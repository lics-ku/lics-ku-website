import type { Metadata } from "next";

import { PageHeader } from "@/components/PageHeader";
import { PeopleNavigation } from "@/modules/people/PeopleNavigation";

export const metadata: Metadata = {
  title: "People",
  description:
    "The people of LICS — Prof. Sang Hyun Lee, doctoral and undergraduate researchers, and alumni now across academia and industry.",
};

export default function PeopleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="People · 구성원"
        title="The people behind the work."
        lead="A close-knit group of researchers studying communications, networks, and learning — led by Prof. Sang Hyun Lee at Korea University."
      />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="sticky top-16 z-30 -mx-5 bg-background/85 px-5 backdrop-blur sm:mx-0 sm:px-0">
          <PeopleNavigation />
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </div>
  );
}
