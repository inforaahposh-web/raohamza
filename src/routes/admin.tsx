import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, uploadMedia, DEFAULTS, normalizeCaseStudy, slugify, MEDIA_ASPECT_OPTIONS, upsertSiteSection, type CaseStudyRow, type MediaAspect, type ResultKPI, type MediaItem, type ClientReview } from "@/lib/cms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { LogOut, Save, Upload, Plus, Trash2 } from "lucide-react";
import { CaseStudyFunnel } from "@/components/site/CaseStudyFunnel";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — CMS" }, { name: "robots", content: "noindex" }] }),
});

const SECTION_KEYS = ["site","hero","bio","stats","services","stack","industries","testimonials","faqs","experience","process","avatar_messages","footer"] as const;
type SectionKey = typeof SECTION_KEYS[number];

function AdminPage() {
  const nav = useNavigate();
  const { data: auth, isLoading } = useIsAdmin();
  const [caseEditing, setCaseEditing] = useState(false);

  useEffect(() => {
    if (!isLoading && !auth?.user) nav({ to: "/auth" });
  }, [isLoading, auth, nav]);

  if (isLoading) return <div className="p-10 text-body">Loading…</div>;
  if (!auth?.user) return null;
  if (!auth.isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl font-bold text-ink">Not authorized</h1>
          <p className="mt-3 text-body">Your account exists but is not an admin.</p>
          <Button className="mt-6" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/auth" }); }}>Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <p className="font-display text-lg font-bold text-ink">Admin Dashboard</p>
            <p className="text-xs text-body-light">{auth.user.email}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="btn-secondary text-sm">View site</Link>
            <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/auth" }); }}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <Tabs defaultValue="hero">
          {!caseEditing && (
            <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1 bg-white p-1">
              <TabsTrigger value="hero" className="flex-1 sm:flex-none">Hero & Images</TabsTrigger>
              <TabsTrigger value="sections" className="flex-1 sm:flex-none">Site sections</TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1 sm:flex-none">Reviews</TabsTrigger>
              <TabsTrigger value="footer" className="flex-1 sm:flex-none">Footer</TabsTrigger>
              <TabsTrigger value="cases" className="flex-1 sm:flex-none">Case studies</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="hero" className="mt-0">
            <HeroImagesEditor />
          </TabsContent>
          <TabsContent value="sections" className="mt-0">
            <SectionsEditor />
          </TabsContent>
          <TabsContent value="reviews" className="mt-0">
            <ClientReviewsManager />
          </TabsContent>
          <TabsContent value="footer" className="mt-0">
            <FooterSectionEditor />
          </TabsContent>
          <TabsContent value="cases" className="mt-0">
            <CaseStudiesManager onEditingChange={setCaseEditing} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============= Hero + avatar image editor =============
function HeroImagesEditor() {
  const qc = useQueryClient();
  const { data: row } = useQuery({
    queryKey: ["admin", "section", "hero"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("data").eq("key", "hero").maybeSingle();
      return { ...DEFAULTS.hero, ...((data?.data ?? {}) as object) } as typeof DEFAULTS.hero;
    },
  });
  const [state, setState] = useState<typeof DEFAULTS.hero | null>(null);
  useEffect(() => { if (row) setState(row); }, [row]);
  if (!state) return null;

  async function saveHero(next?: typeof DEFAULTS.hero, silent = false) {
    const payload = next ?? state!;
    try {
      await upsertSiteSection("hero", payload);
      setState(payload);
      if (!silent) toast.success("Hero saved");
      qc.invalidateQueries({ queryKey: ["cms"] });
      qc.invalidateQueries({ queryKey: ["admin", "section", "hero"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function pick(field: "image_url" | "avatar_url", file: File) {
    try {
      const url = await uploadMedia(file, field === "avatar_url" ? "avatar" : "hero");
      const next = { ...state!, [field]: url };
      setState(next);
      await saveHero(next, true);
      toast.success(field === "image_url" ? "Hero photo saved" : "Avatar saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    }
  }

  async function clearImage(field: "image_url" | "avatar_url") {
    const next = { ...state!, [field]: null };
    setState(next);
    await saveHero(next, true);
    toast.success("Photo removed — section hidden on site");
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 space-y-6">
      <h2 className="font-display text-2xl font-bold text-ink">Hero content & images</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <ImagePickerRow label="Homepage hero photo" url={state.image_url} portrait onPick={(f) => pick("image_url", f)} onClear={() => clearImage("image_url")} />
        <ImagePickerRow label="Scroll avatar (PNG cutout — transparent background)" url={state.avatar_url} onPick={(f) => pick("avatar_url", f)} onClear={() => clearImage("avatar_url")} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Eyebrow" value={state.eyebrow} onChange={(v) => setState({ ...state, eyebrow: v })} />
        <Field label="Sub-heading" value={state.sub} onChange={(v) => setState({ ...state, sub: v })} textarea />
        <Field label="Heading — lead" value={state.headingLead} onChange={(v) => setState({ ...state, headingLead: v })} />
        <Field label="Heading — italic word" value={state.headingItalic} onChange={(v) => setState({ ...state, headingItalic: v })} />
        <Field label="Heading — tail" value={state.headingTail} onChange={(v) => setState({ ...state, headingTail: v })} textarea />
      </div>

      <Button onClick={() => saveHero()}><Save className="h-4 w-4" /> Save hero text</Button>
    </div>
  );
}

function Field({ label, value, onChange, textarea, hint }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">{label}</Label>
      {textarea
        ? <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="resize-y" />
        : <Input value={value} onChange={(e) => onChange(e.target.value)} />}
      {hint && <p className="text-xs text-body-light">{hint}</p>}
    </div>
  );
}

function ImagePickerRow({ label, url, onPick, onClear, portrait }: { label: string; url: string | null; onPick: (f: File) => void; onClear: () => void; portrait?: boolean }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm font-semibold text-ink mb-3">{label}</p>
      {url ? (
        <div className="relative">
          <img
            src={url}
            alt=""
            className={`w-full rounded-lg bg-secondary ${portrait ? "h-56 object-contain object-top" : "h-40 object-cover object-center"}`}
          />
          <Button size="sm" variant="destructive" className="absolute top-2 right-2" onClick={onClear}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ) : (
        <div className="grid place-items-center h-56 rounded-lg bg-secondary text-body-light text-sm text-center px-4">No photo — hero image hidden on site</div>
      )}
      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-primary hover:underline">
        <Upload className="h-4 w-4" /> Upload new
        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }} />
      </label>
      {portrait && <p className="mt-2 text-xs text-body-light">Tip: use a portrait photo (3:4). Saves automatically after upload.</p>}
    </div>
  );
}

// ============= Sections editor (simple forms, no JSON) =============
function SectionsEditor() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-body">Edit site content with simple fields — no JSON required.</p>
      <SiteSectionEditor />
      <BioSectionEditor />
      <StatsSectionEditor />
      <ServicesSectionEditor />
      <FaqsSectionEditor />
      <ExperienceSectionEditor />
      <ProcessSectionEditor />
      <AvatarMessagesEditor />
      <SectionCard sectionKey="stack" />
      <SectionCard sectionKey="industries" />
    </div>
  );
}

function useSectionState<K extends SectionKey>(key: K) {
  const [data, setData] = useState<(typeof DEFAULTS)[K] | null>(null);
  useEffect(() => {
    (async () => {
      const { data: row } = await supabase.from("site_settings").select("data").eq("key", key).maybeSingle();
      setData({ ...(DEFAULTS[key] as object), ...((row?.data ?? {}) as object) } as (typeof DEFAULTS)[K]);
    })();
  }, [key]);
  return [data, setData] as const;
}

function SiteSectionEditor() {
  const qc = useQueryClient();
  const [data, setData] = useSectionState("site");
  if (!data) return null;
  const d = data;
  async function save() {
    const { error } = await supabase.from("site_settings").upsert({ key: "site", data: d as never });
    if (error) return toast.error(error.message);
    toast.success("Site info saved");
    qc.invalidateQueries({ queryKey: ["cms"] });
  }
  return (
    <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
      <h3 className="font-display text-lg font-bold text-ink">Site info</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" value={d.name} onChange={(v) => setData({ ...d, name: v })} />
        <Field label="Role" value={d.role} onChange={(v) => setData({ ...d, role: v })} />
        <Field label="Email" value={d.email} onChange={(v) => setData({ ...d, email: v })} />
        <Field label="WhatsApp" value={d.whatsapp} onChange={(v) => setData({ ...d, whatsapp: v })} />
        <Field label="Location" value={d.location} onChange={(v) => setData({ ...d, location: v })} />
        <Field label="Hours" value={d.hours} onChange={(v) => setData({ ...d, hours: v })} />
      </div>
      <Field label="Tagline" value={d.tagline} onChange={(v) => setData({ ...d, tagline: v })} textarea />
      <Button onClick={save}><Save className="h-4 w-4" /> Save site info</Button>
    </div>
  );
}

function BioSectionEditor() {
  const qc = useQueryClient();
  const [data, setData] = useSectionState("bio");
  if (!data) return null;
  async function save() {
    const { error } = await supabase.from("site_settings").upsert({ key: "bio", data: data as never });
    if (error) return toast.error(error.message);
    toast.success("Bio saved");
    qc.invalidateQueries({ queryKey: ["cms"] });
  }
  return (
    <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
      <h3 className="font-display text-lg font-bold text-ink">Bio</h3>
      <Field label="Title" value={data.title} onChange={(v) => setData({ ...data, title: v })} />
      <Field label="Body" value={data.body} onChange={(v) => setData({ ...data, body: v })} textarea />
      <Button onClick={save}><Save className="h-4 w-4" /> Save bio</Button>
    </div>
  );
}

function StatsSectionEditor() {
  const qc = useQueryClient();
  const [data, setData] = useSectionState("stats");
  if (!data) return null;
  const items = data.items;
  function update(i: number, patch: Partial<(typeof items)[0]>) {
    const next = [...items]; next[i] = { ...next[i], ...patch }; setData({ ...data, items: next });
  }
  async function save() {
    const { error } = await supabase.from("site_settings").upsert({ key: "stats", data: data as never });
    if (error) return toast.error(error.message);
    toast.success("Stats saved");
    qc.invalidateQueries({ queryKey: ["cms"] });
  }
  return (
    <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
      <h3 className="font-display text-lg font-bold text-ink">Stats</h3>
      {items.map((s, i) => (
        <div key={i} className="grid gap-2 rounded-xl border border-border p-4 md:grid-cols-3">
          <Field label="Value" value={s.value} onChange={(v) => update(i, { value: v })} />
          <Field label="Suffix" value={s.suffix} onChange={(v) => update(i, { suffix: v })} />
          <Field label="Label" value={s.label} onChange={(v) => update(i, { label: v })} />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => setData({ ...data, items: [...items, { value: "", suffix: "", label: "" }] })}><Plus className="h-4 w-4" /> Add stat</Button>
      <Button onClick={save}><Save className="h-4 w-4" /> Save stats</Button>
    </div>
  );
}

function ServicesSectionEditor() {
  const qc = useQueryClient();
  const [data, setData] = useSectionState("services");
  if (!data) return null;
  async function save() {
    const { error } = await supabase.from("site_settings").upsert({ key: "services", data: data as never });
    if (error) return toast.error(error.message);
    toast.success("Services saved");
    qc.invalidateQueries({ queryKey: ["cms"] });
  }
  return (
    <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
      <h3 className="font-display text-lg font-bold text-ink">Services</h3>
      {data.items.map((s, i) => (
        <div key={i} className="grid gap-2 rounded-xl border border-border p-4 md:grid-cols-2">
          <Field label="Tag" value={s.tag} onChange={(v) => { const items = [...data.items]; items[i] = { ...s, tag: v }; setData({ ...data, items }); }} />
          <Field label="Title" value={s.title} onChange={(v) => { const items = [...data.items]; items[i] = { ...s, title: v }; setData({ ...data, items }); }} />
          <div className="md:col-span-2"><Field label="Description" value={s.desc} onChange={(v) => { const items = [...data.items]; items[i] = { ...s, desc: v }; setData({ ...data, items }); }} textarea /></div>
        </div>
      ))}
      <Button onClick={save}><Save className="h-4 w-4" /> Save services</Button>
    </div>
  );
}

function ClientReviewsManager() {
  const qc = useQueryClient();
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin", "client_reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClientReview[];
    },
  });

  async function setApproved(id: string, approved: boolean) {
    const { error } = await supabase.from("client_reviews").update({ approved }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(approved ? "Review published" : "Review hidden");
    qc.invalidateQueries({ queryKey: ["admin", "client_reviews"] });
    qc.invalidateQueries({ queryKey: ["cms", "client_reviews"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("client_reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Review deleted");
    qc.invalidateQueries({ queryKey: ["admin", "client_reviews"] });
    qc.invalidateQueries({ queryKey: ["cms", "client_reviews"] });
  }

  const pending = reviews.filter((r) => !r.approved);
  const published = reviews.filter((r) => r.approved);

  return (
    <div className="rounded-2xl border border-border bg-white p-6 space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">Client reviews</h2>
        <p className="mt-1 text-sm text-body">Approve reviews submitted from the homepage. Only approved reviews show on the site.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-body-light">Loading…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-body-light">No reviews submitted yet.</p>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">Pending ({pending.length})</h3>
              {pending.map((r) => (
                <ReviewAdminCard key={r.id} review={r} onApprove={() => setApproved(r.id, true)} onDelete={() => remove(r.id)} />
              ))}
            </div>
          )}
          {published.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">Published ({published.length})</h3>
              {published.map((r) => (
                <ReviewAdminCard key={r.id} review={r} onHide={() => setApproved(r.id, false)} onDelete={() => remove(r.id)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ReviewAdminCard({
  review,
  onApprove,
  onHide,
  onDelete,
}: {
  review: ClientReview;
  onApprove?: () => void;
  onHide?: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <blockquote className="text-ink">"{review.quote}"</blockquote>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{review.name}</p>
          {review.title ? <p className="text-sm text-body-light">{review.title}</p> : null}
          <p className="text-xs text-body-light mt-1">{new Date(review.created_at).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          {onApprove && <Button size="sm" onClick={onApprove}>Approve</Button>}
          {onHide && <Button size="sm" variant="outline" onClick={onHide}>Hide</Button>}
          <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
        </div>
      </div>
    </div>
  );
}

function FaqsSectionEditor() {
  const qc = useQueryClient();
  const [data, setData] = useSectionState("faqs");
  if (!data) return null;
  async function save() {
    const { error } = await supabase.from("site_settings").upsert({ key: "faqs", data: data as never });
    if (error) return toast.error(error.message);
    toast.success("FAQs saved");
    qc.invalidateQueries({ queryKey: ["cms"] });
  }
  return (
    <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
      <h3 className="font-display text-lg font-bold text-ink">FAQs</h3>
      {data.items.map((f, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-border p-4">
          <Field label="Question" value={f.q} onChange={(v) => { const items = [...data.items]; items[i] = { ...f, q: v }; setData({ ...data, items }); }} />
          <Field label="Answer" value={f.a} onChange={(v) => { const items = [...data.items]; items[i] = { ...f, a: v }; setData({ ...data, items }); }} textarea />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => setData({ ...data, items: [...data.items, { q: "", a: "" }] })}><Plus className="h-4 w-4" /> Add FAQ</Button>
      <Button onClick={save}><Save className="h-4 w-4" /> Save FAQs</Button>
    </div>
  );
}

function ExperienceSectionEditor() {
  const qc = useQueryClient();
  const [data, setData] = useSectionState("experience");
  if (!data) return null;
  async function save() {
    const { error } = await supabase.from("site_settings").upsert({ key: "experience", data: data as never });
    if (error) return toast.error(error.message);
    toast.success("Experience saved");
    qc.invalidateQueries({ queryKey: ["cms"] });
  }
  return (
    <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
      <h3 className="font-display text-lg font-bold text-ink">Experience</h3>
      {data.items.map((e, i) => (
        <div key={i} className="grid gap-2 rounded-xl border border-border p-4 md:grid-cols-3">
          <Field label="Year" value={e.year} onChange={(v) => { const items = [...data.items]; items[i] = { ...e, year: v }; setData({ ...data, items }); }} />
          <Field label="Role" value={e.role} onChange={(v) => { const items = [...data.items]; items[i] = { ...e, role: v }; setData({ ...data, items }); }} />
          <Field label="Organization" value={e.org} onChange={(v) => { const items = [...data.items]; items[i] = { ...e, org: v }; setData({ ...data, items }); }} />
        </div>
      ))}
      <Button onClick={save}><Save className="h-4 w-4" /> Save experience</Button>
    </div>
  );
}

function ProcessSectionEditor() {
  const qc = useQueryClient();
  const [data, setData] = useSectionState("process");
  if (!data) return null;
  async function save() {
    const { error } = await supabase.from("site_settings").upsert({ key: "process", data: data as never });
    if (error) return toast.error(error.message);
    toast.success("Process saved");
    qc.invalidateQueries({ queryKey: ["cms"] });
  }
  return (
    <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
      <h3 className="font-display text-lg font-bold text-ink">Process</h3>
      {data.items.map((p, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-border p-4">
          <div className="grid gap-2 md:grid-cols-2">
            <Field label="Step" value={p.step} onChange={(v) => { const items = [...data.items]; items[i] = { ...p, step: v }; setData({ ...data, items }); }} />
            <Field label="Title" value={p.title} onChange={(v) => { const items = [...data.items]; items[i] = { ...p, title: v }; setData({ ...data, items }); }} />
          </div>
          <Field label="Body" value={p.body} onChange={(v) => { const items = [...data.items]; items[i] = { ...p, body: v }; setData({ ...data, items }); }} textarea />
        </div>
      ))}
      <Button onClick={save}><Save className="h-4 w-4" /> Save process</Button>
    </div>
  );
}

function AvatarMessagesEditor() {
  const qc = useQueryClient();
  const [data, setData] = useSectionState("avatar_messages");
  if (!data) return null;
  async function save() {
    const { error } = await supabase.from("site_settings").upsert({ key: "avatar_messages", data: data as never });
    if (error) return toast.error(error.message);
    toast.success("Avatar messages saved");
    qc.invalidateQueries({ queryKey: ["cms"] });
  }
  return (
    <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
      <h3 className="font-display text-lg font-bold text-ink">Scroll avatar messages</h3>
      {data.items.map((msg, i) => (
        <Field key={i} label={`Message ${i + 1}`} value={msg} onChange={(v) => { const items = [...data.items]; items[i] = v; setData({ ...data, items }); }} />
      ))}
      <Button onClick={save}><Save className="h-4 w-4" /> Save messages</Button>
    </div>
  );
}

function FooterSectionEditor() {
  const qc = useQueryClient();
  const [data, setData] = useSectionState("footer");
  if (!data) return null;
  const d = data;

  async function save() {
    const { error } = await supabase.from("site_settings").upsert({ key: "footer", data: d as never });
    if (error) return toast.error(error.message);
    toast.success("Footer saved");
    qc.invalidateQueries({ queryKey: ["cms"] });
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 space-y-6">
      <div>
        <h3 className="font-display text-lg font-bold text-ink">Footer</h3>
        <p className="mt-1 text-sm text-body-light">Edit everything shown in the site footer — CTA, links, social, and bottom line.</p>
      </div>

      <div className="space-y-4 rounded-xl border border-border p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Call to action (left column)</p>
        <Field label="Eyebrow" value={d.ctaEyebrow} onChange={(v) => setData({ ...d, ctaEyebrow: v })} />
        <Field label="Headline line 1" value={d.ctaLine1} onChange={(v) => setData({ ...d, ctaLine1: v })} />
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Headline line 2 (before highlight)" value={d.ctaLine2Prefix} onChange={(v) => setData({ ...d, ctaLine2Prefix: v })} />
          <Field label="Highlighted word (purple)" value={d.ctaHighlight} onChange={(v) => setData({ ...d, ctaHighlight: v })} />
          <Field label="Headline line 2 (after highlight)" value={d.ctaLine2Suffix} onChange={(v) => setData({ ...d, ctaLine2Suffix: v })} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Button text" value={d.ctaButtonText} onChange={(v) => setData({ ...d, ctaButtonText: v })} />
          <Field label="Button link (e.g. /contact)" value={d.ctaButtonLink} onChange={(v) => setData({ ...d, ctaButtonLink: v })} />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Navigation links</p>
        <Field label="Column label" value={d.navLabel} onChange={(v) => setData({ ...d, navLabel: v })} />
        {d.navLinks.map((link, i) => (
          <div key={i} className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <Field label="Label" value={link.label} onChange={(v) => { const navLinks = [...d.navLinks]; navLinks[i] = { ...link, label: v }; setData({ ...d, navLinks }); }} />
            <Field label="Path" value={link.to} onChange={(v) => { const navLinks = [...d.navLinks]; navLinks[i] = { ...link, to: v }; setData({ ...d, navLinks }); }} />
            <Button variant="outline" size="sm" onClick={() => setData({ ...d, navLinks: d.navLinks.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setData({ ...d, navLinks: [...d.navLinks, { label: "", to: "/" }] })}><Plus className="h-4 w-4" /> Add nav link</Button>
      </div>

      <div className="space-y-4 rounded-xl border border-border p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Social & contact (right column)</p>
        <Field label="Column label" value={d.socialLabel} onChange={(v) => setData({ ...d, socialLabel: v })} />
        {d.social.map((s, i) => (
          <div key={i} className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <Field label="Label" value={s.label} onChange={(v) => { const social = [...d.social]; social[i] = { ...s, label: v }; setData({ ...d, social }); }} />
            <Field label="URL" value={s.href} onChange={(v) => { const social = [...d.social]; social[i] = { ...s, href: v }; setData({ ...d, social }); }} />
            <Button variant="outline" size="sm" onClick={() => setData({ ...d, social: d.social.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setData({ ...d, social: [...d.social, { label: "", href: "" }] })}><Plus className="h-4 w-4" /> Add social link</Button>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Location" value={d.location} onChange={(v) => setData({ ...d, location: v })} />
          <Field label="Working hours" value={d.hours} onChange={(v) => setData({ ...d, hours: v })} />
        </div>
      </div>

      <Field label="Bottom tagline (right side of copyright)" value={d.bottomTagline} onChange={(v) => setData({ ...d, bottomTagline: v })} />

      <p className="text-xs text-body-light">Copyright name comes from <strong>Site info → Name</strong> in Site sections tab.</p>

      <Button onClick={save}><Save className="h-4 w-4" /> Save footer</Button>
    </div>
  );
}

function SectionCard({ sectionKey }: { sectionKey: "stack" | "industries" }) {
  const qc = useQueryClient();
  const [text, setText] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("data").eq("key", sectionKey).maybeSingle();
      const value = data?.data ?? DEFAULTS[sectionKey];
      setText(JSON.stringify(value, null, 2));
      setLoaded(true);
    })();
  }, [sectionKey]);

  async function save() {
    try {
      const parsed = JSON.parse(text);
      const { error } = await supabase.from("site_settings").upsert({ key: sectionKey, data: parsed as never });
      if (error) throw error;
      toast.success(`${sectionKey} saved`);
      qc.invalidateQueries({ queryKey: ["cms"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid JSON");
    }
  }

  function reset() {
    setText(JSON.stringify(DEFAULTS[sectionKey], null, 2));
  }

  if (!loaded) return null;

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg font-bold text-ink capitalize">{sectionKey.replace("_", " ")}</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={reset}>Reset to default</Button>
          <Button size="sm" onClick={save}><Save className="h-4 w-4" /> Save</Button>
        </div>
      </div>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} className="font-mono text-xs" />
    </div>
  );
}

// ============= Case studies manager =============
type EditableCase = Partial<CaseStudyRow> & { platforms_text?: string; tags_text?: string };

function CaseStudiesManager({ onEditingChange }: { onEditingChange?: (editing: boolean) => void }) {
  const qc = useQueryClient();
  const { data: cases, refetch } = useQuery({
    queryKey: ["admin", "cases"],
    queryFn: async () => {
      const { data, error } = await supabase.from("case_studies").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []).map((row) => normalizeCaseStudy(row as Record<string, unknown>));
    },
  });
  const [editing, setEditing] = useState<EditableCase | null>(null);

  useEffect(() => {
    onEditingChange?.(!!editing);
  }, [editing, onEditingChange]);

  function newBlank(): EditableCase {
    return {
      slug: "", title: "", industry: "", client: "", country: "", duration: "",
      platforms: [], summary: "", tags: [], results: [],
      challenge: "", goal: "", strategy: "", outcome: "",
      funnel_html: "", ad_creatives: [], campaign_stat_images: [],
      cover_image_url: null, sort_order: (cases?.length ?? 0) + 1, published: true,
      platforms_text: "", tags_text: "",
    };
  }

  async function del(id: string) {
    if (!confirm("Delete this case study?")) return;
    const { error } = await supabase.from("case_studies").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refetch();
    qc.invalidateQueries({ queryKey: ["cms"] });
  }

  if (editing) return <CaseEditor value={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); refetch(); qc.invalidateQueries({ queryKey: ["cms"] }); }} />;

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-bold text-ink">Case studies</h2>
        <Button onClick={() => setEditing(newBlank())}><Plus className="h-4 w-4" /> New</Button>
      </div>
      <div className="divide-y divide-border">
        {(cases ?? []).map((c) => (
          <div key={c.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-semibold text-ink">{c.title}</p>
              <p className="text-xs text-body-light">/{c.slug} · {c.industry ?? "—"} · {c.published ? "Published" : "Draft"}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing({
                ...normalizeCaseStudy(c as Record<string, unknown>),
                platforms_text: c.platforms.join(", "),
                tags_text: c.tags.join(", "),
              })}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => del(c.id!)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </div>
        ))}
        {(!cases || cases.length === 0) && <p className="py-6 text-sm text-body-light">No case studies yet.</p>}
      </div>
    </div>
  );
}

function KpiEditor({ items, onChange }: { items: ResultKPI[]; onChange: (v: ResultKPI[]) => void }) {
  return (
    <div className="space-y-3">
      <Label>Results / KPIs</Label>
      {items.map((kpi, i) => (
        <div key={i} className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[1fr_1fr_auto]">
          <Input placeholder="Label (e.g. ROAS)" value={kpi.label} onChange={(e) => {
            const next = [...items]; next[i] = { ...kpi, label: e.target.value }; onChange(next);
          }} />
          <Input placeholder="Value (e.g. 4.1x)" value={kpi.value} onChange={(e) => {
            const next = [...items]; next[i] = { ...kpi, value: e.target.value }; onChange(next);
          }} />
          <Button type="button" size="sm" variant="destructive" onClick={() => onChange(items.filter((_, x) => x !== i))}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { label: "", value: "" }])}>
        <Plus className="h-4 w-4" /> Add KPI
      </Button>
    </div>
  );
}

function AspectSelect({ value, onChange }: { value: MediaAspect; onChange: (v: MediaAspect) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as MediaAspect)}>
      <SelectTrigger className="w-full"><SelectValue placeholder="Aspect ratio" /></SelectTrigger>
      <SelectContent>
        {MEDIA_ASPECT_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CaseEditor({ value, onCancel, onSaved }: { value: EditableCase; onCancel: () => void; onSaved: () => void }) {
  const [f, setF] = useState<EditableCase>({ ...value, results: value.results ?? [] });

  function up<K extends keyof EditableCase>(k: K, v: EditableCase[K]) { setF({ ...f, [k]: v }); }

  async function save() {
    const slug = slugify(f.slug || f.title || "");
    const payload = {
      slug,
      title: (f.title || "").trim(),
      industry: f.industry || null,
      client: f.client || null,
      country: f.country || null,
      duration: f.duration || null,
      platforms: (f.platforms_text ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      summary: f.summary || null,
      tags: (f.tags_text ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      results: f.results ?? [],
      challenge: f.challenge || null,
      goal: f.goal || null,
      strategy: f.strategy || null,
      outcome: f.outcome || null,
      funnel_html: f.funnel_html || null,
      ad_creatives: f.ad_creatives ?? [],
      campaign_stat_images: f.campaign_stat_images ?? [],
      cover_image_url: f.cover_image_url || null,
      sort_order: f.sort_order ?? 0,
      published: f.published ?? true,
    };
    if (!payload.slug || !payload.title) return toast.error("Slug and title are required");
    const { error } = f.id
      ? await supabase.from("case_studies").update(payload as never).eq("id", f.id)
      : await supabase.from("case_studies").insert(payload as never);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onSaved();
  }

  async function uploadCover(file: File) {
    try { up("cover_image_url", await uploadMedia(file, "cases/covers")); toast.success("Uploaded"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
  }

  async function addCreative(file: File, aspect: MediaAspect) {
    try {
      const url = await uploadMedia(file, "cases/creatives");
      const type: "image" | "video" = file.type.startsWith("video") ? "video" : "image";
      up("ad_creatives", [...(f.ad_creatives ?? []), { url, type, caption: "", aspect }]);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
  }

  async function addStatImage(file: File) {
    try {
      const url = await uploadMedia(file, "cases/stats");
      up("campaign_stat_images", [...(f.campaign_stat_images ?? []), { url, caption: "" }]);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
  }

  const [newCreativeAspect, setNewCreativeAspect] = useState<MediaAspect>("auto");

  return (
    <div className="rounded-2xl border border-border bg-white shadow-soft">
      <div className="sticky top-[57px] z-20 flex flex-col gap-3 border-b border-border bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div>
          <h2 className="font-display text-xl font-bold text-ink md:text-2xl">{f.id ? "Edit" : "New"} case study</h2>
          {f.slug && <p className="text-xs text-body-light mt-1">URL: /case-studies/{slugify(f.slug)}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={save}><Save className="h-4 w-4" /> Save</Button>
        </div>
      </div>

      <div className="space-y-8 p-4 md:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Slug (URL)" value={f.slug || ""} onChange={(v) => up("slug", slugify(v))} hint="Use ecom — not /ecom" />
        <Field label="Title" value={f.title || ""} onChange={(v) => up("title", v)} />
        <Field label="Industry" value={f.industry || ""} onChange={(v) => up("industry", v)} />
        <Field label="Client" value={f.client || ""} onChange={(v) => up("client", v)} />
        <Field label="Country" value={f.country || ""} onChange={(v) => up("country", v)} />
        <Field label="Duration" value={f.duration || ""} onChange={(v) => up("duration", v)} />
        <Field label="Platforms (comma-separated)" value={f.platforms_text || ""} onChange={(v) => up("platforms_text", v)} />
        <Field label="Tags (comma-separated)" value={f.tags_text || ""} onChange={(v) => up("tags_text", v)} />
      </div>

      <Field label="Summary" value={f.summary || ""} onChange={(v) => up("summary", v)} textarea />

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Challenge" value={f.challenge || ""} onChange={(v) => up("challenge", v)} textarea />
        <Field label="Goal" value={f.goal || ""} onChange={(v) => up("goal", v)} textarea />
        <Field label="Strategy" value={f.strategy || ""} onChange={(v) => up("strategy", v)} textarea />
        <Field label="Outcome" value={f.outcome || ""} onChange={(v) => up("outcome", v)} textarea />
      </div>

      <KpiEditor items={f.results ?? []} onChange={(v) => up("results", v)} />

      <div>
        <Label>Cover image</Label>
        <ImagePickerRow label="Cover" url={f.cover_image_url || null} onPick={uploadCover} onClear={() => up("cover_image_url", null)} />
      </div>

      <div>
        <Label>Funnel HTML embed</Label>
        <Textarea rows={6} className="font-mono text-xs" value={f.funnel_html || ""} onChange={(e) => up("funnel_html", e.target.value)} placeholder="<iframe src='...'></iframe> or full HTML" />
        {f.funnel_html && (
          <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-body-light">Live preview (scroll inside box)</p>
            <div className="case-study-funnel-shell mt-4">
              <div className="funnel-scroll-inner">
                <CaseStudyFunnel html={f.funnel_html} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <Label>Ad creatives (images + videos)</Label>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(f.ad_creatives ?? []).map((m, i) => (
            <div key={i} className="rounded-xl border border-border p-3">
              <div className="mb-2 flex items-center justify-center bg-secondary/40 rounded-md overflow-hidden">
                {m.type === "video"
                  ? <video src={m.url} controls className={m.aspect === "auto" ? "w-full max-h-64" : `w-full ${m.aspect === "16:9" ? "aspect-video" : m.aspect === "1:1" ? "aspect-square" : m.aspect === "9:16" ? "aspect-[9/16]" : m.aspect === "3:4" ? "aspect-[3/4]" : "aspect-[4/5]"} object-cover`} />
                  : <img src={m.url} alt="" className={m.aspect === "auto" ? "w-full h-auto max-h-64 object-contain" : `w-full ${m.aspect === "16:9" ? "aspect-video" : m.aspect === "1:1" ? "aspect-square" : m.aspect === "9:16" ? "aspect-[9/16]" : m.aspect === "3:4" ? "aspect-[3/4]" : "aspect-[4/5]"} object-cover`} />}
              </div>
              <Label className="text-xs">Format</Label>
              <AspectSelect value={m.aspect ?? "auto"} onChange={(aspect) => {
                const next = [...(f.ad_creatives ?? [])]; next[i] = { ...m, aspect }; up("ad_creatives", next);
              }} />
              <Input className="mt-2" placeholder="Caption" value={m.caption ?? ""} onChange={(e) => {
                const next = [...(f.ad_creatives ?? [])]; next[i] = { ...m, caption: e.target.value }; up("ad_creatives", next);
              }} />
              <Button size="sm" variant="destructive" className="mt-2 w-full" onClick={() => up("ad_creatives", (f.ad_creatives ?? []).filter((_, x) => x !== i))}><Trash2 className="h-3 w-3" /> Remove</Button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label className="text-xs">Default format for new upload</Label>
            <AspectSelect value={newCreativeAspect} onChange={setNewCreativeAspect} />
          </div>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-primary hover:bg-secondary">
            <Upload className="h-4 w-4" /> Upload creative
            <input type="file" accept="image/*,video/mp4" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) addCreative(file, newCreativeAspect); e.target.value = ""; }} />
          </label>
        </div>
      </div>

      <div>
        <Label>Campaign stat screenshots</Label>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          {(f.campaign_stat_images ?? []).map((s, i) => (
            <div key={i} className="rounded-xl border border-border p-3">
              <img src={s.url} alt="" className="w-full rounded-md" />
              <Input className="mt-2" placeholder="Caption" value={s.caption ?? ""} onChange={(e) => {
                const next = [...(f.campaign_stat_images ?? [])]; next[i] = { ...s, caption: e.target.value }; up("campaign_stat_images", next);
              }} />
              <Button size="sm" variant="destructive" className="mt-2 w-full" onClick={() => up("campaign_stat_images", (f.campaign_stat_images ?? []).filter((_, x) => x !== i))}><Trash2 className="h-3 w-3" /> Remove</Button>
            </div>
          ))}
        </div>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-primary hover:underline">
          <Upload className="h-4 w-4" /> Upload stats image
          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) addStatImage(file); e.target.value = ""; }} />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Switch checked={f.published ?? true} onCheckedChange={(v) => up("published", v)} />
        <span className="text-sm text-ink">{f.published ? "Published (visible on site)" : "Draft (hidden)"}</span>
      </div>
      <div>
        <Label>Sort order</Label>
        <Input type="number" value={f.sort_order ?? 0} onChange={(e) => up("sort_order", parseInt(e.target.value) || 0)} />
      </div>
      </div>
    </div>
  );
}
