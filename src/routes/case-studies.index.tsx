import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Reveal } from "@/components/site/Reveal";
import { useCaseStudies, cleanSlug } from "@/lib/cms";

export const Route = createFileRoute("/case-studies/")({
  component: CaseStudiesIndex,
  head: () => ({
    meta: [
      { title: "Case Studies — Rao Hamza & Team" },
      { name: "description", content: "Selected performance marketing case studies across real estate, ecommerce, prop trading and more." },
      { property: "og:title", content: "Case Studies — Rao Hamza & Team" },
      { property: "og:description", content: "Real accounts. Real numbers." },
    ],
  }),
});

function CaseStudiesIndex() {
  const { data: cases, isLoading } = useCaseStudies();
  const published = (cases ?? []).filter((c) => c.published);

  return (
    <SiteLayout>
      <section className="container-x pt-14 pb-10 md:pt-24 md:pb-16">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Case studies</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink md:text-8xl">
            Numbers over <span className="italic-purple">narratives</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-body">A rolling selection of accounts we've built, scaled or rebuilt. Every card is one industry, one system, one outcome.</p>
        </Reveal>
      </section>

      <section className="container-x pb-24">
        {isLoading ? (
          <p className="text-body">Loading case studies…</p>
        ) : published.length === 0 ? (
          <div className="rounded-[22px] border border-border bg-white p-10 text-center">
            <p className="font-display text-2xl font-bold text-ink">Case studies coming soon</p>
            <p className="mt-3 text-body">New work is being added. Check back shortly or get in touch.</p>
            <Link to="/contact" className="btn-primary mt-6 inline-flex">Get in touch</Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {published.map((cs, i) => (
              <Reveal key={cs.id} delay={i * 40}>
                <Link
                  to="/case-studies/$slug"
                  params={{ slug: cleanSlug(cs.slug) }}
                  className="card-premium group block h-full overflow-hidden p-0 md:p-0"
                >
                  {cs.cover_image_url && (
                    <div className="aspect-[16/9] w-full overflow-hidden bg-secondary">
                      <img
                        src={cs.cover_image_url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-7 md:p-10">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">{cs.industry ?? "Case study"}</span>
                      <ArrowUpRight className="h-5 w-5 shrink-0 text-body-light transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <h2 className="mt-6 font-display text-2xl font-bold leading-snug text-ink md:text-3xl">
                      {cs.title}
                    </h2>
                    {cs.summary && <p className="mt-4 text-body">{cs.summary}</p>}
                    {cs.results.length > 0 && (
                      <div className="mt-8 flex flex-wrap gap-6 border-t border-border pt-5">
                        {cs.results.slice(0, 3).map((r, idx) => (
                          <div key={`${r.label}-${idx}`}>
                            <p className="font-display text-2xl font-bold text-ink md:text-3xl">{r.value}</p>
                            <p className="text-xs text-body-light">{r.label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="mt-6 text-sm font-medium text-primary">Read study →</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
