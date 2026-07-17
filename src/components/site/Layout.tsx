import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

const ScrollAvatar = lazy(() =>
  import("./ScrollAvatar").then((m) => ({ default: m.ScrollAvatar })),
);

export function SiteLayout({ children }: { children: ReactNode }) {
  const [showAvatar, setShowAvatar] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setShowAvatar(true);
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idleId = w.requestIdleCallback?.(enable, { timeout: 2500 });
    const t = window.setTimeout(enable, 1800);
    return () => {
      cancelled = true;
      if (idleId != null) w.cancelIdleCallback?.(idleId);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="site-main">{children}</main>
      <Footer />
      {showAvatar && (
        <Suspense fallback={null}>
          <ScrollAvatar />
        </Suspense>
      )}
    </div>
  );
}
