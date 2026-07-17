-- Prelanders & funnels showcase library (admin-managed, public read when published)

CREATE TABLE public.funnel_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL CHECK (kind IN ('prelander', 'funnel')),
  html TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.funnel_library TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.funnel_library TO authenticated;
GRANT ALL ON public.funnel_library TO service_role;

ALTER TABLE public.funnel_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read published funnel_library"
  ON public.funnel_library FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin write funnel_library"
  ON public.funnel_library FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER funnel_library_updated_at
BEFORE UPDATE ON public.funnel_library
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
