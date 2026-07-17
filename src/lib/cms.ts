// CMS hooks — read/write for site_settings + case_studies via Supabase.
// Falls back to static defaults from site-data.ts when the DB is empty or loading.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import * as defaults from "./site-data";

export type SocialLink = { label: string; href: string };
export type SiteInfo = {
  name: string; role: string; tagline: string; email: string; whatsapp: string;
  /** Telegram username for lead form redirect (without @) */
  telegram: string;
  location: string; hours: string; social: SocialLink[];
};
export type HeroContent = {
  eyebrow: string; headingLead: string; headingItalic: string; headingTail: string; sub: string;
  image_url: string | null; avatar_url: string | null;
};
export type BioContent = { title: string; body: string };
export type FooterNavLink = { label: string; to: string };
export type FooterContent = {
  ctaEyebrow: string;
  ctaLine1: string;
  ctaLine2Prefix: string;
  ctaHighlight: string;
  ctaLine2Suffix: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  navLabel: string;
  navLinks: FooterNavLink[];
  socialLabel: string;
  social: SocialLink[];
  location: string;
  hours: string;
  bottomTagline: string;
};
export type StatItem = { value: string; suffix: string; label: string };
export type ServiceItem = { tag: string; title: string; desc: string };
export type StackGroup = { cat: string; items: string[] };
export type IndustryItem = { slug: string; name: string; short: string; metric: string; metricLabel: string };
export type TestimonialItem = { quote: string; name: string; title: string };
export type FaqItem = { q: string; a: string };
export type ExperienceItem = { year: string; role: string; org: string };
export type ProcessItem = { step: string; title: string; body: string };

export type MediaAspect = "auto" | "1:1" | "4:5" | "9:16" | "16:9" | "3:4";
export type MediaItem = { url: string; type: "image" | "video"; caption?: string; aspect?: MediaAspect };
export type StatImage = { url: string; caption?: string };
export type ResultKPI = { label: string; value: string };

export const MEDIA_ASPECT_OPTIONS: { value: MediaAspect; label: string }[] = [
  { value: "auto", label: "Original (auto)" },
  { value: "1:1", label: "Square 1:1" },
  { value: "4:5", label: "Portrait 4:5" },
  { value: "3:4", label: "Portrait 3:4" },
  { value: "9:16", label: "Story 9:16" },
  { value: "16:9", label: "Landscape 16:9" },
];

export function mediaAspectClass(aspect?: MediaAspect, type: "image" | "video" = "image"): string {
  const base = type === "video" ? "w-full bg-black" : "w-full";
  switch (aspect) {
    case "1:1": return `${base} aspect-square object-cover`;
    case "4:5": return `${base} aspect-[4/5] object-cover`;
    case "3:4": return `${base} aspect-[3/4] object-cover`;
    case "9:16": return `${base} aspect-[9/16] object-cover`;
    case "16:9": return `${base} aspect-video object-cover`;
    default: return `${base} h-auto max-h-[85vh] object-contain`;
  }
}

function parseJsonField<T>(val: unknown, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") {
    try { return JSON.parse(val) as T; } catch { return fallback; }
  }
  return val as T;
}

export function normalizeCaseStudy(row: Record<string, unknown>): CaseStudyRow {
  const results = parseJsonField<ResultKPI[]>(row.results, []);
  const adCreatives = parseJsonField<MediaItem[]>(row.ad_creatives, []).map((m) => ({
    ...m,
    aspect: m.aspect ?? "auto",
  }));
  const statImages = parseJsonField<StatImage[]>(row.campaign_stat_images, []);
  const platforms = Array.isArray(row.platforms) ? row.platforms as string[] : parseJsonField<string[]>(row.platforms, []);
  const tags = Array.isArray(row.tags) ? row.tags as string[] : parseJsonField<string[]>(row.tags, []);

  return {
    id: String(row.id ?? ""),
    slug: slugify(String(row.slug ?? "")),
    title: String(row.title ?? ""),
    industry: row.industry ? String(row.industry) : null,
    client: row.client ? String(row.client) : null,
    country: row.country ? String(row.country) : null,
    duration: row.duration ? String(row.duration) : null,
    platforms,
    summary: row.summary ? String(row.summary) : null,
    tags,
    results: Array.isArray(results) ? results : [],
    challenge: row.challenge ? String(row.challenge) : null,
    goal: row.goal ? String(row.goal) : null,
    strategy: row.strategy ? String(row.strategy) : null,
    outcome: row.outcome ? String(row.outcome) : null,
    funnel_html: row.funnel_html ? String(row.funnel_html) : null,
    ad_creatives: adCreatives,
    campaign_stat_images: statImages,
    cover_image_url: row.cover_image_url ? String(row.cover_image_url) : null,
    sort_order: Number(row.sort_order ?? 0),
    published: row.published !== false,
  };
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function cleanSlug(raw: string): string {
  try {
    return slugify(decodeURIComponent(raw));
  } catch {
    return slugify(raw);
  }
}

export type CaseStudyRow = {
  id: string;
  slug: string;
  title: string;
  industry: string | null;
  client: string | null;
  country: string | null;
  duration: string | null;
  platforms: string[];
  summary: string | null;
  tags: string[];
  results: ResultKPI[];
  challenge: string | null;
  goal: string | null;
  strategy: string | null;
  outcome: string | null;
  funnel_html: string | null;
  ad_creatives: MediaItem[];
  campaign_stat_images: StatImage[];
  cover_image_url: string | null;
  sort_order: number;
  published: boolean;
};

// ---------- Defaults derived from site-data.ts ----------
const D = {
  site: {
    name: defaults.site.name, role: defaults.site.role, tagline: defaults.site.tagline,
    email: defaults.site.email, whatsapp: defaults.site.whatsapp, telegram: defaults.site.telegram || "",
    location: defaults.site.location,
    hours: defaults.site.hours, social: [...defaults.site.social],
  } as SiteInfo,
  hero: {
    eyebrow: defaults.hero.eyebrow, headingLead: defaults.hero.headingLead,
    headingItalic: defaults.hero.headingItalic, headingTail: defaults.hero.headingTail,
    sub: defaults.hero.sub, image_url: null, avatar_url: null,
  } as HeroContent,
  bio: { title: defaults.bio.title, body: defaults.bio.body } as BioContent,
  stats: defaults.stats.map((s) => ({ value: String(s.value), suffix: s.suffix, label: s.label })) as StatItem[],
  services: defaults.services.map((s) => ({ tag: s.tag, title: s.title, desc: s.desc })) as ServiceItem[],
  stack: defaults.stack.map((s) => ({ cat: s.cat, items: [...s.items] })) as StackGroup[],
  industries: defaults.industries.map((i) => ({ ...i })) as IndustryItem[],
  testimonials: defaults.testimonials.map((t) => ({ ...t })) as TestimonialItem[],
  faqs: defaults.faqs.map((f) => ({ ...f })) as FaqItem[],
  experience: defaults.experience.map((e) => ({ ...e })) as ExperienceItem[],
  process: defaults.process.map((p) => ({ ...p })) as ProcessItem[],
  avatar_messages: [...defaults.avatarMessages],
  footer: {
    ctaEyebrow: defaults.footer.ctaEyebrow,
    ctaLine1: defaults.footer.ctaLine1,
    ctaLine2Prefix: defaults.footer.ctaLine2Prefix,
    ctaHighlight: defaults.footer.ctaHighlight,
    ctaLine2Suffix: defaults.footer.ctaLine2Suffix,
    ctaButtonText: defaults.footer.ctaButtonText,
    ctaButtonLink: defaults.footer.ctaButtonLink,
    navLabel: defaults.footer.navLabel,
    navLinks: defaults.footer.navLinks.map((n) => ({ ...n })),
    socialLabel: defaults.footer.socialLabel,
    social: defaults.footer.social.map((s) => ({ ...s })),
    location: defaults.footer.location,
    hours: defaults.footer.hours,
    bottomTagline: defaults.footer.bottomTagline,
  } as FooterContent,
};

type SectionMap = {
  site: SiteInfo;
  hero: HeroContent;
  bio: BioContent;
  stats: { items: StatItem[] };
  services: { items: ServiceItem[] };
  stack: { items: StackGroup[] };
  industries: { items: IndustryItem[] };
  testimonials: { items: TestimonialItem[] };
  faqs: { items: FaqItem[] };
  experience: { items: ExperienceItem[] };
  process: { items: ProcessItem[] };
  avatar_messages: { items: string[] };
  footer: FooterContent;
};

export const DEFAULTS: SectionMap = {
  site: D.site,
  hero: D.hero,
  bio: D.bio,
  stats: { items: D.stats },
  services: { items: D.services },
  stack: { items: D.stack },
  industries: { items: D.industries },
  testimonials: { items: D.testimonials },
  faqs: { items: D.faqs },
  experience: { items: D.experience },
  process: { items: D.process },
  avatar_messages: { items: D.avatar_messages },
  footer: D.footer,
};

async function fetchCaseStudies(): Promise<CaseStudyRow[]> {
  try {
    // List views don't need funnel HTML / creatives (huge payloads).
    const { data, error } = await supabase
      .from("case_studies")
      .select("id,slug,title,industry,client,country,duration,platforms,summary,tags,results,cover_image_url,sort_order,published,created_at,updated_at,challenge,goal,strategy,outcome")
      .order("sort_order", { ascending: true });
    if (error) {
      console.warn("[cms] case_studies:", error.message);
      return [];
    }
    return (data ?? []).map((row) => normalizeCaseStudy(row as Record<string, unknown>));
  } catch (e) {
    console.warn("[cms] case_studies:", e);
    return [];
  }
}

export async function fetchCaseStudyBySlug(slug: string): Promise<CaseStudyRow | null> {
  const clean = cleanSlug(slug);
  try {
    for (const candidate of [clean, slug, `/${clean}`, decodeURIComponent(slug)]) {
      const { data, error } = await supabase.from("case_studies").select("*").eq("slug", candidate).maybeSingle();
      if (error) {
        console.warn(`[cms] case_study/${candidate}:`, error.message);
        continue;
      }
      if (data) return normalizeCaseStudy(data as Record<string, unknown>);
    }
    return null;
  } catch (e) {
    console.warn(`[cms] case_study/${slug}:`, e);
    return null;
  }
}

async function fetchAllSettings(): Promise<Record<string, unknown>> {
  try {
    // Only fetch known section keys — keeps heavy keys (e.g. funnel HTML) out of every page load.
    const keys = Object.keys(DEFAULTS);
    const { data, error } = await supabase.from("site_settings").select("key, data").in("key", keys);
    if (error) {
      console.warn("[cms] settings_all:", error.message);
      return {};
    }
    const map: Record<string, unknown> = {};
    for (const row of data ?? []) {
      map[row.key as string] = row.data;
    }
    return map;
  } catch (e) {
    console.warn("[cms] settings_all:", e);
    return {};
  }
}

function mergeSection<K extends keyof SectionMap>(key: K, raw: unknown): SectionMap[K] {
  const merged = { ...(DEFAULTS[key] as object), ...((raw ?? {}) as object) } as SectionMap[K];
  if (key === "stack") {
    const stack = merged as SectionMap["stack"];
    return {
      items: stack.items.map((group) => ({
        ...group,
        items: group.items.map((item) => (item === "Lovable" ? "React" : item)),
      })),
    } as SectionMap[K];
  }
  return merged;
}

async function fetchSection<K extends keyof SectionMap>(key: K): Promise<SectionMap[K]> {
  try {
    const { data, error } = await supabase.from("site_settings").select("data").eq("key", key).maybeSingle();
    if (error) {
      console.warn(`[cms] ${key}:`, error.message);
      return DEFAULTS[key];
    }
    if (!data) return DEFAULTS[key];
    return mergeSection(key, data.data);
  } catch (e) {
    console.warn(`[cms] ${key}:`, e);
    return DEFAULTS[key];
  }
}

// ---------- Reads ----------
export function useSection<K extends keyof SectionMap>(key: K) {
  const all = useQuery({
    queryKey: ["cms", "settings_all"],
    queryFn: fetchAllSettings,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const data = all.data
    ? mergeSection(key, all.data[key])
    : DEFAULTS[key];

  return {
    ...all,
    data,
  };
}

export function useCaseStudies() {
  return useQuery({
    queryKey: ["cms", "case_studies"],
    queryFn: fetchCaseStudies,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useCaseStudy(slug: string) {
  return useQuery({
    queryKey: ["cms", "case_study", slug],
    queryFn: () => fetchCaseStudyBySlug(slug),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}

// ---------- Auth / admin ----------
export function useIsAdmin() {
  return useQuery({
    queryKey: ["auth", "isAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { user: null, isAdmin: false };
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      return { user, isAdmin: !!data };
    },
    staleTime: 10_000,
  });
}

// ---------- Media upload ----------
export async function uploadMedia(file: File, folder = "misc"): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

export async function upsertSiteSection<K extends keyof SectionMap>(key: K, data: SectionMap[K]) {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, data: data as never }, { onConflict: "key" });
  if (error) throw error;
}

// ---------- Client reviews ----------
export type ClientReview = {
  id: string;
  name: string;
  title: string;
  quote: string;
  approved: boolean;
  created_at: string;
};

async function fetchApprovedReviews(): Promise<ClientReview[]> {
  try {
    const { data, error } = await supabase
      .from("client_reviews")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("[cms] client_reviews:", error.message);
      return [];
    }
    return (data ?? []) as ClientReview[];
  } catch (e) {
    console.warn("[cms] client_reviews:", e);
    return [];
  }
}

export function useClientReviews() {
  return useQuery({
    queryKey: ["cms", "client_reviews"],
    queryFn: fetchApprovedReviews,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

export async function submitClientReview(input: { name: string; title: string; quote: string }) {
  const name = input.name.trim();
  const title = input.title.trim();
  const quote = input.quote.trim();
  if (!name || !quote) throw new Error("Name and review are required");
  if (quote.length > 800) throw new Error("Review is too long (max 800 characters)");
  const { error } = await supabase.from("client_reviews").insert({
    name,
    title,
    quote,
    approved: false,
  });
  if (error) {
    const msg = error.message || "";
    if (/relation .* does not exist|Could not find the table|schema cache/i.test(msg) || error.code === "42P01" || error.code === "PGRST205") {
      throw new Error("Reviews table is not set up yet. Run the client_reviews SQL in Supabase, then try again.");
    }
    throw new Error(msg || "Could not submit review");
  }
}

// ---------- Funnel / prelander library (stored in site_settings — no extra SQL table needed) ----------
export type FunnelKind = "prelander" | "funnel";

export type FunnelLibraryItem = {
  id: string;
  title: string;
  description: string;
  kind: FunnelKind;
  html: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type FunnelLibraryData = { items: FunnelLibraryItem[] };

const FUNNEL_LIBRARY_KEY = "funnel_library";

function normalizeFunnelItem(row: Record<string, unknown>): FunnelLibraryItem {
  const kind = row.kind === "prelander" ? "prelander" : "funnel";
  return {
    id: String(row.id || crypto.randomUUID()),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    kind,
    html: String(row.html ?? ""),
    sort_order: Number(row.sort_order ?? 0),
    published: row.published !== false,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function fetchFunnelLibraryAll(): Promise<FunnelLibraryItem[]> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("data")
      .eq("key", FUNNEL_LIBRARY_KEY)
      .maybeSingle();
    if (error) {
      console.warn("[cms] funnel_library:", error.message);
      return [];
    }
    const raw = (data?.data as { items?: unknown[] } | null)?.items;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((row) => normalizeFunnelItem((row ?? {}) as Record<string, unknown>))
      .sort((a, b) => a.sort_order - b.sort_order);
  } catch (e) {
    console.warn("[cms] funnel_library:", e);
    return [];
  }
}

async function fetchPublishedFunnelLibrary(): Promise<FunnelLibraryItem[]> {
  const all = await fetchFunnelLibraryAll();
  return all.filter((i) => i.published && i.html.trim());
}

export async function upsertFunnelLibraryItems(items: FunnelLibraryItem[]) {
  const payload = {
    items: items.map((i, idx) => ({
      ...i,
      id: i.id || crypto.randomUUID(),
      sort_order: Number.isFinite(i.sort_order) ? i.sort_order : idx + 1,
      updated_at: new Date().toISOString(),
      created_at: i.created_at || new Date().toISOString(),
    })),
  };
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: FUNNEL_LIBRARY_KEY, data: payload as never }, { onConflict: "key" });
  if (error) throw error;
}

export function useFunnelLibrary() {
  return useQuery({
    queryKey: ["cms", "funnel_library"],
    queryFn: fetchPublishedFunnelLibrary,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}

// ---------- Contact leads (admin) ----------
export type ContactLeadRow = {
  id: string;
  name: string;
  email: string;
  company?: string;
  budget?: string;
  brief: string;
  created_at: string;
  source?: string;
};

export async function fetchContactLeads(): Promise<ContactLeadRow[]> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("data")
      .eq("key", "contact_leads")
      .maybeSingle();
    if (error) {
      console.warn("[cms] contact_leads:", error.message);
      return [];
    }
    const raw = (data?.data as { items?: unknown[] } | null)?.items;
    if (!Array.isArray(raw)) return [];
    return raw.map((row) => {
      const r = (row ?? {}) as Record<string, unknown>;
      return {
        id: String(r.id ?? crypto.randomUUID()),
        name: String(r.name ?? ""),
        email: String(r.email ?? ""),
        company: String(r.company ?? ""),
        budget: String(r.budget ?? ""),
        brief: String(r.brief ?? ""),
        created_at: String(r.created_at ?? ""),
        source: String(r.source ?? "contact"),
      };
    });
  } catch (e) {
    console.warn("[cms] contact_leads:", e);
    return [];
  }
}
