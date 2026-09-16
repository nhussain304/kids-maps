-- Run once in this project's Supabase SQL editor.
-- Only a grown-up's authenticated account can read/write its own progress.
create table if not exists public.kids_map_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint known_missions_only check (completed <@ array['kindness','teamwork','courage','nature','listening','quiz']::text[])
);
alter table public.kids_map_progress enable row level security;
revoke all on public.kids_map_progress from anon;
grant select, insert, update on public.kids_map_progress to authenticated;
create policy "Read own Kids Map progress" on public.kids_map_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own Kids Map progress" on public.kids_map_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own Kids Map progress" on public.kids_map_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Atomic set union prevents progress loss when two devices sync together.
create or replace function public.sync_kids_map_progress(p_completed text[])
returns text[] language sql security invoker set search_path = '' as $$
  insert into public.kids_map_progress as progress (user_id, completed)
  values ((select auth.uid()), array(select distinct unnest(p_completed)))
  on conflict (user_id) do update
  set completed = array(select distinct unnest(progress.completed || excluded.completed)),
      updated_at = now()
  returning completed;
$$;
revoke all on function public.sync_kids_map_progress(text[]) from public, anon;
grant execute on function public.sync_kids_map_progress(text[]) to authenticated;
