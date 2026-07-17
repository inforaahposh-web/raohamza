import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Reveal } from "@/components/site/Reveal";
import { useCaseStudies, useSection } from "@/lib/cms";

export const Route = createFileRoute("/case-studies")({
  component: CaseStudiesIndex,
  head: () => ({
    meta: [
      { title: "Case Studies — Rao Hamza Saif" },
      { name: "description", content: "Selected performance marketing case studies across real estate, ecommerce, prop trading and more." },
      { property: "og:title", content: "Case Studies — Rao Hamza Saif" },
      { property: "og:description", content: "Real accounts. Real numbers." },
    ],
  }),
});

function CaseStudiesIndex() {
  const { data: cases } = useCaseStudies();
  const { data: industries } = useSection("industries");
  const published = (cases ?? []).filter((c) => c.published);
  const indBySlug = new Map((industries?.items ?? []).map((i) => [i.slug, i]));

  return (
    <SiteLayout>
      <section className="container-x pt-14 pb-10 md:pt-24 md:pb-16">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Case studies</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink md:text-8xl">
            Numbers over <span className="italic-purple">narratives</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-body">A rolling selection of accounts I've built, scaled or rebuilt. Every card is one industry, one system, one outcome.</p>
        </Reveal>
      </section>

      <section className="container-x pb-24">
        <div className="grid gap-5 md:grid-cols-2">
          {published.map((cs, i) => {
            const ind = indBySlug.get(cs.slug);
            return (
              <Reveal key={cs.id} delay={i * 40}>
                <Link
                  to="/case-studies/$slug"
                  params={{ slug: cs.slug }}
                  className="card-premium group block h-full overflow-hidden p-0 md:p-0"
                >
                  {cs.cover_image_url && (
                    <div className="aspect-[16/9] w-full overflow-hidden bg-secondary">
                      <img src={cs.cover_image_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-7 md:p-10">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">{cs.industry ?? ind?.name}</span>
                      <ArrowUpRight className="h-5 w-5 text-body-light transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <h2 className="mt-6 font-display text-2xl font-bold leading-snug text-ink md:text-3xl">
                      {cs.title}
                    </h2>
                    {cs.summary && <p className="mt-4 text-body">{cs.summary}</p>}
                    <div className="mt-8 flex items-end justify-between border-t border-border pt-5">
                      <div>
                        <p className="font-display text-3xl font-bold text-ink">{cs.results[0]?.value ?? "—"}</p>
                        <p className="text-xs text-body-light">{cs.results[0]?.label ?? ""}</p>
                      </div>
                      <span className="text-sm font-medium text-primary">Read study →</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}
