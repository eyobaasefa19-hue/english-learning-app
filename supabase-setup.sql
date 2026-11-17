-- EyobLingua v37: run this SQL in Supabase Dashboard > SQL Editor.
create table if not exists public.user_learning_data (
  id text not null default 'main',
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
alter table public.user_learning_data enable row level security;
drop policy if exists "Users can read their own learning data" on public.user_learning_data;
create policy "Users can read their own learning data"
on public.user_learning_data for select to authenticated
using (auth.uid() = user_id);
drop policy if exists "Users can insert their own learning data" on public.user_learning_data;
create policy "Users can insert their own learning data"
on public.user_learning_data for insert to authenticated
with check (auth.uid() = user_id);
drop policy if exists "Users can update their own learning data" on public.user_learning_data;
create policy "Users can update their own learning data"
on public.user_learning_data for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
-- No public/anonymous access and no delete policy are granted.
