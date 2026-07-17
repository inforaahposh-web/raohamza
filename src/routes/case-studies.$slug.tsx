import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { Reveal } from "@/components/site/Reveal";
import { CaseStudyFunnel } from "@/components/site/CaseStudyFunnel";
import {
  cleanSlug,
  fetchCaseStudyBySlug,
  mediaAspectClass,
  useCaseStudy,
  type MediaItem,
  type ResultKPI,
  type StatImage,
} from "@/lib/cms";

export const Route = createFileRoute("/case-studies/$slug")({
  loader: ({ context, params }) => {
    const slug = cleanSlug(params.slug);
    return context.queryClient.ensureQueryData({
      queryKey: ["cms", "case_study", slug],
      queryFn: () => fetchCaseStudyBySlug(slug),
    });
  },
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
  const { data: cs, isLoading, isError } = useCaseStudy(slug);

  if (isLoading) {
    return (
      <SiteLayout>
        <CaseStudySkeleton />
      </SiteLayout>
    );
  }

  if (isError || !cs) {
    return (
      <SiteLayout>
        <div className="container-x py-24">
          <p className="text-body">Case study not found.</p>
          <Link to="/case-studies" className="mt-4 inline-flex items-center gap-1.5 text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to all case studies
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

  return (
    <SiteLayout>
      <article className="w-full overflow-x-hidden">
        <header className="container-x w-full pt-14 pb-10 md:pt-24 md:pb-14">
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-body-light transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> All case studies
          </Link>

          <div className="mt-8 flex w-full flex-wrap items-center gap-2">
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

          <h1 className="mt-6 w-full max-w-5xl font-display text-4xl font-bold leading-[1.02] tracking-tight text-ink md:text-7xl">
            {cs.title}
          </h1>
          {cs.summary && (
            <p className="mt-6 w-full max-w-3xl text-lg leading-relaxed text-body">{cs.summary}</p>
          )}

          {cs.cover_image_url && (
            <div className="mt-10 w-full overflow-hidden rounded-[22px] border border-border shadow-soft">
              <div className="aspect-[16/9] w-full bg-secondary">
                <img src={cs.cover_image_url} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          )}
        </header>

        <section className="container-x w-full pb-12 md:pb-16">
          <dl className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
            <MetaCard label="Client" value={cs.client ?? "—"} />
            <MetaCard label="Country" value={cs.country ?? "—"} />
            <MetaCard label="Duration" value={cs.duration ?? "—"} />
            <MetaCard label="Platforms" value={cs.platforms.join(", ") || "—"} />
          </dl>
        </section>

        {cs.results.length > 0 && (
          <section className="w-full bg-dark-bg py-16 md:py-20">
            <div className="container-x w-full">
              <SectionHeading
                eyebrow="Results"
                title={<>The <span className="italic-purple">numbers</span>.</>}
                dark
              />
              <div className="mt-10 grid w-full grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
                {cs.results.map((r, idx) => (
                  <KpiCard key={`${r.label}-${idx}`} kpi={r} />
                ))}
              </div>
            </div>
          </section>
        )}

        {storyBlocks.length > 0 && (
          <section className="w-full bg-secondary py-16 md:py-24">
            <div className="container-x w-full">
              <SectionHeading
                eyebrow="The brief"
                title={<>What we <span className="italic-purple">solved</span>.</>}
              />
              <div className="mt-10 grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                {storyBlocks.map((b, idx) => (
                  <StoryCard
                    key={b.title}
                    title={b.title}
                    body={b.body!}
                    spanFull={storyBlocks.length % 2 === 1 && idx === storyBlocks.length - 1}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {cs.funnel_html && (
          <section className="container-x w-full py-16 md:py-24">
            <SectionHeading
              eyebrow="Funnel preview"
              title={<>The live <span className="italic-purple">funnel</span>.</>}
              subtitle="Scroll inside the preview box — the rest of the page stays still."
            />
            <div className="case-study-funnel-shell mt-8 w-full">
              <div className="funnel-scroll-inner">
                <CaseStudyFunnel html={cs.funnel_html} />
              </div>
            </div>
          </section>
        )}

        {cs.ad_creatives.length > 0 && (
          <section className="w-full bg-secondary py-16 md:py-24">
            <div className="container-x w-full">
              <SectionHeading
                eyebrow="Ad creatives"
                title={<>The <span className="italic-purple">assets</span> that ran.</>}
              />
              <div className={`mt-10 grid w-full gap-5 ${creativeGridClass(cs.ad_creatives.length)}`}>
                {cs.ad_creatives.map((m, idx) => (
                  <CreativeCard key={`${m.url}-${idx}`} media={m} />
                ))}
              </div>
            </div>
          </section>
        )}

        {cs.campaign_stat_images.length > 0 && (
          <section className="container-x w-full py-16 md:py-24">
            <SectionHeading
              eyebrow="Campaign performance"
              title={<>Straight from the <span className="italic-purple">dashboard</span>.</>}
            />
            <div className={`mt-10 grid w-full gap-5 ${statGridClass(cs.campaign_stat_images.length)}`}>
              {cs.campaign_stat_images.map((s, idx) => (
                <StatCard key={`${s.url}-${idx}`} stat={s} />
              ))}
            </div>
          </section>
        )}

        <section className="container-x w-full pb-20 md:pb-28">
          <div className="flex w-full flex-col items-start justify-between gap-6 rounded-[22px] border border-border bg-white p-8 shadow-soft md:flex-row md:items-center md:p-10">
            <div className="min-w-0 flex-1">
              {cs.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {cs.tags.map((t) => (
                    <span key={t} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <p className="font-display text-2xl font-bold text-ink md:text-3xl">Want similar results?</p>
              <p className="mt-2 max-w-lg text-body">
                Book a free intro call — I'll walk through what worked here and whether it fits your account.
              </p>
            </div>
            <Link to="/contact" className="btn-primary shrink-0">
              Book a call <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </article>
    </SiteLayout>
  );
}

function creativeGridClass(count: number) {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 md:grid-cols-2";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
}

function statGridClass(count: number) {
  if (count === 1) return "grid-cols-1";
  return "grid-cols-1 lg:grid-cols-2";
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  dark,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  dark?: boolean;
}) {
  return (
    <Reveal>
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className={`mt-3 font-display text-3xl font-bold md:text-5xl ${dark ? "text-white" : "text-ink"}`}>
        {title}
      </h2>
      {subtitle && <p className="mt-3 max-w-xl text-body">{subtitle}</p>}
    </Reveal>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-border bg-white p-5 md:p-6">
      <dt className="text-xs font-semibold uppercase tracking-widest text-body-light">{label}</dt>
      <dd className="mt-2 break-words font-display text-base font-bold text-ink md:text-lg">{value}</dd>
    </div>
  );
}

function KpiCard({ kpi }: { kpi: ResultKPI }) {
  return (
    <div className="h-full rounded-[22px] border border-white/10 bg-white/[0.04] p-6 md:p-8">
      <p className="font-display text-3xl font-bold text-white md:text-4xl">{kpi.value}</p>
      <p className="mt-2 text-sm text-white/60">{kpi.label}</p>
    </div>
  );
}

function StoryCard({ title, body, spanFull }: { title: string; body: string; spanFull?: boolean }) {
  return (
    <div className={`rounded-[22px] border border-border bg-white p-6 shadow-soft md:p-8 ${spanFull ? "md:col-span-2" : ""}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{title}</p>
      <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-body md:text-lg">{body}</p>
    </div>
  );
}

function CreativeCard({ media }: { media: MediaItem }) {
  const aspect = media.aspect ?? "auto";
  const framed = aspect !== "auto";

  return (
    <figure className="w-full overflow-hidden rounded-[22px] border border-border bg-white shadow-soft">
      <div
        className={`flex w-full items-center justify-center bg-secondary/40 p-4 ${
          framed ? "" : "min-h-[280px] md:min-h-[320px]"
        }`}
      >
        {media.type === "video" ? (
          <video
            src={media.url}
            controls
            className={`${mediaAspectClass(aspect, "video")} ${framed ? "w-full" : "max-h-[480px] max-w-full rounded-lg object-contain"}`}
          />
        ) : (
          <img
            src={media.url}
            alt={media.caption ?? ""}
            className={`${mediaAspectClass(aspect, "image")} ${framed ? "w-full" : "max-h-[480px] max-w-full rounded-lg object-contain"}`}
          />
        )}
      </div>
      {media.caption && (
        <figcaption className="border-t border-border px-5 py-4 text-sm text-body">{media.caption}</figcaption>
      )}
    </figure>
  );
}

function StatCard({ stat }: { stat: StatImage }) {
  return (
    <figure className="w-full overflow-hidden rounded-[22px] border border-border bg-white shadow-soft">
      <div className="w-full bg-white p-3 md:p-4">
        <img src={stat.url} alt={stat.caption ?? ""} className="w-full rounded-xl object-contain" />
      </div>
      {stat.caption && (
        <figcaption className="border-t border-border px-5 py-4 text-sm text-body">{stat.caption}</figcaption>
      )}
    </figure>
  );
}

function CaseStudySkeleton() {
  return (
    <div className="container-x w-full animate-pulse py-24">
      <div className="h-4 w-32 rounded bg-secondary" />
      <div className="mt-8 h-12 w-2/3 max-w-xl rounded bg-secondary" />
      <div className="mt-4 h-6 w-1/2 max-w-md rounded bg-secondary" />
      <div className="mt-10 aspect-[16/9] w-full rounded-[22px] bg-secondary" />
    </div>
  );
}
