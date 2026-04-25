-- ============================================================
-- 005_cms_sections.sql — Shopify-inspired CMS for the public site
-- ============================================================
-- Models a page as an ordered list of "sections", where each section
-- has typed settings (JSONB) plus optional repeatable "blocks" (also
-- JSONB). Mirrors Shopify's theme architecture so admins can:
--   - Add / remove / reorder sections per page
--   - Edit section settings (image, headline, etc.)
--   - For sections that allow blocks (e.g. offers, features), add /
--     remove / reorder individual cards
--
-- The TS layer (src/lib/cms-schema.ts) defines what settings each
-- section/block type accepts — the database stays schema-flexible.
-- ============================================================

-- Drop the older simple cms_landing / cms_offers tables if they exist
drop table if exists public.cms_offers   cascade;
drop table if exists public.cms_landing  cascade;

-- ─── Sections — page-level ordered building blocks ─────────────
create table if not exists public.cms_sections (
  id          text primary key default gen_random_uuid()::text,
  page        text not null default 'home',  -- 'home', 'about', 'corporate', etc.
  type        text not null,                  -- matches sectionDefs[].type in TS
  position    integer not null default 100,
  settings    jsonb   not null default '{}',
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  updated_by  text
);

create index if not exists idx_cms_sections_page_pos
  on public.cms_sections(page, position);

-- ─── Blocks — repeatable items inside a section ────────────────
create table if not exists public.cms_blocks (
  id          text primary key default gen_random_uuid()::text,
  section_id  text not null references public.cms_sections(id) on delete cascade,
  type        text not null,                  -- e.g. 'offer-card', 'testimonial'
  position    integer not null default 100,
  settings    jsonb   not null default '{}',
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_cms_blocks_section_pos
  on public.cms_blocks(section_id, position);

-- ─── Seed default home page (only if empty) ───────────────────

DO $$
DECLARE
  hero_id   text;
  offers_id text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.cms_sections WHERE page = 'home' LIMIT 1) THEN

    -- Hero
    INSERT INTO public.cms_sections (page, type, position, settings)
    VALUES (
      'home', 'hero', 10,
      jsonb_build_object(
        'image_url',   'https://images.unsplash.com/photo-1756020897176-8c381b24d276?auto=format&fit=crop&w=1920&q=75',
        'eyebrow',     'Trusted by 2M+ travellers across India',
        'title_line1', 'Travel in Comfort,',
        'title_line2', 'Arrive in Style',
        'subtitle',    'Premium intercity bus travel across India. Volvo & Scania coaches, live tracking, and an on-time guarantee — or your money back.',
        'show_ticker', true
      )
    )
    RETURNING id INTO hero_id;

    -- Offers section
    INSERT INTO public.cms_sections (page, type, position, settings)
    VALUES (
      'home', 'offers', 20,
      jsonb_build_object(
        'heading',  'Today''s offers',
        'subtitle', 'Limited-time deals across our most-loved routes.'
      )
    )
    RETURNING id INTO offers_id;

    -- Three starter offer-card blocks
    INSERT INTO public.cms_blocks (section_id, type, position, settings) VALUES
      (offers_id, 'offer-card', 10, jsonb_build_object(
        'title',        'Flat ₹100 off · Bengaluru → Chennai',
        'description',  'Tonight only. Use code MIDNIGHT100 at checkout. Valid on AC Sleeper trips.',
        'image_url',    'https://images.unsplash.com/photo-1724992609079-75164f1ba2dd?auto=format&fit=crop&w=800&q=75',
        'badge',        'Limited time',
        'accent_color', '#dc2626',
        'cta_label',    'Book now',
        'cta_url',      '/search?from=city-blr&to=city-chn'
      )),
      (offers_id, 'offer-card', 20, jsonb_build_object(
        'title',        'Weekend Goa · Beach trips from ₹649',
        'description',  'Soak up Goa with our Friday and Saturday departures from Bengaluru and Mumbai.',
        'image_url',    'https://images.unsplash.com/photo-1695453463057-aa5d48d9e3d4?auto=format&fit=crop&w=800&q=75',
        'badge',        'Weekend',
        'accent_color', '#f59e0b',
        'cta_label',    'Plan your trip',
        'cta_url',      '/search?from=city-blr&to=city-goa'
      )),
      (offers_id, 'offer-card', 30, jsonb_build_object(
        'title',        'Earn 5% RideCoins · Always',
        'description',  'Members get 5% back on every booking, plus priority boarding and 24×7 support.',
        'image_url',    'https://images.unsplash.com/photo-1657856855186-7cf4909a4f78?auto=format&fit=crop&w=800&q=75',
        'badge',        'Loyalty',
        'accent_color', '#1a3a8f',
        'cta_label',    'Join free',
        'cta_url',      '/login'
      ));
  END IF;
END
$$;
