-- Run this once in Supabase SQL Editor for project bhdykiqnczktmntxgbbl
-- https://supabase.com/dashboard/project/bhdykiqnczktmntxgbbl/sql/new

-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created_grant_admin
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_admin();

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "admin write site_settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  industry TEXT,
  client TEXT,
  country TEXT,
  duration TEXT,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  summary TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  challenge TEXT,
  goal TEXT,
  strategy TEXT,
  outcome TEXT,
  funnel_html TEXT,
  ad_creatives JSONB NOT NULL DEFAULT '[]'::jsonb,
  campaign_stat_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover_image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.case_studies TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.case_studies TO authenticated;
GRANT ALL ON public.case_studies TO service_role;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published cs" ON public.case_studies FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin write cs" ON public.case_studies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER case_studies_updated_at BEFORE UPDATE ON public.case_studies FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "admin insert media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- Seed site_settings
INSERT INTO public.site_settings (key, data) VALUES
('site', '{"name":"Rao Hamza Saif","role":"Performance Marketer","tagline":"Paid Ads · Media Buyer · Funnel Strategist · CRM & Automation","email":"hello@raohamzasaif.com","whatsapp":"+92 300 0000000","location":"Lahore, Pakistan · Working Globally","hours":"Mon–Sat · 10:00–19:00 PKT","social":[{"label":"LinkedIn","href":"https://linkedin.com"},{"label":"Instagram","href":"https://instagram.com"},{"label":"X / Twitter","href":"https://x.com"},{"label":"WhatsApp","href":"https://wa.me/923000000000"}]}'),
('hero', '{"eyebrow":"Available for select projects — Q3 2026","headingLead":"I build","headingItalic":"revenue engines","headingTail":"for brands that spend seriously.","sub":"7-figure paid media, funnel systems, and automation stacks — engineered for scale, tracked to the last click.","image_url":null,"avatar_url":null}'),
('bio', '{"title":"The short version","body":"I''m a performance marketer who runs high-budget ad accounts across Meta, Google, TikTok and native. My work sits at the intersection of media buying, funnel strategy, tracking infrastructure, and CRM automation — the boring stuff that makes campaigns actually profitable."}'),
('stats', '{"items":[{"value":"42","suffix":"M+","label":"Ad spend managed"},{"value":"11","suffix":"","label":"Verticals shipped"},{"value":"3.4","suffix":"x","label":"Avg. ROAS lift"},{"value":"60","suffix":"+","label":"Funnels built"}]}'),
('services', '{"items":[{"tag":"01","title":"Paid Media Buying","desc":"Meta, Google, TikTok, YouTube, LinkedIn — full-funnel campaign architecture at scale."},{"tag":"02","title":"Funnel Strategy","desc":"Offer, landing, upsell, retention. Built for the metric that actually matters."},{"tag":"03","title":"Tracking & Attribution","desc":"GTM, GA4, CAPI, server-side. So you stop guessing what worked."},{"tag":"04","title":"CRM & Automation","desc":"GHL, HubSpot, Zoho, n8n, Zapier — lead flows that don''t leak."},{"tag":"05","title":"Creative Strategy","desc":"Angles, hooks, UGC direction. Creative is the new targeting."},{"tag":"06","title":"Growth Consulting","desc":"Fractional performance leadership for teams scaling past $100k/mo."}]}'),
('stack', '{"items":[{"cat":"Ad Platforms","items":["Meta Ads","Google Ads","TikTok Ads","Snapchat Ads","LinkedIn Ads","YouTube Ads"]},{"cat":"Tracking","items":["Meta Pixel","Conversions API","Google Tag Manager","GA4","Looker Studio","Trackbox"]},{"cat":"Web & CMS","items":["Shopify","WordPress","React"]},{"cat":"Automation","items":["Zapier","n8n","Make"]},{"cat":"CRM","items":["HubSpot","Go High Level","Zoho CRM"]},{"cat":"AI Copilots","items":["ChatGPT","Claude","Gemini"]}]}'),
('industries', '{"items":[{"slug":"real-estate","name":"Real Estate","short":"Lead-gen funnels for developers and brokers.","metric":"4.1x","metricLabel":"ROAS · 90d"},{"slug":"ecommerce","name":"Ecommerce","short":"Scaled DTC brands past 7-figures/mo.","metric":"$8.2M","metricLabel":"revenue tracked"},{"slug":"womens-fashion","name":"Women''s Fashion","short":"Creative-led scaling for apparel labels.","metric":"62%","metricLabel":"CAC reduction"},{"slug":"forex","name":"Forex","short":"Compliant funnels for regulated markets.","metric":"$14","metricLabel":"avg. CPL"},{"slug":"prop-trading","name":"Prop Trading","short":"Trader acquisition at global scale.","metric":"3.6x","metricLabel":"ROAS · YTD"},{"slug":"casino","name":"iGaming / Casino","short":"High-velocity FTD funnels across regions.","metric":"22%","metricLabel":"conv. rate"},{"slug":"healthcare","name":"Healthcare","short":"Patient acquisition and appointment flows.","metric":"$22","metricLabel":"avg. CPL"},{"slug":"b2b","name":"B2B SaaS","short":"Pipeline-first campaigns and MQL scoring.","metric":"2.9x","metricLabel":"SQL growth"},{"slug":"lead-generation","name":"Lead Generation","short":"Multi-vertical performance lead ops.","metric":"70k+","metricLabel":"leads / yr"},{"slug":"affiliate","name":"Affiliate","short":"Native and paid social for offers.","metric":"1.8x","metricLabel":"EPC"},{"slug":"local","name":"Local Businesses","short":"Geo-targeted acquisition for services.","metric":"5.2x","metricLabel":"ROAS"}]}'),
('testimonials', '{"items":[{"quote":"Hamza is the kind of operator you plug in and forget about. Numbers just move.","name":"M. Farooq","title":"Founder · DTC Apparel"},{"quote":"The tracking rebuild alone paid for the engagement in a month.","name":"S. Khan","title":"Head of Growth · Prop Firm"},{"quote":"Sharpest media buyer we''ve worked with. Ships fast, communicates faster.","name":"A. Rehman","title":"CMO · Real Estate Group"}]}'),
('faqs', '{"items":[{"q":"What''s your minimum engagement?","a":"I work with brands spending $30k+/mo on paid media, or teams committing to a 90-day build."},{"q":"Do you work retainer or project?","a":"Both. Most engagements are 3–6 month retainers; funnel and tracking builds can be scoped as fixed-price sprints."},{"q":"Do you handle creative production?","a":"Strategy and direction yes — production runs through my UGC and editor roster."},{"q":"Which industries do you avoid?","a":"Anything I can''t run cleanly on Meta and Google policy. I''ll tell you on the intro call."},{"q":"How fast can you start?","a":"Onboarding kicks off within a week of contract. First campaigns typically live in 10–14 days."}]}'),
('experience', '{"items":[{"year":"2024–now","role":"Independent Performance Consultant","org":"Direct clients across UAE, US, EU"},{"year":"2022–2024","role":"Head of Paid Media","org":"Global prop trading firm"},{"year":"2020–2022","role":"Senior Media Buyer","org":"DTC and lead-gen agencies"},{"year":"2018–2020","role":"Digital Marketer","org":"Started running local & affiliate campaigns"}]}'),
('process', '{"items":[{"step":"01","title":"Audit","body":"Accounts, tracking, funnels, CRM. Nothing sacred."},{"step":"02","title":"Blueprint","body":"Offer, funnel, media plan, KPIs, reporting."},{"step":"03","title":"Build","body":"Pixels, CAPI, dashboards, automations — first."},{"step":"04","title":"Launch","body":"Structured campaign rollout with creative testing loops."},{"step":"05","title":"Scale","body":"Weekly optimization cadence, monthly strategy review."}]}'),
('avatar_messages', '{"items":["Scroll down — the good stuff''s below 👇","Peep the case studies section.","Numbers don''t lie 📊","Still scrolling? Respect.","Almost there — grab a coffee ☕","Say hi on the contact page 👋"]}'),
('footer', '{"ctaEyebrow":"Let''s talk","ctaLine1":"Got a budget","ctaLine2Prefix":"and a ","ctaHighlight":"problem","ctaLine2Suffix":"?","ctaButtonText":"Start a project","ctaButtonLink":"/contact","navLabel":"Navigation","navLinks":[{"label":"Home","to":"/"},{"label":"Case Studies","to":"/case-studies"},{"label":"About","to":"/about"},{"label":"Contact","to":"/contact"}],"socialLabel":"Elsewhere","social":[{"label":"LinkedIn","href":"https://linkedin.com"},{"label":"Instagram","href":"https://instagram.com"},{"label":"X / Twitter","href":"https://x.com"},{"label":"WhatsApp","href":"https://wa.me/923000000000"}],"location":"Lahore, Pakistan · Working Globally","hours":"Mon–Sat · 10:00–19:00 PKT","bottomTagline":"Built with intent · not templates."}');

-- Seed case studies
INSERT INTO public.case_studies (slug, title, industry, client, country, duration, platforms, summary, tags, results, challenge, goal, strategy, outcome, sort_order) VALUES
('real-estate','Scaling a developer''s launch to 40M in pre-sales','Real Estate','Confidential · GCC Developer','UAE','9 months',
 ARRAY['Meta Ads','Google Ads','TikTok Ads','GHL'],
 'Rebuilt the entire acquisition stack for a high-ticket property launch — from creative angles to a fully instrumented CRM.',
 ARRAY['Lead Gen','High-Ticket','CRM'],
 '[{"label":"Qualified leads","value":"12,400+"},{"label":"Cost per lead","value":"$9.10"},{"label":"Pipeline value","value":"$40M"},{"label":"ROAS","value":"4.1x"}]'::jsonb,
 'Existing campaigns were burning budget on unqualified traffic. Sales couldn''t tell which ads produced booked calls.',
 'Cut CPL by 50% while shipping a source-of-truth pipeline the sales team would actually trust.',
 'Rebuilt tracking with server-side CAPI, launched creative testing framework across 4 angles, migrated CRM to GHL with automated lead scoring.',
 'Pipeline hit $40M in 9 months with a stable CPL under $10 across two markets.', 1),
('ecommerce','DTC apparel: from $80k to $1.1M / mo','Ecommerce','Confidential · US DTC brand','USA','6 months',
 ARRAY['Meta Ads','TikTok Ads','Klaviyo'],
 'Creative-led scaling with a modular UGC pipeline and post-purchase automation.',
 ARRAY['DTC','UGC','Retention'],
 '[{"label":"Monthly revenue","value":"$1.1M"},{"label":"Blended ROAS","value":"3.8x"},{"label":"Email revenue","value":"31%"},{"label":"New customer CAC","value":"-42%"}]'::jsonb,
 'Plateaued at $80k/mo with rising CAC and a single hero creative doing all the work.',
 'Break the ceiling without destroying margin.',
 'Ran a 4-angle creative test weekly, built a UGC roster, layered post-purchase flows and a win-back sequence in Klaviyo.',
 'Hit $1.1M in month 6 with blended ROAS above 3.5x.', 2),
('prop-trading','Prop firm trader acquisition across 3 continents','Prop Trading','Confidential · Global prop firm','Global','12 months',
 ARRAY['Meta Ads','Google Ads','YouTube','n8n'],
 'Geo-segmented funnels and CRM automation for challenge purchases.',
 ARRAY['Global','Funnels','Automation'],
 '[{"label":"Challenges sold","value":"38,000+"},{"label":"Blended ROAS","value":"3.6x"},{"label":"Countries live","value":"24"},{"label":"Avg. CPA","value":"$46"}]'::jsonb,
 'One generic funnel serving 20+ countries with wildly different intent.',
 'Localize without exploding operational overhead.',
 'Built a modular funnel template with 3 regional variants, automated lead scoring and drip via n8n, tightened creative to trader psychographics.',
 'Sustained 3.6x ROAS while doubling markets served.', 3);

-- Client reviews (public submit, admin moderate)
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

CREATE OR REPLACE FUNCTION public.force_review_unapproved()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

CREATE POLICY "public read approved reviews" ON public.client_reviews FOR SELECT
  USING (approved = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "anyone can submit review" ON public.client_reviews FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(trim(name)) > 0 AND char_length(trim(quote)) > 0);
CREATE POLICY "admin update reviews" ON public.client_reviews FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete reviews" ON public.client_reviews FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

