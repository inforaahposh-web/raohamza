import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollAvatar } from "./ScrollAvatar";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full overflow-x-hidden pt-16 md:pt-20">{children}</main>
      <Footer />
      <ScrollAvatar />
    </div>
  );
}
