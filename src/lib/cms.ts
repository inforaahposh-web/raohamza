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

export type MediaItem = { url: string; type: "image" | "video"; caption?: string };
export type StatImage = { url: string; caption?: string };
export type ResultKPI = { label: string; value: string };

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

const DEFAULT_CASE_STUDIES: CaseStudyRow[] = defaults.caseStudies.map((cs, i) => ({
  id: cs.slug,
  slug: cs.slug,
  title: cs.title,
  industry: cs.industry,
  client: cs.client,
  country: cs.country,
  duration: cs.duration,
  platforms: cs.platforms,
  summary: cs.summary,
  tags: cs.tags,
  results: cs.results,
  challenge: cs.challenge,
  goal: cs.goal,
  strategy: cs.strategy,
  outcome: cs.outcome,
  funnel_html: null,
  ad_creatives: [],
  campaign_stat_images: [],
  cover_image_url: null,
  sort_order: i + 1,
  published: true,
}));

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
    queryFn: async (): Promise<CaseStudyRow[]> => {
      try {
        const { data, error } = await supabase
          .from("case_studies")
          .select("*")
          .order("sort_order", { ascending: true });
        if (error) {
          console.warn("[cms] case_studies:", error.message);
          return DEFAULT_CASE_STUDIES;
        }
        if (!data?.length) return DEFAULT_CASE_STUDIES;
        return (data ?? []) as unknown as CaseStudyRow[];
      } catch (e) {
        console.warn("[cms] case_studies:", e);
        return DEFAULT_CASE_STUDIES;
      }
    },
    initialData: DEFAULT_CASE_STUDIES,
    staleTime: 30_000,
  });
}

export function useCaseStudy(slug: string) {
  const fallback = DEFAULT_CASE_STUDIES.find((c) => c.slug === slug) ?? null;
  return useQuery({
    queryKey: ["cms", "case_study", slug],
    queryFn: async (): Promise<CaseStudyRow | null> => {
      try {
        const { data, error } = await supabase.from("case_studies").select("*").eq("slug", slug).maybeSingle();
        if (error) {
          console.warn(`[cms] case_study/${slug}:`, error.message);
          return fallback;
        }
        return (data ?? fallback) as unknown as CaseStudyRow | null;
      } catch (e) {
        console.warn(`[cms] case_study/${slug}:`, e);
        return fallback;
      }
    },
    initialData: fallback ?? undefined,
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
