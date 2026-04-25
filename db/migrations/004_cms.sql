-- ============================================================
-- 004_cms.sql — Editable landing-page content (hero + offers)
-- ============================================================
-- Lets admins change the hero banner image and manage the offers
-- carousel without redeploying. The public site reads these via
-- /api/cms/landing.
--
-- Run via:  node --env-file=.env.local scripts/migrate.mjs
-- ============================================================

create table if not exists public.cms_landing (
  id                text primary key default 'main',
  hero_image_url    text,
  hero_eyebrow      text,
  hero_title_line1  text,
  hero_title_line2  text,
  hero_subtitle     text,
  show_ticker       boolean not null default true,
  show_offers       boolean not null default true,
  offers_heading    text,
  offers_subtitle   text,
  updated_at        timestamptz not null default now(),
  updated_by        text
);

-- Seed a single 'main' landing-page row with sensible defaults.
insert into public.cms_landing (
  id, hero_image_url, hero_eyebrow,
  hero_title_line1, hero_title_line2, hero_subtitle,
  show_ticker, show_offers,
  offers_heading, offers_subtitle
) values (
  'main',
  'https://images.unsplash.com/photo-1756020897176-8c381b24d276?auto=format&fit=crop&w=1920&q=75',
  null,
  null, null, null,
  true, true,
  'Today''s offers',
  'Limited-time deals across our most-loved routes.'
)
on conflict (id) do nothing;

-- ─── Offer cards ────────────────────────────────────────────

create table if not exists public.cms_offers (
  id            text primary key default gen_random_uuid()::text,
  title         text not null,
  description   text,
  image_url     text,
  badge         text,
  accent_color  text default '#1a3a8f',
  cta_label     text,
  cta_url       text,
  starts_at     timestamptz,
  expires_at    timestamptz,
  sort_order    integer not null default 100,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  updated_by    text
);

create index if not exists idx_cms_offers_active_sort on public.cms_offers(is_active, sort_order);

-- Seed a few starter offers (only inserted if table is empty)
insert into public.cms_offers (id, title, description, image_url, badge, accent_color, cta_label, cta_url, sort_order)
select * from (values
  ('offer-bangalore-chennai-flat',
   'Flat ₹100 off · Bengaluru → Chennai',
   'Tonight only. Use code MIDNIGHT100 at checkout. Valid on AC Sleeper trips.',
   'https://images.unsplash.com/photo-1724992609079-75164f1ba2dd?auto=format&fit=crop&w=800&q=75',
   'Limited time',
   '#dc2626',
   'Book now',
   '/search?from=city-blr&to=city-chn',
   10),
  ('offer-goa-weekend',
   'Weekend Goa · Beach trips from ₹649',
   'Soak up Goa with our Friday and Saturday departures from Bengaluru and Mumbai.',
   'https://images.unsplash.com/photo-1695453463057-aa5d48d9e3d4?auto=format&fit=crop&w=800&q=75',
   'Weekend',
   '#f59e0b',
   'Plan your trip',
   '/search?from=city-blr&to=city-goa',
   20),
  ('offer-rideclub',
   'Earn 5% RideCoins · Always',
   'Members get 5% back on every booking, plus priority boarding and 24×7 support.',
   'https://images.unsplash.com/photo-1657856855186-7cf4909a4f78?auto=format&fit=crop&w=800&q=75',
   'Loyalty',
   '#1a3a8f',
   'Join free',
   '/login',
   30)
) AS t(id, title, description, image_url, badge, accent_color, cta_label, cta_url, sort_order)
where not exists (select 1 from public.cms_offers limit 1);
