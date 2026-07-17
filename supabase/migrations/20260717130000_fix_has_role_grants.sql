-- Fix: RLS policies call has_role() but EXECUTE was revoked from anon/authenticated,
-- which breaks public case_study reads and admin CMS writes.
-- has_role is SECURITY DEFINER and safe to expose for policy evaluation.

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;

-- Ensure media bucket exists for admin image uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;
