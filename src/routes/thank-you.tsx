import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ArrowUpRight, Send } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { handleTelegramOpenClick, isMobileTelegramClient } from "@/lib/submit-lead";

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
  const [telegramAppUrl, setTelegramAppUrl] = useState("");

  useEffect(() => {
    let appUrl = "";
    let webUrl = "";
    try {
      webUrl = sessionStorage.getItem("lead_telegram_url") || "";
      appUrl = sessionStorage.getItem("lead_telegram_app_url") || "";
      if (webUrl) {
        setTelegramUrl(webUrl);
        sessionStorage.removeItem("lead_telegram_url");
      }
      if (appUrl) {
        setTelegramAppUrl(appUrl);
        sessionStorage.removeItem("lead_telegram_app_url");
      }
    } catch {
      /* ignore */
    }

    // On mobile, try opening the Telegram app once (no new tab)
    if (isMobileTelegramClient() && appUrl) {
      try {
        window.location.href = appUrl;
      } catch {
        /* ignore */
      }
    }
  }, []);

  const hasTelegram = Boolean(telegramAppUrl || telegramUrl);

  return (
    <SiteLayout>
      <section className="container-x flex min-h-[70vh] items-center justify-center overflow-x-hidden py-20">
        <div className="w-full max-w-lg min-w-0 px-1 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-soft">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold text-ink md:text-6xl">Thank you</h1>
          <p className="mt-4 text-lg text-body">
            Your brief was submitted. I'll review it and get back to you soon.
          </p>
          {hasTelegram ? (
            <a
              href={telegramAppUrl || telegramUrl}
              rel="noreferrer"
              className="btn-primary mt-8 inline-flex max-w-full"
              onClick={(e) =>
                handleTelegramOpenClick(e, { appUrl: telegramAppUrl, webUrl: telegramUrl })
              }
            >
              <Send className="h-4 w-4 shrink-0" /> Open Telegram &amp; send message
            </a>
          ) : null}
          <div className="mt-6 flex flex-col flex-wrap justify-center gap-3 sm:flex-row">
            <Link to="/" className="btn-secondary w-full justify-center sm:w-auto">Back to home</Link>
            <Link to="/case-studies" className="btn-primary w-full justify-center sm:w-auto">
              See case studies <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
