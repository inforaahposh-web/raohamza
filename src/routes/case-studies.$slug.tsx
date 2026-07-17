import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Reveal } from "@/components/site/Reveal";
import { useCaseStudy, mediaAspectClass } from "@/lib/cms";

export const Route = createFileRoute("/case-studies/$slug")({
  component: CaseStudyPage,
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Rao Hamza Saif` },
      { name: "description", content: "Case study" },
    ],
  }),
});

function CaseStudyPage() {
  const { slug } = Route.useParams();
  const { data: cs, isLoading } = useCaseStudy(slug);

  if (isLoading) {
    return <SiteLayout><div className="container-x py-24 text-body">Loading…</div></SiteLayout>;
  }

  if (!cs) {
    return (
      <SiteLayout>
        <div className="container-x py-24">
          <p className="text-body">Case study not found.</p>
          <Link to="/case-studies" className="mt-4 inline-flex items-center gap-1.5 text-primary"><ArrowLeft className="h-4 w-4" /> Back</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <article className="container-x pt-14 pb-24 md:pt-24">
        <Reveal>
          <Link to="/case-studies" className="inline-flex items-center gap-1.5 text-sm font-medium text-body-light hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> All case studies
          </Link>
        </Reveal>

        <Reveal delay={80}>
          {cs.industry && <span className="mt-8 inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">{cs.industry}</span>}
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.02] tracking-tight text-ink md:text-7xl">
            {cs.title}
          </h1>
          {cs.summary && <p className="mt-6 max-w-2xl text-lg text-body">{cs.summary}</p>}
        </Reveal>

        {cs.cover_image_url && (
          <Reveal delay={120}>
            <div className="mt-10 overflow-hidden rounded-[22px] border border-border">
              <img src={cs.cover_image_url} alt="" className="w-full object-cover" />
            </div>
          </Reveal>
        )}

        <Reveal delay={140}>
          <dl className="mt-12 grid grid-cols-2 gap-4 rounded-[22px] border border-border bg-white p-6 md:grid-cols-4 md:gap-6 md:p-8">
            <Meta k="Client" v={cs.client ?? "—"} />
            <Meta k="Country" v={cs.country ?? "—"} />
            <Meta k="Duration" v={cs.duration ?? "—"} />
            <Meta k="Platforms" v={cs.platforms.join(", ") || "—"} />
          </dl>
        </Reveal>

        {cs.results.length > 0 && (
          <Reveal delay={200}>
            <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              {cs.results.map((r, idx) => (
                <div key={`${r.label}-${idx}`} className="rounded-[22px] bg-dark-bg p-6 text-white shadow-large">
                  <p className="font-display text-3xl font-bold md:text-4xl">{r.value}</p>
                  <p className="mt-1 text-sm text-white/60">{r.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        <div className="mt-16 grid gap-10 md:grid-cols-2 md:gap-16">
          {cs.challenge && <Block title="Challenge" body={cs.challenge} />}
          {cs.goal && <Block title="Goal" body={cs.goal} />}
          {cs.strategy && <Block title="Strategy" body={cs.strategy} />}
          {cs.outcome && <Block title="Outcome" body={cs.outcome} />}
        </div>

        {cs.funnel_html && (
          <Reveal>
            <div className="mt-20">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Funnel preview</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-ink md:text-5xl">The live <span className="italic-purple">funnel</span>.</h2>
              <div className="mt-8 overflow-hidden rounded-[22px] border border-border bg-white p-2 md:p-4">
                <div className="funnel-embed w-full overflow-auto" dangerouslySetInnerHTML={{ __html: cs.funnel_html }} />
              </div>
            </div>
          </Reveal>
        )}

        {cs.ad_creatives.length > 0 && (
          <Reveal>
            <div className="mt-20">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Ad creatives</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-ink md:text-5xl">The <span className="italic-purple">assets</span> that ran.</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cs.ad_creatives.map((m, idx) => (
                  <figure key={`${m.url}-${idx}`} className="overflow-hidden rounded-[18px] border border-border bg-white">
                    <div className="flex items-center justify-center bg-secondary/50">
                      {m.type === "video" ? (
                        <video src={m.url} controls className={mediaAspectClass(m.aspect, "video")} />
                      ) : (
                        <img src={m.url} alt={m.caption ?? ""} className={mediaAspectClass(m.aspect, "image")} />
                      )}
                    </div>
                    {m.caption && <figcaption className="px-4 py-3 text-sm text-body">{m.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {cs.campaign_stat_images.length > 0 && (
          <Reveal>
            <div className="mt-20">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Campaign performance</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-ink md:text-5xl">Straight from the <span className="italic-purple">dashboard</span>.</h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {cs.campaign_stat_images.map((s, idx) => (
                  <figure key={`${s.url}-${idx}`} className="overflow-hidden rounded-[18px] border border-border bg-white">
                    <img src={s.url} alt={s.caption ?? ""} className="w-full" />
                    {s.caption && <figcaption className="px-4 py-3 text-sm text-body">{s.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        <Reveal>
          <div className="mt-16 flex items-center justify-between rounded-[22px] bg-primary p-8 text-white md:p-12">
            <div>
              <p className="text-sm uppercase tracking-widest text-white/70">Similar problem?</p>
              <p className="mt-2 font-display text-2xl font-bold md:text-4xl">Let's talk.</p>
            </div>
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-primary">
              Contact <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </article>
    </SiteLayout>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-body-light">{k}</dt>
      <dd className="mt-1 font-semibold text-ink">{v}</dd>
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <Reveal>
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">{title}</p>
        <p className="mt-4 font-display text-2xl leading-snug text-ink md:text-3xl">{body}</p>
      </div>
    </Reveal>
  );
}
