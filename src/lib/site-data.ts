// Central content source. Structured to map 1:1 to a future CMS schema.
// Every section is data-driven — swap this file for CMS fetches later.

export const site = {
  name: "Rao Hamza Saif",
  role: "Performance Marketer",
  tagline: "Paid Ads · Media Buyer · Funnel Strategist · CRM & Automation",
  email: "hello@raohamzasaif.com",
  whatsapp: "+92 300 0000000",
  location: "Lahore, Pakistan · Working Globally",
  hours: "Mon–Sat · 10:00–19:00 PKT",
  social: [
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "Instagram", href: "https://instagram.com" },
    { label: "X / Twitter", href: "https://x.com" },
    { label: "WhatsApp", href: "https://wa.me/923000000000" },
  ],
};

export const nav = [
  { label: "Home", to: "/" },
  { label: "Case Studies", to: "/case-studies" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

export const hero = {
  eyebrow: "Available for select projects — Q3 2026",
  headingLead: "I build",
  headingItalic: "revenue engines",
  headingTail: "for brands that spend seriously.",
  sub: "7-figure paid media, funnel systems, and automation stacks — engineered for scale, tracked to the last click.",
};

export const bio = {
  title: "The short version",
  body: "I'm a performance marketer who runs high-budget ad accounts across Meta, Google, TikTok and native. My work sits at the intersection of media buying, funnel strategy, tracking infrastructure, and CRM automation — the boring stuff that makes campaigns actually profitable.",
};

export const stats = [
  { value: 42, suffix: "M+", label: "Ad spend managed" },
  { value: 11, suffix: "", label: "Verticals shipped" },
  { value: 3.4, suffix: "x", label: "Avg. ROAS lift" },
  { value: 60, suffix: "+", label: "Funnels built" },
];

export const services = [
  { title: "Paid Media Buying", desc: "Meta, Google, TikTok, YouTube, LinkedIn — full-funnel campaign architecture at scale.", tag: "01" },
  { title: "Funnel Strategy", desc: "Offer, landing, upsell, retention. Built for the metric that actually matters.", tag: "02" },
  { title: "Tracking & Attribution", desc: "GTM, GA4, CAPI, server-side. So you stop guessing what worked.", tag: "03" },
  { title: "CRM & Automation", desc: "GHL, HubSpot, Zoho, n8n, Zapier — lead flows that don't leak.", tag: "04" },
  { title: "Creative Strategy", desc: "Angles, hooks, UGC direction. Creative is the new targeting.", tag: "05" },
  { title: "Growth Consulting", desc: "Fractional performance leadership for teams scaling past $100k/mo.", tag: "06" },
];

export const stack = [
  { cat: "Ad Platforms", items: ["Meta Ads", "Google Ads", "TikTok Ads", "Snapchat Ads", "LinkedIn Ads", "YouTube Ads"] },
  { cat: "Tracking", items: ["Meta Pixel", "Conversions API", "Google Tag Manager", "GA4", "Looker Studio", "Trackbox"] },
  { cat: "Web & CMS", items: ["Shopify", "WordPress", "React"] },
  { cat: "Automation", items: ["Zapier", "n8n", "Make"] },
  { cat: "CRM", items: ["HubSpot", "Go High Level", "Zoho CRM"] },
  { cat: "AI Copilots", items: ["ChatGPT", "Claude", "Gemini"] },
];

export type Industry = {
  slug: string;
  name: string;
  short: string;
  metric: string;
  metricLabel: string;
};

export const industries: Industry[] = [
  { slug: "real-estate", name: "Real Estate", short: "Lead-gen funnels for developers and brokers.", metric: "4.1x", metricLabel: "ROAS · 90d" },
  { slug: "ecommerce", name: "Ecommerce", short: "Scaled DTC brands past 7-figures/mo.", metric: "$8.2M", metricLabel: "revenue tracked" },
  { slug: "womens-fashion", name: "Women's Fashion", short: "Creative-led scaling for apparel labels.", metric: "62%", metricLabel: "CAC reduction" },
  { slug: "forex", name: "Forex", short: "Compliant funnels for regulated markets.", metric: "$14", metricLabel: "avg. CPL" },
  { slug: "prop-trading", name: "Prop Trading", short: "Trader acquisition at global scale.", metric: "3.6x", metricLabel: "ROAS · YTD" },
  { slug: "casino", name: "iGaming / Casino", short: "High-velocity FTD funnels across regions.", metric: "22%", metricLabel: "conv. rate" },
  { slug: "healthcare", name: "Healthcare", short: "Patient acquisition and appointment flows.", metric: "$22", metricLabel: "avg. CPL" },
  { slug: "b2b", name: "B2B SaaS", short: "Pipeline-first campaigns and MQL scoring.", metric: "2.9x", metricLabel: "SQL growth" },
  { slug: "lead-generation", name: "Lead Generation", short: "Multi-vertical performance lead ops.", metric: "70k+", metricLabel: "leads / yr" },
  { slug: "affiliate", name: "Affiliate", short: "Native and paid social for offers.", metric: "1.8x", metricLabel: "EPC" },
  { slug: "local", name: "Local Businesses", short: "Geo-targeted acquisition for services.", metric: "5.2x", metricLabel: "ROAS" },
];

export type CaseStudy = {
  slug: string;
  title: string;
  industry: string;
  client: string;
  country: string;
  duration: string;
  platforms: string[];
  summary: string;
  tags: string[];
  results: { label: string; value: string }[];
  challenge: string;
  goal: string;
  strategy: string;
  outcome: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "real-estate",
    title: "Scaling a developer's launch to 40M in pre-sales",
    industry: "Real Estate",
    client: "Confidential · GCC Developer",
    country: "UAE",
    duration: "9 months",
    platforms: ["Meta Ads", "Google Ads", "TikTok Ads", "GHL"],
    summary: "Rebuilt the entire acquisition stack for a high-ticket property launch — from creative angles to a fully instrumented CRM.",
    tags: ["Lead Gen", "High-Ticket", "CRM"],
    results: [
      { label: "Qualified leads", value: "12,400+" },
      { label: "Cost per lead", value: "$9.10" },
      { label: "Pipeline value", value: "$40M" },
      { label: "ROAS", value: "4.1x" },
    ],
    challenge: "Existing campaigns were burning budget on unqualified traffic. Sales couldn't tell which ads produced booked calls.",
    goal: "Cut CPL by 50% while shipping a source-of-truth pipeline the sales team would actually trust.",
    strategy: "Rebuilt tracking with server-side CAPI, launched creative testing framework across 4 angles, migrated CRM to GHL with automated lead scoring.",
    outcome: "Pipeline hit $40M in 9 months with a stable CPL under $10 across two markets.",
  },
  {
    slug: "ecommerce",
    title: "DTC apparel: from $80k to $1.1M / mo",
    industry: "Ecommerce",
    client: "Confidential · US DTC brand",
    country: "USA",
    duration: "6 months",
    platforms: ["Meta Ads", "TikTok Ads", "Klaviyo"],
    summary: "Creative-led scaling with a modular UGC pipeline and post-purchase automation.",
    tags: ["DTC", "UGC", "Retention"],
    results: [
      { label: "Monthly revenue", value: "$1.1M" },
      { label: "Blended ROAS", value: "3.8x" },
      { label: "Email revenue", value: "31%" },
      { label: "New customer CAC", value: "-42%" },
    ],
    challenge: "Plateaued at $80k/mo with rising CAC and a single hero creative doing all the work.",
    goal: "Break the ceiling without destroying margin.",
    strategy: "Ran a 4-angle creative test weekly, built a UGC roster, layered post-purchase flows and a win-back sequence in Klaviyo.",
    outcome: "Hit $1.1M in month 6 with blended ROAS above 3.5x.",
  },
  {
    slug: "prop-trading",
    title: "Prop firm trader acquisition across 3 continents",
    industry: "Prop Trading",
    client: "Confidential · Global prop firm",
    country: "Global",
    duration: "12 months",
    platforms: ["Meta Ads", "Google Ads", "YouTube", "n8n"],
    summary: "Geo-segmented funnels and CRM automation for challenge purchases.",
    tags: ["Global", "Funnels", "Automation"],
    results: [
      { label: "Challenges sold", value: "38,000+" },
      { label: "Blended ROAS", value: "3.6x" },
      { label: "Countries live", value: "24" },
      { label: "Avg. CPA", value: "$46" },
    ],
    challenge: "One generic funnel serving 20+ countries with wildly different intent.",
    goal: "Localize without exploding operational overhead.",
    strategy: "Built a modular funnel template with 3 regional variants, automated lead scoring and drip via n8n, tightened creative to trader psychographics.",
    outcome: "Sustained 3.6x ROAS while doubling markets served.",
  },
];

export const testimonials = [
  { quote: "Hamza is the kind of operator you plug in and forget about. Numbers just move.", name: "M. Farooq", title: "Founder · DTC Apparel" },
  { quote: "The tracking rebuild alone paid for the engagement in a month.", name: "S. Khan", title: "Head of Growth · Prop Firm" },
  { quote: "Sharpest media buyer we've worked with. Ships fast, communicates faster.", name: "A. Rehman", title: "CMO · Real Estate Group" },
];

export const faqs = [
  { q: "What's your minimum engagement?", a: "I work with brands spending $30k+/mo on paid media, or teams committing to a 90-day build." },
  { q: "Do you work retainer or project?", a: "Both. Most engagements are 3–6 month retainers; funnel and tracking builds can be scoped as fixed-price sprints." },
  { q: "Do you handle creative production?", a: "Strategy and direction yes — production runs through my UGC and editor roster." },
  { q: "Which industries do you avoid?", a: "Anything I can't run cleanly on Meta and Google policy. I'll tell you on the intro call." },
  { q: "How fast can you start?", a: "Onboarding kicks off within a week of contract. First campaigns typically live in 10–14 days." },
];

export const experience = [
  { year: "2024–now", role: "Independent Performance Consultant", org: "Direct clients across UAE, US, EU" },
  { year: "2022–2024", role: "Head of Paid Media", org: "Global prop trading firm" },
  { year: "2020–2022", role: "Senior Media Buyer", org: "DTC and lead-gen agencies" },
  { year: "2018–2020", role: "Digital Marketer", org: "Started running local & affiliate campaigns" },
];

export const process = [
  { step: "01", title: "Audit", body: "Accounts, tracking, funnels, CRM. Nothing sacred." },
  { step: "02", title: "Blueprint", body: "Offer, funnel, media plan, KPIs, reporting." },
  { step: "03", title: "Build", body: "Pixels, CAPI, dashboards, automations — first." },
  { step: "04", title: "Launch", body: "Structured campaign rollout with creative testing loops." },
  { step: "05", title: "Scale", body: "Weekly optimization cadence, monthly strategy review." },
];

export const avatarMessages = [
  "Scroll down — the good stuff's below 👇",
  "Peep the case studies section.",
  "Numbers don't lie 📊",
  "Still scrolling? Respect.",
  "Almost there — grab a coffee ☕",
  "Say hi on the contact page 👋",
];

export const footer = {
  ctaEyebrow: "Let's talk",
  ctaLine1: "Got a budget",
  ctaLine2Prefix: "and a ",
  ctaHighlight: "problem",
  ctaLine2Suffix: "?",
  ctaButtonText: "Start a project",
  ctaButtonLink: "/contact",
  navLabel: "Navigation",
  navLinks: nav.map((n) => ({ label: n.label, to: n.to })),
  socialLabel: "Elsewhere",
  social: site.social.map((s) => ({ ...s })),
  location: site.location,
  hours: site.hours,
  bottomTagline: "Built with intent · not templates.",
};
