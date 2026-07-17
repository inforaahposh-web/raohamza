import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ArrowUpRight, Send } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/thank-you")({
  component: ThankYouPage,
  head: () => ({
    meta: [
      { title: "Thank you — Rao Hamza Saif" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ThankYouPage() {
  const [telegramUrl, setTelegramUrl] = useState("");

  useEffect(() => {
    try {
      const url = sessionStorage.getItem("lead_telegram_url") || "";
      if (url) {
        setTelegramUrl(url);
        sessionStorage.removeItem("lead_telegram_url");
      }
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <SiteLayout>
      <section className="container-x flex min-h-[70vh] items-center justify-center py-20">
        <div className="max-w-lg text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-soft">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold text-ink md:text-6xl">Thank you</h1>
          <p className="mt-4 text-lg text-body">
            Your brief was submitted. I'll review it and get back to you soon.
          </p>
          {telegramUrl ? (
            <a href={telegramUrl} target="_blank" rel="noreferrer" className="btn-primary mt-8 inline-flex">
              <Send className="h-4 w-4" /> Open Telegram &amp; send message
            </a>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn-secondary">Back to home</Link>
            <Link to="/case-studies" className="btn-primary">
              See case studies <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
