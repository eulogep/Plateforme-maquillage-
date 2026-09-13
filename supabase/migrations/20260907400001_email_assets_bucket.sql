-- Milestone 6 (branded email design) — public bucket for email image
-- assets (logo, etc.). Unlike inspiration-photos, this bucket IS public:
-- transactional emails need a real, stable HTTPS URL an email client can
-- fetch directly — there is no "authenticated" way to serve an <img> in an
-- email. Only non-sensitive brand assets (logo) belong here; never
-- customer data.

insert into storage.buckets (id, name, public)
values ('email-assets', 'email-assets', true)
on conflict (id) do nothing;

-- Public read is exactly what "public: true" + no restrictive policy
-- grants by default for a public bucket's objects; writes still require
-- the service role (no anon/authenticated INSERT/UPDATE/DELETE policy is
-- added here), so only server-side code can add/change email assets.
