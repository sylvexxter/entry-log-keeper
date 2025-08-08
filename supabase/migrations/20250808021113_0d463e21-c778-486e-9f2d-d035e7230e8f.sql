
-- Enable extension for UUID generation (safe if already enabled)
create extension if not exists "pgcrypto";

-- Create table to store submissions
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  created_at timestamptz not null default now(),
  constraint content_not_blank check (length(btrim(content)) > 0)
);

-- Enable Row Level Security
alter table public.submissions enable row level security;

-- Allow public read access
drop policy if exists "Public can read submissions" on public.submissions;
create policy "Public can read submissions"
  on public.submissions
  for select
  using (true);

-- Allow public insert access
drop policy if exists "Public can insert submissions" on public.submissions;
create policy "Public can insert submissions"
  on public.submissions
  for insert
  with check (true);

-- Helpful index for ordering by newest first
create index if not exists submissions_created_at_idx on public.submissions (created_at desc);
