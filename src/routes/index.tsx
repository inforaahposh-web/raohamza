import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles, CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { Reveal, Counter } from "@/components/site/Reveal";
import { useSection, useCaseStudies, cleanSlug } from "@/lib/cms";
import heroPortrait from "@/assets/hero-portrait.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <HeroSection />
      <BioStrip />
      <StatsSection />
      <ServicesSection />
      <StackSection />
      <CaseStudiesSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </SiteLayout>
  );
}

function HeroSection() {
  const { data: hero } = useSection("hero");
  const { data: site } = useSection("site");
  const { data: stats } = useSection("stats");
  if (!hero || !site) return null;

  const heroImage = hero.image_url || heroPortrait;
  const topStat = stats?.items[0];
  const roasStat = stats?.items[2];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-60" aria-hidden />
      <div className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-primary/25 blur-3xl animate-blob" aria-hidden />
      <div className="pointer-events-none absolute top-40 -right-24 h-[380px] w-[380px] rounded-full bg-[#8b5cf6]/20 blur-3xl animate-blob" style={{ animationDelay: "3s" }} aria-hidden />

      <div className="container-x relative grid gap-10 py-16 md:grid-cols-[1.35fr_1fr] md:gap-16 md:py-28">
        <div className="flex flex-col justify-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-1.5 text-xs font-medium text-ink-soft shadow-soft backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              {hero.eyebrow}
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-[11vw] leading-[0.95] tracking-tight text-ink sm:text-6xl md:text-[5.5rem] lg:text-[6.5rem]">
              {hero.headingLead}{" "}
              <span className="italic-purple">{hero.headingItalic}</span>
              <br />
              {hero.headingTail}
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-lg text-body md:text-xl">{hero.sub}</p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/contact" className="btn-primary">
                Book a call <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link to="/case-studies" className="btn-secondary">
                See case studies
              </Link>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <p className="text-sm font-medium text-body-light">Elsewhere:</p>
              {site.social.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                  className="text-sm font-medium text-ink-soft underline-offset-4 hover:text-primary hover:underline">
                  {s.label}
                </a>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-md">
            <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-primary/40 via-transparent to-[#8b5cf6]/30 blur-2xl" aria-hidden />
            <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-border bg-white shadow-large">
              <img src={heroImage} alt={`${site.name} portrait`} className="h-full w-full object-cover" />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-soft backdrop-blur">
                <div>
                  <p className="font-display text-sm font-bold text-ink">{site.name}</p>
                  <p className="text-xs text-body-light">{site.role}</p>
                </div>
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </div>
            {topStat && (
              <div className="absolute -left-6 top-8 rounded-2xl bg-dark-bg px-4 py-3 text-white shadow-large">
                <p className="font-display text-2xl font-bold leading-none">${topStat.value}{topStat.suffix}</p>
                <p className="mt-1 text-xs text-white/60">{topStat.label.toLowerCase()}</p>
              </div>
            )}
            {roasStat && (
              <div className="absolute -right-4 bottom-24 rounded-2xl bg-primary px-4 py-3 text-white shadow-glow">
                <p className="font-display text-2xl font-bold leading-none">{roasStat.value}{roasStat.suffix}</p>
                <p className="mt-1 text-xs text-white/80">{roasStat.label.toLowerCase()}</p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BioStrip() {
  const { data: bio } = useSection("bio");
  if (!bio) return null;
  const parts = bio.body.split("intersection of");
  return (
    <section className="border-y border-border bg-secondary">
      <div className="container-x py-14 md:py-20">
        <div className="grid gap-8 md:grid-cols-[1fr_2fr] md:gap-16">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">{bio.title}</p>
          </Reveal>
          <Reveal delay={100}>
            <p className="font-display text-2xl leading-snug text-ink md:text-4xl">
              {parts.length > 1 ? (<>{parts[0]}<span className="italic-purple">intersection of</span>{parts[1]}</>) : bio.body}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const { data } = useSection("stats");
  if (!data) return null;
  return (
    <section className="container-x py-20 md:py-28">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {data.items.map((s, i) => {
          const numeric = parseFloat(s.value);
          return (
            <Reveal key={`${s.label}-${i}`} delay={i * 80}>
              <div className="card-premium p-6 md:p-8">
                <p className="font-display text-4xl font-bold tracking-tight text-ink md:text-6xl">
                  {Number.isFinite(numeric) ? <Counter to={numeric} suffix={s.suffix} /> : <>{s.value}{s.suffix}</>}
                </p>
                <p className="mt-2 text-sm text-body-light md:text-base">{s.label}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function ServicesSection() {
  const { data } = useSection("services");
  if (!data) return null;
  return (
    <section className="container-x py-20 md:py-28">
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:mb-16 md:flex-row md:items-end">
        <Reveal>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Services</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink md:text-6xl">
              What I <span className="italic-purple">actually</span> do.
            </h2>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <p className="max-w-md text-body">Full-funnel performance marketing — not siloed. Media buying, tracking, funnels and CRM ship as one system.</p>
        </Reveal>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.items.map((s, i) => (
          <Reveal key={`${s.title}-${i}`} delay={i * 60}>
            <div className="card-premium group h-full p-7">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-medium text-body-light">{s.tag}</span>
                <ArrowUpRight className="h-5 w-5 text-body-light transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <h3 className="mt-8 font-display text-2xl font-bold text-ink">{s.title}</h3>
              <p className="mt-3 text-body">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function StackSection() {
  const { data } = useSection("stack");
  if (!data) return null;
  return (
    <section className="bg-dark-bg py-20 text-dark-fg md:py-28">
      <div className="container-x">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">The stack I run on</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight text-white md:text-6xl">
            Platforms, pixels & <span className="italic-purple">pipes</span>.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((group, i) => (
            <Reveal key={`${group.cat}-${i}`} delay={i * 60}>
              <div className="h-full rounded-[22px] border border-white/10 bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.06]">
                <p className="font-display text-sm font-semibold uppercase tracking-widest text-primary">{group.cat}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {group.items.map((it) => (
                    <li key={it} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/85">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudiesSection() {
  const { data: cases, isLoading } = useCaseStudies();
  const published = (cases ?? []).filter((c) => c.published);

  if (isLoading) return null;
  if (published.length === 0) return null;

  return (
    <section className="container-x py-20 md:py-28">
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:mb-16 md:flex-row md:items-end">
        <Reveal>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Case studies</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink md:text-6xl">
              Real <span className="italic-purple">accounts</span>, real numbers.
            </h2>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Link to="/case-studies" className="btn-secondary">All case studies <ArrowUpRight className="h-4 w-4" /></Link>
        </Reveal>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {published.slice(0, 6).map((cs, i) => (
          <Reveal key={cs.id} delay={i * 40}>
            <Link
              to="/case-studies/$slug"
              params={{ slug: cleanSlug(cs.slug) }}
              className="card-premium group flex h-full flex-col justify-between overflow-hidden p-0"
            >
              {cs.cover_image_url && (
                <div className="aspect-[16/9] w-full overflow-hidden bg-secondary">
                  <img src={cs.cover_image_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between p-7">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft font-display font-bold text-primary">
                      {(cs.industry ?? cs.title).charAt(0)}
                    </span>
                    <h3 className="font-display text-xl font-bold text-ink line-clamp-2">{cs.title}</h3>
                  </div>
                  {cs.summary && <p className="mt-4 text-body line-clamp-3">{cs.summary}</p>}
                </div>
                <div className="mt-8 flex items-end justify-between border-t border-border pt-5">
                  <div>
                    <p className="font-display text-2xl font-bold text-ink md:text-3xl">{cs.results[0]?.value ?? "—"}</p>
                    <p className="text-xs text-body-light">{cs.results[0]?.label ?? cs.industry ?? ""}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition-all group-hover:bg-primary">
                    Case study <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { data } = useSection("testimonials");
  if (!data) return null;
  return (
    <section className="bg-secondary py-20 md:py-28">
      <div className="container-x">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Kind words</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold text-ink md:text-6xl">
            From <span className="italic-purple">operators</span> who ship.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {data.items.map((t, i) => (
            <Reveal key={`${t.name}-${i}`} delay={i * 80}>
              <figure className="h-full rounded-[22px] border border-border bg-white p-7 shadow-soft">
                <blockquote className="font-display text-xl leading-snug text-ink">"{t.quote}"</blockquote>
                <figcaption className="mt-6 border-t border-border pt-4">
                  <p className="font-semibold text-ink">{t.name}</p>
                  <p className="text-sm text-body-light">{t.title}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const { data } = useSection("faqs");
  if (!data) return null;
  return (
    <section className="container-x py-20 md:py-28">
      <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
        <Reveal>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-ink md:text-6xl">
              Quick <span className="italic-purple">answers</span>.
            </h2>
            <p className="mt-6 text-body">Have one that's not here? Drop me a line — I answer everything within a day.</p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <ul className="divide-y divide-border rounded-[22px] border border-border bg-white">
            {data.items.map((f, i) => (
              <li key={`${f.q}-${i}`}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-display text-lg font-semibold text-ink">{f.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-primary transition-transform ${open === i ? "rotate-180" : ""}`} />
                </button>
                <div className="grid overflow-hidden px-6 transition-all duration-300" style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}>
                  <div className="min-h-0">
                    <p className="pb-5 text-body">{f.a}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="container-x pb-8">
      <div className="relative overflow-hidden rounded-[28px] bg-primary p-10 text-white shadow-glow md:p-16">
        <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="absolute -bottom-16 -left-10 h-72 w-72 rounded-full bg-black/20 blur-3xl" aria-hidden />
        <div className="relative grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/70">Ready when you are</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-white md:text-6xl">
              Let's <em className="not-italic underline decoration-white/40 underline-offset-8">actually</em> scale it.
            </h2>
            <ul className="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
              {["Free 30-min audit", "No lock-in trial month", "Direct access, no account managers"].map((x) => (
                <li key={x} className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> {x}</li>
              ))}
            </ul>
          </div>
          <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-base font-semibold text-primary transition-transform hover:-translate-y-1">
            Book intro call <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
