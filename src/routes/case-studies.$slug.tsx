import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Reveal } from "@/components/site/Reveal";
import { useCaseStudy, mediaAspectClass, cleanSlug } from "@/lib/cms";

export const Route = createFileRoute("/case-studies/$slug")({
  component: CaseStudyPage,
  head: ({ params }) => ({
    meta: [
      { title: `${cleanSlug(params.slug)} — Rao Hamza Saif` },
      { name: "description", content: "Case study" },
    ],
  }),
});

function CaseStudyPage() {
  const { slug: rawSlug } = Route.useParams();
  const slug = cleanSlug(rawSlug);
  const { data: cs, isLoading } = useCaseStudy(slug);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container-x py-24 text-body">Loading…</div>
      </SiteLayout>
    );
  }

  if (!cs) {
    return (
      <SiteLayout>
        <div className="container-x py-24">
          <p className="text-body">Case study not found.</p>
          <Link to="/case-studies" className="mt-4 inline-flex items-center gap-1.5 text-primary">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const storyBlocks = [
    { title: "Challenge", body: cs.challenge },
    { title: "Goal", body: cs.goal },
    { title: "Strategy", body: cs.strategy },
    { title: "Outcome", body: cs.outcome },
  ].filter((b) => b.body);

  const creativeCols =
    cs.ad_creatives.length === 1
      ? "grid-cols-1 max-w-xl mx-auto"
      : cs.ad_creatives.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  const statCols =
    cs.campaign_stat_images.length === 1
      ? "grid-cols-1 max-w-4xl mx-auto"
      : "grid-cols-1 md:grid-cols-2";

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="container-x pt-14 pb-12 md:pt-24 md:pb-16">
        <Reveal>
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-body-light transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> All case studies
          </Link>
        </Reveal>

        <Reveal delay={60}>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {cs.industry && (
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                {cs.industry}
              </span>
            )}
            {cs.platforms.map((p) => (
              <span
                key={p}
                className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-ink-soft"
              >
                {p}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.02] tracking-tight text-ink md:text-7xl">
            {cs.title}
          </h1>
          {cs.summary && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-body">{cs.summary}</p>
          )}
        </Reveal>

        {cs.cover_image_url && (
          <Reveal delay={140}>
            <div className="mt-10 overflow-hidden rounded-[22px] border border-border shadow-soft">
              <div className="aspect-[16/9] w-full bg-secondary">
                <img
                  src={cs.cover_image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </Reveal>
        )}
      </section>

      {/* Meta bar */}
      <section className="container-x pb-12 md:pb-16">
        <Reveal delay={160}>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-border bg-border md:grid-cols-4">
            <Meta k="Client" v={cs.client ?? "—"} />
            <Meta k="Country" v={cs.country ?? "—"} />
            <Meta k="Duration" v={cs.duration ?? "—"} />
            <Meta k="Platforms" v={cs.platforms.join(", ") || "—"} />
          </dl>
        </Reveal>
      </section>

      {/* KPIs */}
      {cs.results.length > 0 && (
        <section className="bg-dark-bg py-16 md:py-20">
          <div className="container-x">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Results</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-white md:text-5xl">
                The <span className="italic-purple">numbers</span>.
              </h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              {cs.results.map((r, idx) => (
                <Reveal key={`${r.label}-${idx}`} delay={idx * 60} className="h-full">
                  <div className="h-full rounded-[22px] border border-white/10 bg-white/[0.04] p-6 md:p-8">
                    <p className="font-display text-3xl font-bold text-white md:text-4xl">{r.value}</p>
                    <p className="mt-2 text-sm text-white/60">{r.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Story */}
      {storyBlocks.length > 0 && (
        <section className="bg-secondary py-16 md:py-24">
          <div className="container-x">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">The brief</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-ink md:text-5xl">
                What we <span className="italic-purple">solved</span>.
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-5">
              {storyBlocks.map((b, idx) => (
                <Reveal
                  key={b.title}
                  delay={idx * 60}
                  className={storyBlocks.length % 2 === 1 && idx === storyBlocks.length - 1 ? "md:col-span-2" : ""}
                >
                  <StoryBlock title={b.title} body={b.body!} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Funnel */}
      {cs.funnel_html && (
        <section className="container-x py-16 md:py-24">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Funnel preview</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-ink md:text-5xl">
              The live <span className="italic-purple">funnel</span>.
            </h2>
            <p className="mt-3 max-w-xl text-body">
              Scroll inside the preview box — the rest of the page stays still.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="funnel-scroll-box mt-8 overflow-hidden rounded-[22px] border border-border bg-white p-3 shadow-soft md:p-4">
              <div className="funnel-scroll-inner">
                <div className="funnel-embed" dangerouslySetInnerHTML={{ __html: cs.funnel_html }} />
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* Ad creatives */}
      {cs.ad_creatives.length > 0 && (
        <section className="bg-secondary py-16 md:py-24">
          <div className="container-x">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Ad creatives</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-ink md:text-5xl">
                The <span className="italic-purple">assets</span> that ran.
              </h2>
            </Reveal>
            <div className={`mt-10 grid gap-5 ${creativeCols}`}>
              {cs.ad_creatives.map((m, idx) => (
                <Reveal key={`${m.url}-${idx}`} delay={idx * 50} className="h-full">
                  <figure className="card-premium h-full overflow-hidden p-0">
                    <div className="flex min-h-[240px] items-center justify-center bg-white p-4 md:min-h-[280px]">
                      {m.type === "video" ? (
                        <video
                          src={m.url}
                          controls
                          className={`${mediaAspectClass(m.aspect, "video")} max-h-[420px] rounded-lg`}
                        />
                      ) : (
                        <img
                          src={m.url}
                          alt={m.caption ?? ""}
                          className={`${mediaAspectClass(m.aspect, "image")} max-h-[420px] rounded-lg`}
                        />
                      )}
                    </div>
                    {m.caption && (
                      <figcaption className="border-t border-border px-5 py-4 text-sm text-body">
                        {m.caption}
                      </figcaption>
                    )}
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Campaign stats */}
      {cs.campaign_stat_images.length > 0 && (
        <section className="container-x py-16 md:py-24">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Campaign performance</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-ink md:text-5xl">
              Straight from the <span className="italic-purple">dashboard</span>.
            </h2>
          </Reveal>
          <div className={`mt-10 grid gap-5 ${statCols}`}>
            {cs.campaign_stat_images.map((s, idx) => (
              <Reveal key={`${s.url}-${idx}`} delay={idx * 60} className="h-full">
                <figure className="card-premium overflow-hidden p-0">
                  <div className="bg-white p-2 md:p-3">
                    <img
                      src={s.url}
                      alt={s.caption ?? ""}
                      className="w-full rounded-xl object-contain"
                    />
                  </div>
                  {s.caption && (
                    <figcaption className="border-t border-border px-5 py-4 text-sm text-body">
                      {s.caption}
                    </figcaption>
                  )}
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Contact nudge */}
      <section className="container-x pb-20 md:pb-28">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 rounded-[22px] border border-border bg-white p-8 md:flex-row md:items-center md:p-10">
            <div>
              {cs.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {cs.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <p className="font-display text-2xl font-bold text-ink md:text-3xl">
                  Want similar results?
                </p>
                <p className="mt-2 max-w-md text-body">
                  Book a free intro call — I'll walk through what worked here and whether it fits your account.
                </p>
              </div>
              <Link to="/contact" className="btn-primary shrink-0">
                Book a call <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </section>
    </SiteLayout>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-white px-5 py-5 md:px-6 md:py-6">
      <dt className="text-xs font-semibold uppercase tracking-widest text-body-light">{k}</dt>
      <dd className="mt-2 font-display text-base font-bold text-ink md:text-lg">{v}</dd>
    </div>
  );
}

function StoryBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="card-premium h-full p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{title}</p>
      <p className="mt-4 text-base leading-relaxed text-body md:text-lg">{body}</p>
    </div>
  );
}
