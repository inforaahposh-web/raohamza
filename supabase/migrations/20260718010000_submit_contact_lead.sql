-- Allow public contact form to save leads into site_settings without service role.
CREATE OR REPLACE FUNCTION public.submit_contact_lead(p_lead jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_data jsonb;
  items jsonb;
  trimmed jsonb;
BEGIN
  IF p_lead IS NULL
     OR coalesce(trim(p_lead->>'name'), '') = ''
     OR coalesce(trim(p_lead->>'email'), '') = ''
     OR coalesce(trim(p_lead->>'brief'), '') = '' THEN
    RAISE EXCEPTION 'Name, email and brief are required';
  END IF;

  SELECT data INTO current_data FROM public.site_settings WHERE key = 'contact_leads';
  items := coalesce(current_data->'items', '[]'::jsonb);
  IF jsonb_typeof(items) <> 'array' THEN
    items := '[]'::jsonb;
  END IF;

  items := jsonb_build_array(p_lead) || items;
  -- Keep latest 500
  SELECT coalesce(jsonb_agg(elem), '[]'::jsonb)
    INTO trimmed
  FROM (
    SELECT elem
    FROM jsonb_array_elements(items) WITH ORDINALITY AS t(elem, ord)
    ORDER BY ord
    LIMIT 500
  ) s;

  INSERT INTO public.site_settings (key, data)
  VALUES ('contact_leads', jsonb_build_object('items', trimmed))
  ON CONFLICT (key) DO UPDATE
    SET data = excluded.data,
        updated_at = now();

  RETURN p_lead;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_contact_lead(jsonb) TO anon, authenticated;
