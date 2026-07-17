import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

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

function supabaseServer() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured on the server");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function loadSiteContact() {
  const supabase = supabaseServer();
  const { data } = await supabase.from("site_settings").select("data").eq("key", "site").maybeSingle();
  const site = (data?.data ?? {}) as { email?: string; whatsapp?: string; name?: string };
  return {
    email: site.email || process.env.LEAD_NOTIFY_EMAIL || "",
    whatsapp: (site.whatsapp || process.env.LEAD_NOTIFY_WHATSAPP || "").replace(/[^\d+]/g, ""),
  };
}

async function saveLead(lead: ContactLead) {
  const supabase = supabaseServer();

  // Preferred: SECURITY DEFINER RPC (works with publishable key after SQL is run)
  const { error: rpcError } = await supabase.rpc("submit_contact_lead", { p_lead: lead as never });
  if (!rpcError) return;

  // Fallback: direct upsert (needs service role, or admin RLS)
  const { data } = await supabase.from("site_settings").select("data").eq("key", "contact_leads").maybeSingle();
  const existing = (data?.data as { items?: ContactLead[] } | null)?.items;
  const items = Array.isArray(existing) ? existing : [];
  const next = [lead, ...items].slice(0, 500);
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "contact_leads", data: { items: next } as never }, { onConflict: "key" });

  if (error) {
    const rpcMsg = rpcError.message || "";
    throw new Error(
      /function|does not exist|PGRST202/i.test(rpcMsg)
        ? "Lead SQL missing — run submit_contact_lead SQL in Supabase, then try again"
        : error.message || rpcMsg || "Could not save lead",
    );
  }
}

function leadMessage(lead: ContactLead) {
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

/** WhatsApp message TO YOU only (CallMeBot). Visitor never opens WhatsApp. */
async function notifyWhatsApp(phoneDigits: string, text: string) {
  const apiKey = process.env.CALLMEBOT_APIKEY;
  if (!apiKey) return { ok: false as const, skipped: true as const, reason: "CALLMEBOT_APIKEY not set" };
  const phone = phoneDigits.replace(/[^\d]/g, "");
  if (!phone) return { ok: false as const, skipped: true as const, reason: "No WhatsApp in site settings" };

  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  const body = await res.text();
  if (!res.ok) return { ok: false as const, skipped: false as const, error: body || res.statusText };
  return { ok: true as const, skipped: false as const };
}

async function notifyEmail(to: string, lead: ContactLead) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false as const, skipped: true as const, reason: "RESEND_API_KEY not set" };
  if (!to) return { ok: false as const, skipped: true as const, reason: "No email in site settings" };

  const from = process.env.LEAD_FROM_EMAIL || "onboarding@resend.dev";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `New lead: ${lead.name}`,
      text: leadMessage(lead),
    }),
  });
  const body = await res.text();
  if (!res.ok) return { ok: false as const, skipped: false as const, error: body || res.statusText };
  return { ok: true as const, skipped: false as const };
}

export const submitContactLead = createServerFn({ method: "POST" })
  .inputValidator((data: LeadPayload) => {
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
  })
  .handler(async ({ data }) => {
    const lead: ContactLead = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      source: "contact",
    };

    await saveLead(lead);

    const site = await loadSiteContact();
    const text = leadMessage(lead);
    const [whatsapp, email] = await Promise.all([
      notifyWhatsApp(site.whatsapp, text),
      notifyEmail(site.email, lead),
    ]);

    return { ok: true as const, leadId: lead.id, notifications: { whatsapp, email } };
  });
