import { MainHeroSection } from "@/modules/home/MainHeroSection";
import { TopResearchSection } from "@/modules/home/TopResearchSection";
import { NotificationSection } from "@/modules/home/NotificationSection";
import { PeopleCtaSection } from "@/modules/home/PeopleCtaSection";

export default function Home() {
  return (
    <>
      <MainHeroSection />
      <TopResearchSection />
      <NotificationSection />
      <PeopleCtaSection />
    </>
  );
}
