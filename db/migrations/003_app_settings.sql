-- ============================================================
-- 003_app_settings.sql — Key-value app settings
-- ============================================================

create table if not exists public.app_settings (
  key         text primary key,
  value       text,
  updated_at  timestamptz not null default now(),
  updated_by  text
);

-- Sensible defaults so the public site has values to fall back to.
insert into public.app_settings (key, value) values
  ('support_phone',      '1800-123-4567'),
  ('support_email',      'support@nilamadhaba.com'),
  ('support_whatsapp',   '919876543210'),
  ('support_hours',      '24×7'),
  ('booking_window_days','60'),
  ('cancel_free_hours',  '12')
on conflict (key) do nothing;
