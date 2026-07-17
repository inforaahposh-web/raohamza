// CMS hooks — read/write for site_settings + case_studies via Lovable Cloud.
// Falls back to static defaults from site-data.ts when the DB is empty or loading.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import * as defaults from "./site-data";

export type SocialLink = { label: string; href: string };
export type SiteInfo = {
  name: string; role: string; tagline: string; email: string; whatsapp: string;
  location: string; hours: string; social: SocialLink[];
};
export type HeroContent = {
  eyebrow: string; headingLead: string; headingItalic: string; headingTail: string; sub: string;
  image_url: string | null; avatar_url: string | null;
};
export type BioContent = { title: string; body: string };
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
    email: defaults.site.email, whatsapp: defaults.site.whatsapp, location: defaults.site.location,
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
};

async function fetchCaseStudies(): Promise<CaseStudyRow[]> {
  try {
    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
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

async function fetchCaseStudyBySlug(slug: string): Promise<CaseStudyRow | null> {
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

async function fetchSection<K extends keyof SectionMap>(key: K): Promise<SectionMap[K]> {
  try {
    const { data, error } = await supabase.from("site_settings").select("data").eq("key", key).maybeSingle();
    if (error) {
      console.warn(`[cms] ${key}:`, error.message);
      return DEFAULTS[key];
    }
    if (!data) return DEFAULTS[key];
    return { ...(DEFAULTS[key] as object), ...(data.data as object) } as SectionMap[K];
  } catch (e) {
    console.warn(`[cms] ${key}:`, e);
    return DEFAULTS[key];
  }
}

// ---------- Reads ----------
export function useSection<K extends keyof SectionMap>(key: K) {
  return useQuery({
    queryKey: ["cms", "section", key],
    queryFn: () => fetchSection(key),
    initialData: DEFAULTS[key],
    staleTime: 30_000,
  });
}

export function useCaseStudies() {
  return useQuery({
    queryKey: ["cms", "case_studies"],
    queryFn: fetchCaseStudies,
    staleTime: 30_000,
  });
}

export function useCaseStudy(slug: string) {
  return useQuery({
    queryKey: ["cms", "case_study", slug],
    queryFn: () => fetchCaseStudyBySlug(slug),
    staleTime: 30_000,
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
