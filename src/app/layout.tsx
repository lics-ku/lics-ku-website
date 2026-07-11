import type { Metadata } from "next";
import "./globals.css";

import { pretendard } from "./fonts";
import { HomeLayout as _HomeLayout } from "@/modules/common/home-layout";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const SITE_URL = "https://lics.korea.ac.kr";
const DESCRIPTION =
  "LICS — Lab for Informatics, Communications, and Systems at Korea University. Research in wireless communications, networks, distributed optimization, learning, and signal processing, led by Prof. Sang Hyun Lee.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LICS · Lab for Informatics, Communications, and Systems",
    template: "%s · LICS @ Korea University",
  },
  description: DESCRIPTION,
  keywords: [
    "LICS",
    "Korea University",
    "wireless communications",
    "signal processing",
    "networks",
    "distributed optimization",
    "message passing",
    "Sang Hyun Lee",
  ],
  openGraph: {
    type: "website",
    siteName: "LICS @ Korea University",
    title: "LICS · Lab for Informatics, Communications, and Systems",
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "LICS · Lab for Informatics, Communications, and Systems",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={pretendard.variable}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          <_HomeLayout>
            {modal}
            {children}
          </_HomeLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
