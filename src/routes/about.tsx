import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Reveal } from "@/components/site/Reveal";
import { useSection } from "@/lib/cms";
import heroPortrait from "@/assets/hero-portrait.jpg";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — Rao Hamza Saif" },
      { name: "description", content: "Performance marketer working with high-budget accounts across paid media, funnels, tracking and CRM." },
      { property: "og:title", content: "About — Rao Hamza Saif" },
      { property: "og:description", content: "The person behind the accounts." },
    ],
  }),
});

function AboutPage() {
  const { data: bio } = useSection("bio");
  const { data: hero } = useSection("hero");
  const { data: exp } = useSection("experience");
  const { data: proc } = useSection("process");
  const { data: stackData } = useSection("stack");
  const image = hero?.image_url || heroPortrait;

  return (
    <SiteLayout>
      <section className="container-x pt-14 pb-16 md:pt-24 md:pb-24">
        <div className="grid gap-14 md:grid-cols-[1.3fr_1fr] md:gap-16">
          <div>
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">About</p>
              <h1 className="mt-4 font-display text-5xl font-bold leading-[0.95] text-ink md:text-8xl">
                Media buyer, <span className="italic-purple">systems</span> guy.
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-8 max-w-xl text-lg text-body">{bio?.body}</p>
            </Reveal>
            <Reveal delay={280}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/case-studies" className="btn-secondary">See the work</Link>
                <Link to="/contact" className="btn-primary">Get in touch <ArrowUpRight className="h-4 w-4" /></Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={160}>
            <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-[28px] border border-border shadow-large">
              <img src={image} alt="Portrait" className="h-full w-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {exp && (
        <section className="container-x py-16 md:py-24">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Experience</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-ink md:text-6xl">A short <span className="italic-purple">timeline</span>.</h2>
          </Reveal>
          <ol className="mt-12 space-y-4">
            {exp.items.map((e, i) => (
              <Reveal key={`${e.year}-${i}`} delay={i * 60}>
                <li className="grid gap-2 rounded-[22px] border border-border bg-white p-6 md:grid-cols-[160px_1fr_1fr] md:items-center md:gap-6 md:p-8">
                  <span className="font-display text-sm font-semibold text-primary">{e.year}</span>
                  <span className="font-display text-xl font-bold text-ink">{e.role}</span>
                  <span className="text-body">{e.org}</span>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>
      )}

      {proc && (
        <section className="bg-dark-bg py-20 text-dark-fg md:py-28">
          <div className="container-x">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">How I work</p>
              <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-white md:text-6xl">
                Five stages, <span className="italic-purple">zero fluff</span>.
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-4 md:grid-cols-5">
              {proc.items.map((p, i) => (
                <Reveal key={`${p.step}-${i}`} delay={i * 60}>
                  <div className="h-full rounded-[22px] border border-white/10 bg-white/[0.03] p-6">
                    <p className="font-display text-sm text-primary">{p.step}</p>
                    <h3 className="mt-4 font-display text-xl font-bold text-white">{p.title}</h3>
                    <p className="mt-2 text-sm text-white/70">{p.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {stackData && (
        <section className="container-x py-20 md:py-28">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Skills & tools</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-ink md:text-6xl">
              The <span className="italic-purple">toolbox</span>.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stackData.items.map((g, i) => (
              <Reveal key={`${g.cat}-${i}`} delay={i * 60}>
                <div className="card-premium h-full p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">{g.cat}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {g.items.map((it) => (
                      <li key={it} className="rounded-full border border-border bg-secondary px-3 py-1.5 text-sm text-ink-soft">{it}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
