-- Run in Supabase SQL editor or via migration tooling.

create table if not exists public.leads (
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	name text not null,
	email text not null,
	phone text,
	company text,
	message text,
	source text not null default 'website',
	user_agent text
);

alter table public.leads enable row level security;

-- Inserts go through the API with the service role key (bypasses RLS).
-- No policies for anon/authenticated direct table access.
