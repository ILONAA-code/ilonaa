-- ILONAA question-level analytics views
-- Query with service role / Supabase dashboard only — not exposed to anon clients.
-- Apply after 001_create_events.sql once question_completed events are flowing.

create or replace view public.question_completion_stats as
select
  (metadata->>'question_number')::int as question_number,
  metadata->>'question_id' as question_id,
  count(*)::bigint as completions,
  round(avg((metadata->>'time_spent_ms')::numeric), 0) as avg_time_spent_ms,
  round(
    percentile_cont(0.5) within group (
      order by (metadata->>'time_spent_ms')::numeric
    ),
    0
  ) as median_time_spent_ms,
  min(created_at) as first_seen_at,
  max(created_at) as last_seen_at
from public.events
where event_name = 'question_completed'
  and metadata ? 'question_number'
  and metadata ? 'time_spent_ms'
group by 1, 2
order by question_number;

create or replace view public.question_completion_by_device as
select
  (metadata->>'question_number')::int as question_number,
  metadata->>'question_id' as question_id,
  coalesce(metadata->>'device_type', 'unknown') as device_type,
  count(*)::bigint as completions,
  round(avg((metadata->>'time_spent_ms')::numeric), 0) as avg_time_spent_ms
from public.events
where event_name = 'question_completed'
  and metadata ? 'question_number'
  and metadata ? 'device_type'
group by 1, 2, 3
order by question_number, device_type;

create or replace view public.question_friction_signals as
with question_events as (
  select
    (metadata->>'question_number')::int as question_number,
    metadata->>'question_id' as question_id,
    event_name
  from public.events
  where event_name in ('question_completed', 'back_button_used')
    and metadata ? 'question_number'

  union all

  select
    (metadata->>'abandoned_at_question')::int as question_number,
    null::text as question_id,
    event_name
  from public.events
  where event_name = 'assessment_abandoned'
    and metadata ? 'abandoned_at_question'
)
select
  question_number,
  max(question_id) as question_id,
  count(*) filter (where event_name = 'question_completed')::bigint as completions,
  count(*) filter (where event_name = 'back_button_used')::bigint as back_actions,
  count(*) filter (where event_name = 'assessment_abandoned')::bigint as abandonments
from question_events
group by question_number
order by question_number;

-- Restrict public access — analytics views are for internal product intelligence only.
revoke all on public.question_completion_stats from anon, authenticated;
revoke all on public.question_completion_by_device from anon, authenticated;
revoke all on public.question_friction_signals from anon, authenticated;
