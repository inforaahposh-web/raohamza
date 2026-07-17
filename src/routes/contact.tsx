import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight, Mail, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Layout";
import { Reveal } from "@/components/site/Reveal";
import { useSection } from "@/lib/cms";
import {
  buildLeadTelegramText,
  buildTelegramAppUrl,
  buildTelegramChatUrl,
  openTelegramChat,
  submitContactLead,
} from "@/lib/submit-lead";
import { site as fallbackSite } from "@/lib/site-data";

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
  const { data: siteData } = useSection("site");
  const site = { ...fallbackSite, ...siteData, telegram: siteData?.telegram ?? fallbackSite.telegram };
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      company: String(fd.get("company") ?? ""),
      budget: String(fd.get("budget") ?? ""),
      brief: String(fd.get("brief") ?? ""),
    };
    setSending(true);
    try {
      const result = await submitContactLead({
        data: payload,
        telegramUsername: site.telegram,
        notifyEmail: site.email,
      });

      const text = buildLeadTelegramText(payload);
      const telegramUrl =
        result.telegramUrl || buildTelegramChatUrl(site.telegram || "", text);
      const telegramAppUrl =
        result.telegramAppUrl || buildTelegramAppUrl(site.telegram || "", text);

      if (telegramUrl || telegramAppUrl) {
        try {
          if (telegramUrl) sessionStorage.setItem("lead_telegram_url", telegramUrl);
          if (telegramAppUrl) sessionStorage.setItem("lead_telegram_app_url", telegramAppUrl);
        } catch {
          /* ignore */
        }
        // Open app (mobile) or https tab (desktop) — never leave a blank/failed tab
        openTelegramChat(site.telegram || "", text);
      }

      window.location.assign("/thank-you");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err && "message" in err
            ? String((err as { message: unknown }).message)
            : "Could not submit. Please try again.";
      toast.error(msg);
      setSending(false);
    }
  };

  const telegramUser = (site.telegram || "").replace(/^@/, "").trim();

  return (
    <SiteLayout>
      <section className="container-x overflow-x-hidden pt-14 pb-28 md:pt-24 md:pb-24">
        <div className="grid min-w-0 gap-14 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="min-w-0">
            <Reveal immediate>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Contact</p>
              <h1 className="mt-4 break-words font-display text-4xl font-bold leading-[0.95] text-ink sm:text-5xl md:text-8xl">
                Let's <span className="italic-purple">talk</span> numbers.
              </h1>
            </Reveal>
            <Reveal immediate delay={120}>
              <p className="mt-6 max-w-md text-base text-body sm:text-lg">
                Tell me a bit about the account, the offer and where you're stuck. I'll come back within a day with a candid take.
              </p>
            </Reveal>

            <div className="mt-10 w-full min-w-0 space-y-4">
              <Info icon={<Mail className="h-5 w-5" />} label="Email" value={site.email} href={`mailto:${site.email}`} />
              <Info icon={<MessageCircle className="h-5 w-5" />} label="WhatsApp" value={site.whatsapp} href={`https://wa.me/${site.whatsapp.replace(/[^0-9]/g, "")}`} />
              {telegramUser ? (
                <Info
                  icon={<Send className="h-5 w-5" />}
                  label="Telegram"
                  value={`@${telegramUser}`}
                  href={`https://t.me/${telegramUser}`}
                />
              ) : null}
              <Info icon={<MapPin className="h-5 w-5" />} label="Location" value={site.location} />
              <Info icon={<Clock className="h-5 w-5" />} label="Working hours" value={site.hours} />
            </div>

            <div className="mt-10 flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
              {site.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-1 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium text-ink-soft hover:border-primary hover:text-primary sm:w-auto sm:justify-start"
                >
                  {s.label} <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                </a>
              ))}
            </div>
          </div>

          <Reveal immediate delay={140}>
            <form
              onSubmit={onSubmit}
              className="w-full max-w-full min-w-0 rounded-[28px] border border-border bg-white p-5 shadow-medium sm:p-6 md:p-10"
            >
              <div className="grid min-w-0 gap-4">
                <Field name="name" label="Your name" required />
                <Field name="email" type="email" label="Email" required />
                <Field name="company" label="Company / brand" />
                <Field name="budget" label="Monthly ad spend (approx.)" />
                <div className="min-w-0">
                  <label htmlFor="brief" className="mb-2 block text-sm font-semibold text-ink">Brief</label>
                  <textarea
                    id="brief" name="brief" rows={5} required
                    placeholder="Offer, target market, current numbers, where you're stuck…"
                    className="w-full max-w-full resize-none rounded-2xl border border-border bg-secondary px-4 py-3 text-ink outline-none transition-colors focus:border-primary focus:bg-white"
                  />
                </div>
                <button type="submit" disabled={sending} className="btn-primary mt-2 w-full justify-center">
                  {sending ? "Sending…" : "Send brief"} <ArrowUpRight className="h-4 w-4" />
                </button>
                <p className="text-xs text-body-light">
                  After submit, your lead is saved and Telegram opens so you can message me directly.
                </p>
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}

function Info({ icon, label, value, href }: { icon: ReactNode; label: string; value: string; href?: string }) {
  const inner = (
    <div className="flex w-full min-w-0 items-start gap-3 rounded-2xl border border-border bg-white p-3.5 transition-colors hover:border-primary sm:items-center sm:gap-4 sm:p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary sm:h-11 sm:w-11">{icon}</span>
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="text-xs uppercase tracking-widest text-body-light">{label}</p>
        <p className="break-words font-semibold text-ink [overflow-wrap:anywhere] sm:truncate">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="block w-full min-w-0 max-w-full">
      {inner}
    </a>
  ) : (
    inner
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div className="min-w-0">
      <label htmlFor={name} className="mb-2 block text-sm font-semibold text-ink">{label}{required && " *"}</label>
      <input
        id={name} name={name} type={type} required={required}
        className="w-full max-w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-ink outline-none transition-colors focus:border-primary focus:bg-white"
      />
    </div>
  );
}
