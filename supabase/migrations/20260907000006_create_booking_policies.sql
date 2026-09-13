-- Milestone 4A — booking_policies
--
-- Mirrors the policy categories already shown (as explicit placeholders)
-- on the marketing site's Policies accordion (src/config/business.js).
-- `body` is left NULL here too — no policy text is invented in this
-- migration; only Emmanuelle's confirmed wording should ever populate it.
-- Not yet wired into the UI (PoliciesSection still reads business.js in
-- this milestone) — this table exists so a future milestone can move
-- policy content into the database without a schema change.

create table if not exists public.booking_policies (
  id text primary key,
  title text not null,
  body text,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

comment on table public.booking_policies is
  'Booking policy categories. body stays NULL until Emmanuelle confirms real policy text — never populated with invented content.';

alter table public.booking_policies enable row level security;

create policy "booking policies are publicly readable"
  on public.booking_policies for select
  using (true);
