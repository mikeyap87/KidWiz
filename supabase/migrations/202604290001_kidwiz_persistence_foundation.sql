-- KidWiz production persistence foundation.
-- Apply this in Supabase only after reviewing the privacy/retention policy.

create extension if not exists pgcrypto;

create or replace function public.set_kidwiz_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.kidwiz_family_workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  family_name text not null default 'KidWiz Family',
  state_version integer not null default 1,
  app_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

create table if not exists public.kidwiz_ai_safety_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.kidwiz_family_workspaces(id) on delete cascade,
  child_id text,
  event_key text not null,
  status text not null,
  source text,
  lesson_title text,
  prompt_excerpt text,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, event_key)
);

drop trigger if exists set_kidwiz_family_workspaces_updated_at
  on public.kidwiz_family_workspaces;
create trigger set_kidwiz_family_workspaces_updated_at
  before update on public.kidwiz_family_workspaces
  for each row execute function public.set_kidwiz_updated_at();

drop trigger if exists set_kidwiz_ai_safety_events_updated_at
  on public.kidwiz_ai_safety_events;
create trigger set_kidwiz_ai_safety_events_updated_at
  before update on public.kidwiz_ai_safety_events
  for each row execute function public.set_kidwiz_updated_at();

alter table public.kidwiz_family_workspaces enable row level security;
alter table public.kidwiz_ai_safety_events enable row level security;

drop policy if exists "KidWiz parents can read their workspace"
  on public.kidwiz_family_workspaces;
create policy "KidWiz parents can read their workspace"
  on public.kidwiz_family_workspaces
  for select
  using (auth.uid() = owner_id);

drop policy if exists "KidWiz parents can insert their workspace"
  on public.kidwiz_family_workspaces;
create policy "KidWiz parents can insert their workspace"
  on public.kidwiz_family_workspaces
  for insert
  with check (auth.uid() = owner_id);

drop policy if exists "KidWiz parents can update their workspace"
  on public.kidwiz_family_workspaces;
create policy "KidWiz parents can update their workspace"
  on public.kidwiz_family_workspaces
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "KidWiz parents can delete their workspace"
  on public.kidwiz_family_workspaces;
create policy "KidWiz parents can delete their workspace"
  on public.kidwiz_family_workspaces
  for delete
  using (auth.uid() = owner_id);

drop policy if exists "KidWiz parents can read their safety events"
  on public.kidwiz_ai_safety_events;
create policy "KidWiz parents can read their safety events"
  on public.kidwiz_ai_safety_events
  for select
  using (auth.uid() = owner_id);

drop policy if exists "KidWiz parents can insert their safety events"
  on public.kidwiz_ai_safety_events;
create policy "KidWiz parents can insert their safety events"
  on public.kidwiz_ai_safety_events
  for insert
  with check (auth.uid() = owner_id);

drop policy if exists "KidWiz parents can update their safety events"
  on public.kidwiz_ai_safety_events;
create policy "KidWiz parents can update their safety events"
  on public.kidwiz_ai_safety_events
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create index if not exists kidwiz_family_workspaces_owner_updated_idx
  on public.kidwiz_family_workspaces (owner_id, updated_at desc);

create index if not exists kidwiz_ai_safety_events_owner_child_idx
  on public.kidwiz_ai_safety_events (owner_id, child_id, updated_at desc);
