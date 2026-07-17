-- Client reviews: public can submit; only approved reviews are public-readable; admin moderates.

CREATE TABLE public.client_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  quote TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.client_reviews TO anon, authenticated;
GRANT INSERT ON public.client_reviews TO anon, authenticated;
GRANT UPDATE, DELETE ON public.client_reviews TO authenticated;
GRANT ALL ON public.client_reviews TO service_role;

ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;

-- Force non-admin inserts to stay unapproved (prevents spoofing approved=true)
CREATE OR REPLACE FUNCTION public.force_review_unapproved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.approved := false;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER client_reviews_force_unapproved
BEFORE INSERT ON public.client_reviews
FOR EACH ROW EXECUTE FUNCTION public.force_review_unapproved();

CREATE POLICY "public read approved reviews"
  ON public.client_reviews FOR SELECT
  USING (approved = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "anyone can submit review"
  ON public.client_reviews FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(trim(name)) > 0 AND char_length(trim(quote)) > 0);

CREATE POLICY "admin update reviews"
  ON public.client_reviews FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin delete reviews"
  ON public.client_reviews FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
