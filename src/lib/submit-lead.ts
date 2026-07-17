import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type LeadPayload = {
  name: string;
  email: string;
  company?: string;
  budget?: string;
  brief: string;
};

export type ContactLead = LeadPayload & {
  id: string;
  created_at: string;
  source: string;
};

export function buildLeadTelegramText(lead: LeadPayload) {
  return [
    "Hi! I submitted a brief on your website.",
    "",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    lead.company ? `Company: ${lead.company}` : null,
    lead.budget ? `Budget: ${lead.budget}` : null,
    "",
    `Brief: ${lead.brief}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function normalizeTelegramUsername(username: string) {
  return username.replace(/^@/, "").trim();
}

/** https://t.me — works on desktop / when the app is not installed */
export function buildTelegramChatUrl(username: string, text: string) {
  const user = normalizeTelegramUsername(username);
  if (!user) return "";
  return `https://t.me/${user}?text=${encodeURIComponent(text)}`;
}

/** tg:// deep link — opens the Telegram app when installed */
export function buildTelegramAppUrl(username: string, text: string) {
  const user = normalizeTelegramUsername(username);
  if (!user) return "";
  return `tg://resolve?domain=${encodeURIComponent(user)}&text=${encodeURIComponent(text)}`;
}

export function isMobileTelegramClient() {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    navigator.userAgent,
  );
}

/**
 * Open Telegram without leaving a dead browser tab on mobile.
 * Mobile: fire tg:// via hidden iframe so the page can still navigate to thank-you.
 * Desktop: https://t.me in a new tab.
 * Thank-you page also tries same-window tg:// for stronger mobile app handoff.
 */
export function openTelegramChat(username: string, text: string) {
  const appUrl = buildTelegramAppUrl(username, text);
  const webUrl = buildTelegramChatUrl(username, text);
  if (!appUrl && !webUrl) return;

  if (typeof window === "undefined") return;

  if (isMobileTelegramClient() && appUrl) {
    try {
      const iframe = document.createElement("iframe");
      iframe.setAttribute("aria-hidden", "true");
      iframe.style.cssText = "display:none;width:0;height:0;border:0;position:absolute";
      iframe.src = appUrl;
      document.body.appendChild(iframe);
      window.setTimeout(() => iframe.remove(), 2000);
    } catch {
      /* ignore */
    }
    return;
  }

  if (webUrl) {
    window.open(webUrl, "_blank", "noopener,noreferrer");
  }
}

/** Click handler for thank-you / CTA: app first, then https fallback */
export function handleTelegramOpenClick(
  event: { preventDefault: () => void },
  opts: { appUrl?: string; webUrl?: string },
) {
  const { appUrl = "", webUrl = "" } = opts;
  if (!appUrl && !webUrl) return;

  if (isMobileTelegramClient() && appUrl) {
    event.preventDefault();
    const started = Date.now();
    window.location.href = appUrl;
    window.setTimeout(() => {
      // If the app did not take over, fall back to https in the same window
      if (!document.hidden && Date.now() - started < 2800 && webUrl) {
        window.location.href = webUrl;
      }
    }, 1400);
    return;
  }

  if (webUrl) {
    event.preventDefault();
    window.open(webUrl, "_blank", "noopener,noreferrer");
  }
}

function leadEmailBody(lead: ContactLead) {
  return [
    "New website lead",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    lead.company ? `Company: ${lead.company}` : null,
    lead.budget ? `Budget: ${lead.budget}` : null,
    `Brief: ${lead.brief}`,
    `Time: ${new Date(lead.created_at).toLocaleString()}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function readServerEnv(name: string): string | undefined {
  if (typeof process !== "undefined" && process.env?.[name]) return process.env[name];
  try {
    const vite = (import.meta as { env?: Record<string, string | undefined> }).env;
    return vite?.[name];
  } catch {
    return undefined;
  }
}

/** Server-only: email you when a lead is saved (Resend). */
export const notifyLeadEmail = createServerFn({ method: "POST" })
  .inputValidator((data: ContactLead & { notifyEmail?: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = readServerEnv("RESEND_API_KEY");
    if (!apiKey) return { ok: false as const, skipped: true as const, reason: "RESEND_API_KEY not set" };

    const to = (data.notifyEmail || readServerEnv("LEAD_NOTIFY_EMAIL") || "").trim();
    if (!to) return { ok: false as const, skipped: true as const, reason: "No notify email" };

    const from = readServerEnv("LEAD_FROM_EMAIL") || "onboarding@resend.dev";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New lead: ${data.name}`,
        text: leadEmailBody(data),
      }),
    });
    const body = await res.text();
    if (!res.ok) return { ok: false as const, skipped: false as const, error: body || res.statusText };
    return { ok: true as const, skipped: false as const };
  });

function normalizePayload(data: LeadPayload): LeadPayload {
  const name = String(data?.name ?? "").trim();
  const email = String(data?.email ?? "").trim();
  const brief = String(data?.brief ?? "").trim();
  if (!name || !email || !brief) throw new Error("Name, email and brief are required");
  return {
    name,
    email,
    company: String(data?.company ?? "").trim(),
    budget: String(data?.budget ?? "").trim(),
    brief,
  };
}

/**
 * Save lead in browser (uses VITE_ Supabase keys), email you via server, open Telegram on client.
 */
export async function submitContactLead(input: {
  data: LeadPayload;
  telegramUsername?: string;
  notifyEmail?: string;
}) {
  const data = normalizePayload(input.data);
  const lead: ContactLead = {
    ...data,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    source: "contact",
  };

  const { error: rpcError } = await supabase.rpc("submit_contact_lead", {
    p_lead: lead as unknown as Json,
  });
  if (rpcError) {
    const msg = rpcError.message || "";
    if (/function|does not exist|PGRST202/i.test(msg)) {
      throw new Error("Lead SQL missing — run submit_contact_lead SQL in Supabase, then try again");
    }
    throw new Error(msg || "Could not save lead");
  }

  // Email is best-effort — don't block Telegram / thank-you
  let emailResult: { ok: boolean; skipped?: boolean; reason?: string; error?: string } = {
    ok: false,
    skipped: true,
  };
  try {
    emailResult = await notifyLeadEmail({
      data: { ...lead, notifyEmail: input.notifyEmail },
    });
  } catch {
    emailResult = { ok: false, skipped: false, error: "Email notify failed" };
  }

  const text = buildLeadTelegramText(data);
  const telegramUsername = normalizeTelegramUsername(input.telegramUsername || "");
  const telegramUrl = buildTelegramChatUrl(telegramUsername, text);
  const telegramAppUrl = buildTelegramAppUrl(telegramUsername, text);

  return {
    ok: true as const,
    leadId: lead.id,
    telegramUrl,
    telegramAppUrl,
    telegramUsername,
    notifications: { email: emailResult },
  };
}
