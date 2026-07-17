import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, uploadMedia, DEFAULTS, type CaseStudyRow } from "@/lib/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { LogOut, Save, Upload, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — CMS" }, { name: "robots", content: "noindex" }] }),
});

const SECTION_KEYS = ["site","hero","bio","stats","services","stack","industries","testimonials","faqs","experience","process","avatar_messages"] as const;
type SectionKey = typeof SECTION_KEYS[number];

function AdminPage() {
  const nav = useNavigate();
  const { data: auth, isLoading } = useIsAdmin();

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
      <header className="sticky top-0 z-10 border-b border-border bg-white/80 backdrop-blur">
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

      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <Tabs defaultValue="hero">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="hero">Hero & Images</TabsTrigger>
            <TabsTrigger value="sections">Site sections</TabsTrigger>
            <TabsTrigger value="cases">Case studies</TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className="mt-6">
            <HeroImagesEditor />
          </TabsContent>
          <TabsContent value="sections" className="mt-6">
            <SectionsEditor />
          </TabsContent>
          <TabsContent value="cases" className="mt-6">
            <CaseStudiesManager />
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

  async function save() {
    const { error } = await supabase.from("site_settings").upsert({ key: "hero", data: state as never });
    if (error) return toast.error(error.message);
    toast.success("Saved");
    qc.invalidateQueries();
  }

  async function pick(field: "image_url" | "avatar_url", file: File) {
    try {
      const url = await uploadMedia(file, field === "avatar_url" ? "avatar" : "hero");
      setState({ ...state!, [field]: url });
      toast.success("Uploaded — click Save");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 space-y-6">
      <h2 className="font-display text-2xl font-bold text-ink">Hero content & images</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <ImagePickerRow label="Homepage hero photo" url={state.image_url} onPick={(f) => pick("image_url", f)} onClear={() => setState({ ...state, image_url: null })} />
        <ImagePickerRow label="Scroll avatar photo" url={state.avatar_url} onPick={(f) => pick("avatar_url", f)} onClear={() => setState({ ...state, avatar_url: null })} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Eyebrow" value={state.eyebrow} onChange={(v) => setState({ ...state, eyebrow: v })} />
        <Field label="Sub-heading" value={state.sub} onChange={(v) => setState({ ...state, sub: v })} textarea />
        <Field label="Heading — lead" value={state.headingLead} onChange={(v) => setState({ ...state, headingLead: v })} />
        <Field label="Heading — italic word" value={state.headingItalic} onChange={(v) => setState({ ...state, headingItalic: v })} />
        <Field label="Heading — tail" value={state.headingTail} onChange={(v) => setState({ ...state, headingTail: v })} textarea />
      </div>

      <Button onClick={save}><Save className="h-4 w-4" /> Save hero</Button>
    </div>
  );
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      {textarea
        ? <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
        : <Input value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

function ImagePickerRow({ label, url, onPick, onClear }: { label: string; url: string | null; onPick: (f: File) => void; onClear: () => void }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm font-semibold text-ink mb-3">{label}</p>
      {url ? (
        <div className="relative">
          <img src={url} alt="" className="h-40 w-full rounded-lg object-cover" />
          <Button size="sm" variant="destructive" className="absolute top-2 right-2" onClick={onClear}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ) : (
        <div className="grid place-items-center h-40 rounded-lg bg-secondary text-body-light text-sm">Using default</div>
      )}
      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-primary hover:underline">
        <Upload className="h-4 w-4" /> Upload
        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); }} />
      </label>
    </div>
  );
}

// ============= Sections JSON editor =============
function SectionsEditor() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-body">Each section is stored as JSON. Edit the values below, keep the structure intact, and save.</p>
      {SECTION_KEYS.filter((k) => k !== "hero").map((k) => <SectionCard key={k} sectionKey={k} />)}
    </div>
  );
}

function SectionCard({ sectionKey }: { sectionKey: SectionKey }) {
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

function CaseStudiesManager() {
  const qc = useQueryClient();
  const { data: cases, refetch } = useQuery({
    queryKey: ["admin", "cases"],
    queryFn: async () => {
      const { data, error } = await supabase.from("case_studies").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as unknown as CaseStudyRow[];
    },
  });
  const [editing, setEditing] = useState<EditableCase | null>(null);

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
              <Button size="sm" variant="outline" onClick={() => setEditing({ ...c, platforms_text: c.platforms.join(", "), tags_text: c.tags.join(", ") })}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => del(c.id!)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </div>
        ))}
        {(!cases || cases.length === 0) && <p className="py-6 text-sm text-body-light">No case studies yet.</p>}
      </div>
    </div>
  );
}

function CaseEditor({ value, onCancel, onSaved }: { value: EditableCase; onCancel: () => void; onSaved: () => void }) {
  const [f, setF] = useState<EditableCase>(value);

  function up<K extends keyof EditableCase>(k: K, v: EditableCase[K]) { setF({ ...f, [k]: v }); }

  async function save() {
    const payload = {
      slug: (f.slug || "").trim(),
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

  async function addCreative(file: File) {
    try {
      const url = await uploadMedia(file, "cases/creatives");
      const type: "image" | "video" = file.type.startsWith("video") ? "video" : "image";
      up("ad_creatives", [...(f.ad_creatives ?? []), { url, type, caption: "" }]);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
  }

  async function addStatImage(file: File) {
    try {
      const url = await uploadMedia(file, "cases/stats");
      up("campaign_stat_images", [...(f.campaign_stat_images ?? []), { url, caption: "" }]);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">{f.id ? "Edit" : "New"} case study</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={save}><Save className="h-4 w-4" /> Save</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Slug (URL)" value={f.slug || ""} onChange={(v) => up("slug", v)} />
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

      <div>
        <Label>Results / KPIs (JSON: [{"{"}label, value{"}"}, ...])</Label>
        <Textarea rows={5} className="font-mono text-xs" value={JSON.stringify(f.results ?? [], null, 2)}
          onChange={(e) => { try { up("results", JSON.parse(e.target.value)); } catch { /* ignore */ } }} />
      </div>

      <div>
        <Label>Cover image</Label>
        <ImagePickerRow label="Cover" url={f.cover_image_url || null} onPick={uploadCover} onClear={() => up("cover_image_url", null)} />
      </div>

      <div>
        <Label>Funnel HTML embed</Label>
        <Textarea rows={6} className="font-mono text-xs" value={f.funnel_html || ""} onChange={(e) => up("funnel_html", e.target.value)} placeholder="<iframe src='...'></iframe> or full HTML" />
      </div>

      <div>
        <Label>Ad creatives (images + videos)</Label>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {(f.ad_creatives ?? []).map((m, i) => (
            <div key={i} className="rounded-xl border border-border p-3">
              {m.type === "video"
                ? <video src={m.url} controls className="aspect-[9/16] w-full bg-black rounded-md" />
                : <img src={m.url} alt="" className="aspect-[4/5] w-full rounded-md object-cover" />}
              <Input className="mt-2" placeholder="Caption" value={m.caption ?? ""} onChange={(e) => {
                const next = [...(f.ad_creatives ?? [])]; next[i] = { ...m, caption: e.target.value }; up("ad_creatives", next);
              }} />
              <Button size="sm" variant="destructive" className="mt-2 w-full" onClick={() => up("ad_creatives", (f.ad_creatives ?? []).filter((_, x) => x !== i))}><Trash2 className="h-3 w-3" /> Remove</Button>
            </div>
          ))}
        </div>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-primary hover:underline">
          <Upload className="h-4 w-4" /> Upload creative (image or mp4)
          <input type="file" accept="image/*,video/mp4" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) addCreative(file); e.target.value = ""; }} />
        </label>
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

      <div className="flex items-center gap-3">
        <Switch checked={f.published ?? true} onCheckedChange={(v) => up("published", v)} />
        <span className="text-sm text-ink">{f.published ? "Published (visible on site)" : "Draft (hidden)"}</span>
      </div>
      <div>
        <Label>Sort order</Label>
        <Input type="number" value={f.sort_order ?? 0} onChange={(e) => up("sort_order", parseInt(e.target.value) || 0)} />
      </div>
    </div>
  );
}
