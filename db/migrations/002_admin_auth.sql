-- ============================================================
-- 002_admin_auth.sql — Admin user accounts + session tokens
-- ============================================================
-- Run with:  node --env-file=.env.local scripts/migrate.mjs
-- ============================================================

create table if not exists public.admin_users (
  id              text primary key default gen_random_uuid()::text,
  email           text not null unique,
  password_hash   text not null,
  full_name       text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  last_login_at   timestamptz
);

create index if not exists idx_admin_users_email on public.admin_users(lower(email));

-- Server-side session tokens (HTTP-only cookie value points here)
create table if not exists public.admin_sessions (
  id           text primary key default gen_random_uuid()::text,
  admin_id     text not null references public.admin_users(id) on delete cascade,
  token        text not null unique,
  user_agent   text,
  ip_address   text,
  expires_at   timestamptz not null,
  created_at   timestamptz not null default now()
);

create index if not exists idx_admin_sessions_token on public.admin_sessions(token);
create index if not exists idx_admin_sessions_expires on public.admin_sessions(expires_at);

-- Sweeper for expired sessions (call from a cron later)
create or replace function public.cleanup_expired_admin_sessions()
returns integer
language plpgsql
as $$
declare
  n integer;
begin
  delete from public.admin_sessions where expires_at < now() returning 1 into n;
  return coalesce(n, 0);
end;
$$;
