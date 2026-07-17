import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { Reveal } from "@/components/site/Reveal";
import { CaseStudyFunnel } from "@/components/site/CaseStudyFunnel";
import { useFunnelLibrary, type FunnelKind } from "@/lib/cms";

export const Route = createFileRoute("/funnels")({
  component: FunnelsPage,
  head: () => ({
    meta: [
      { title: "Prelanders & Funnels — Rao Hamza Saif" },
      { name: "description", content: "Browse live prelander and funnel examples from performance campaigns." },
      { property: "og:title", content: "Prelanders & Funnels — Rao Hamza Saif" },
      { property: "og:description", content: "Interactive prelander and funnel previews." },
    ],
  }),
});

function FunnelsPage() {
  const { data: items = [], isLoading } = useFunnelLibrary();
  const [kind, setKind] = useState<FunnelKind>("prelander");
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(
    () => items.filter((i) => i.kind === kind && i.html.trim()),
    [items, kind],
  );

  const active = useMemo(() => {
    if (filtered.length === 0) return null;
    return filtered.find((i) => i.id === activeId) ?? filtered[0];
  }, [filtered, activeId]);

  return (
    <SiteLayout>
      <section className="container-x pt-14 pb-10 md:pt-24 md:pb-16">
        <Reveal immediate>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Work samples</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink md:text-8xl">
            Prelanders & <span className="italic-purple">funnels</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-body">
            Live page previews. Pick a type, then open any sample — scroll inside the preview box.
          </p>
        </Reveal>

        <Reveal immediate delay={80}>
          <div className="mt-10 inline-flex rounded-full border border-border bg-white p-1 shadow-soft">
            <KindButton active={kind === "prelander"} onClick={() => { setKind("prelander"); setActiveId(null); }}>
              Prelanders
            </KindButton>
            <KindButton active={kind === "funnel"} onClick={() => { setKind("funnel"); setActiveId(null); }}>
              Funnels
            </KindButton>
          </div>
        </Reveal>
      </section>

      <section className="container-x pb-24">
        {isLoading ? (
          <p className="text-body">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-[22px] border border-border bg-white p-10 text-center">
            <p className="font-display text-2xl font-bold text-ink">
              No {kind === "prelander" ? "prelanders" : "funnels"} yet
            </p>
            <p className="mt-3 text-body">
              Add some from Admin → Prelanders & Funnels.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
            <div className="space-y-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-body-light">
                {kind === "prelander" ? "Prelanders" : "Funnels"} ({filtered.length})
              </p>
              {filtered.map((item) => {
                const selected = active?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary-soft text-ink"
                        : "border-border bg-white text-ink-soft hover:border-primary/40"
                    }`}
                  >
                    <p className="font-display text-base font-bold text-ink">{item.title}</p>
                    {item.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-body-light">{item.description}</p>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {active && (
              <div>
                <div className="mb-4">
                  <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">{active.title}</h2>
                  {active.description ? <p className="mt-2 text-body">{active.description}</p> : null}
                  <p className="mt-2 text-sm text-body-light">
                    Scroll inside the preview — the rest of the page stays still.
                  </p>
                </div>
                <div className="case-study-funnel-shell">
                  <div className="funnel-scroll-inner">
                    <CaseStudyFunnel html={active.html} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function KindButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
        active ? "bg-primary text-white shadow-soft" : "text-ink-soft hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}
