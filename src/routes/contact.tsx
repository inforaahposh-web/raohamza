import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Reveal } from "@/components/site/Reveal";
import { site } from "@/lib/site-data";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — Rao Hamza Saif" },
      { name: "description", content: "Book an intro call or send a brief. Response within 24 hours." },
      { property: "og:title", content: "Contact — Rao Hamza Saif" },
      { property: "og:description", content: "Let's talk about your paid growth." },
    ],
  }),
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: wire to Cloud when admin panel is added
    setSent(true);
  };

  return (
    <SiteLayout>
      <section className="container-x pt-14 pb-16 md:pt-24 md:pb-24">
        <div className="grid gap-14 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div>
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Contact</p>
              <h1 className="mt-4 font-display text-5xl font-bold leading-[0.95] text-ink md:text-8xl">
                Let's <span className="italic-purple">talk</span> numbers.
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 max-w-md text-lg text-body">
                Tell me a bit about the account, the offer and where you're stuck. I'll come back within a day with a candid take.
              </p>
            </Reveal>

            <div className="mt-10 space-y-4">
              <Info icon={<Mail className="h-5 w-5" />} label="Email" value={site.email} href={`mailto:${site.email}`} />
              <Info icon={<MessageCircle className="h-5 w-5" />} label="WhatsApp" value={site.whatsapp} href={`https://wa.me/${site.whatsapp.replace(/[^0-9]/g, "")}`} />
              <Info icon={<MapPin className="h-5 w-5" />} label="Location" value={site.location} />
              <Info icon={<Clock className="h-5 w-5" />} label="Working hours" value={site.hours} />
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {site.social.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-ink-soft hover:border-primary hover:text-primary">
                  {s.label} <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          <Reveal delay={140}>
            <form onSubmit={onSubmit} className="rounded-[28px] border border-border bg-white p-6 shadow-medium md:p-10">
              {sent ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft">
                    <CheckCircle2 className="h-7 w-7 text-primary" />
                  </span>
                  <p className="font-display text-2xl font-bold text-ink">Got it — talk soon.</p>
                  <p className="text-body">I'll respond within one business day.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  <Field name="name" label="Your name" required />
                  <Field name="email" type="email" label="Email" required />
                  <Field name="company" label="Company / brand" />
                  <Field name="budget" label="Monthly ad spend (approx.)" />
                  <div>
                    <label htmlFor="brief" className="mb-2 block text-sm font-semibold text-ink">Brief</label>
                    <textarea
                      id="brief" name="brief" rows={5} required
                      placeholder="Offer, target market, current numbers, where you're stuck…"
                      className="w-full resize-none rounded-2xl border border-border bg-secondary px-4 py-3 text-ink outline-none transition-colors focus:border-primary focus:bg-white"
                    />
                  </div>
                  <button type="submit" className="btn-primary mt-2 w-full justify-center">
                    Send brief <ArrowUpRight className="h-4 w-4" />
                  </button>
                  <p className="text-xs text-body-light">By submitting you agree to be contacted about your enquiry.</p>
                </div>
              )}
            </form>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}

function Info({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const inner = (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 transition-colors hover:border-primary">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-body-light">{label}</p>
        <p className="truncate font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href} target="_blank" rel="noreferrer">{inner}</a> : inner;
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-semibold text-ink">{label}{required && " *"}</label>
      <input
        id={name} name={name} type={type} required={required}
        className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-ink outline-none transition-colors focus:border-primary focus:bg-white"
      />
    </div>
  );
}
