import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { CaseStudyFunnel } from "@/components/site/CaseStudyFunnel";
import {
  cleanSlug,
  fetchCaseStudyBySlug,
  useCaseStudy,
  type MediaItem,
  type ResultKPI,
  type StatImage,
} from "@/lib/cms";
import { OptimizedImage } from "@/components/site/OptimizedImage";

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
        <div className="case-study-inner" style={{ paddingBlock: "6rem" }}>
          <p className="text-body">Loading case study…</p>
        </div>
      </SiteLayout>
    );
  }

  if (isError || !cs) {
    return (
      <SiteLayout>
        <div className="case-study-inner" style={{ paddingBlock: "6rem" }}>
          <p className="text-body">Case study not found.</p>
          <Link to="/case-studies" className="case-study-back" style={{ marginTop: "1rem" }}>
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

  const mediaGrid =
    cs.ad_creatives.length <= 1
      ? "case-study-media-grid--1"
      : cs.ad_creatives.length === 2
        ? "case-study-media-grid--2"
        : "case-study-media-grid--3";

  return (
    <SiteLayout>
      <article className="case-study">
        {/* Hero */}
        <div className="case-study-inner">
          <Link to="/case-studies" className="case-study-back">
            <ArrowLeft className="h-4 w-4" /> All case studies
          </Link>

          <div className="case-study-hero-grid">
            <div>
              <p className="case-study-eyebrow">Case study</p>
              {cs.industry && (
                <div style={{ marginTop: "1rem" }}>
                  <span className="case-study-tag case-study-tag--primary">{cs.industry}</span>
                </div>
              )}
              <h1 className="case-study-title">{cs.title}</h1>
              {cs.summary && <p className="case-study-summary">{cs.summary}</p>}
            </div>

            {cs.cover_image_url && (
              <div className="case-study-cover">
                <OptimizedImage
                  src={cs.cover_image_url}
                  alt=""
                  widthHint={900}
                  quality={70}
                  priority
                  sizes="(max-width: 900px) 100vw, 520px"
                  srcSetWidths={[400, 640, 900]}
                />
              </div>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="case-study-inner">
          <dl className="case-study-meta-grid">
            <Meta label="Client" value={cs.client ?? "—"} />
            <Meta label="Country" value={cs.country ?? "—"} />
            <Meta label="Duration" value={cs.duration ?? "—"} />
            <Meta label="Platforms" value={cs.platforms.join(", ") || "—"} />
          </dl>
        </div>

        {/* KPIs */}
        {cs.results.length > 0 && (
          <section className="case-study-band case-study-band--dark">
            <div className="case-study-inner">
              <p className="case-study-eyebrow">Results</p>
              <h2 className="case-study-section-title case-study-section-title--light">
                The <span className="italic-purple">numbers</span>.
              </h2>
              <div className="case-study-kpi-grid">
                {cs.results.map((r, idx) => (
                  <Kpi key={`${r.label}-${idx}`} kpi={r} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Story */}
        {storyBlocks.length > 0 && (
          <section className="case-study-band case-study-band--muted">
            <div className="case-study-inner">
              <p className="case-study-eyebrow">The brief</p>
              <h2 className="case-study-section-title">
                What we <span className="italic-purple">solved</span>.
              </h2>
              <div className="case-study-story-grid">
                {storyBlocks.map((b, idx) => (
                  <Story
                    key={b.title}
                    title={b.title}
                    body={b.body!}
                    full={storyBlocks.length % 2 === 1 && idx === storyBlocks.length - 1}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Funnel */}
        {cs.funnel_html && (
          <section className="case-study-inner" style={{ paddingBlock: "4rem" }}>
            <p className="case-study-eyebrow">Funnel preview</p>
            <h2 className="case-study-section-title">
              The live <span className="italic-purple">funnel</span>.
            </h2>
            <p className="case-study-summary" style={{ marginTop: "0.75rem", fontSize: "0.9375rem" }}>
              Scroll inside the preview box — the rest of the page stays still.
            </p>
            <div className="case-study-funnel-shell">
              <div className="funnel-scroll-inner">
                <CaseStudyFunnel html={cs.funnel_html} />
              </div>
            </div>
          </section>
        )}

        {/* Creatives */}
        {cs.ad_creatives.length > 0 && (
          <section className="case-study-band case-study-band--muted">
            <div className="case-study-inner">
              <p className="case-study-eyebrow">Ad creatives</p>
              <h2 className="case-study-section-title">
                The <span className="italic-purple">assets</span> that ran.
              </h2>
              <div className={`case-study-media-grid ${mediaGrid}`}>
                {cs.ad_creatives.map((m, idx) => (
                  <MediaCard key={`${m.url}-${idx}`} media={m} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Dashboard stats */}
        {cs.campaign_stat_images.length > 0 && (
          <section className="case-study-inner" style={{ paddingBlock: "4rem" }}>
            <p className="case-study-eyebrow">Campaign performance</p>
            <h2 className="case-study-section-title">
              Straight from the <span className="italic-purple">dashboard</span>.
            </h2>
            <div className={`case-study-media-grid ${cs.campaign_stat_images.length === 1 ? "case-study-media-grid--1" : "case-study-media-grid--2"}`}>
              {cs.campaign_stat_images.map((s, idx) => (
                <StatCard key={`${s.url}-${idx}`} stat={s} />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="case-study-inner">
          <div className="case-study-cta">
            <div>
              {cs.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                  {cs.tags.map((t) => (
                    <span key={t} className="case-study-tag case-study-tag--primary">{t}</span>
                  ))}
                </div>
              )}
              <h2>Want similar results?</h2>
              <p>Book a free intro call — I'll walk through what worked here and whether it fits your account.</p>
            </div>
            <Link to="/contact" className="btn-primary">
              Book a call <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>
    </SiteLayout>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="case-study-meta-card">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Kpi({ kpi }: { kpi: ResultKPI }) {
  return (
    <div className="case-study-kpi-card">
      <strong>{kpi.value}</strong>
      <span>{kpi.label}</span>
    </div>
  );
}

function Story({ title, body, full }: { title: string; body: string; full?: boolean }) {
  return (
    <div className={`case-study-story-card${full ? " case-study-story-card--full" : ""}`}>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function MediaCard({ media }: { media: MediaItem }) {
  const framed = media.aspect && media.aspect !== "auto";
  return (
    <figure className="case-study-media-card">
      <div className="case-study-media-card__body">
        {media.type === "video" ? (
          <video src={media.url} controls preload="metadata" className={framed ? "cover" : undefined} />
        ) : (
          <OptimizedImage
            src={media.url}
            alt={media.caption ?? ""}
            widthHint={720}
            quality={68}
            sizes="(max-width: 768px) 100vw, 33vw"
            className={framed ? "cover" : undefined}
          />
        )}
      </div>
      {media.caption && <figcaption>{media.caption}</figcaption>}
    </figure>
  );
}

function StatCard({ stat }: { stat: StatImage }) {
  return (
    <figure className="case-study-media-card">
      <div className="case-study-media-card__body">
        <OptimizedImage
          src={stat.url}
          alt={stat.caption ?? ""}
          widthHint={800}
          quality={68}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      {stat.caption && <figcaption>{stat.caption}</figcaption>}
    </figure>
  );
}
