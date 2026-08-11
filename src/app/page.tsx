import { MainHeroSection } from "@/modules/home/MainHeroSection";
import { TopResearchSection } from "@/modules/home/TopResearchSection";
import { NotificationSection } from "@/modules/home/NotificationSection";
import { PeopleCtaSection } from "@/modules/home/PeopleCtaSection";
import { getPublicationsData } from "@/lib/publications";

export default async function Home() {
  const publications = await getPublicationsData();

  return (
    <>
      <MainHeroSection />
      <TopResearchSection
        paperCount={publications.papers.length}
        patentCount={publications.patents.length}
      />
      <NotificationSection />
      <PeopleCtaSection />
    </>
  );
}
