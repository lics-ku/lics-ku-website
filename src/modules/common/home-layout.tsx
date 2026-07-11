import { Toaster } from "sonner";

import { HomeNavbar } from "@/modules/common/HomeNavbar";
import { Footer } from "@/modules/common/Footer";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export const HomeLayout = ({ children }: HomeLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <HomeNavbar />
      <Toaster position="top-center" />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
};
