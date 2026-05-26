-- ILONAA anonymous product analytics
-- Host your Supabase project in the EU for GDPR-conscious minimal data collection.
-- Apply via Supabase SQL Editor or: supabase db push
--
-- Event names (stored in event_name):
--   landing_view, assessment_started, question_completed, assessment_completed,
--   results_viewed, back_button_used, assessment_abandoned, results_scroll_depth,
--   cta_clicked, results_engagement, recommendation_engaged
--
-- All behavioral detail lives in metadata (jsonb) — no PII, no identity columns.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null,
  event_name text not null,
  metadata jsonb
);

create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_event_name_idx on public.events (event_name);
create index if not exists events_session_id_idx on public.events (session_id);

alter table public.events enable row level security;

drop policy if exists "Allow anonymous event inserts" on public.events;

create policy "Allow anonymous event inserts"
  on public.events
  for insert
  to anon
  with check (true);

grant usage on schema public to anon;
revoke all on public.events from anon;
grant insert on public.events to anon;

-- Do NOT grant SELECT to anon — the client must insert without .select().
