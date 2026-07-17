import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollAvatar } from "./ScrollAvatar";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="site-main">{children}</main>
      <Footer />
      <ScrollAvatar />
    </div>
  );
}
