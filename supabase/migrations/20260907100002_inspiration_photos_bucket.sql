-- Milestone 4B — private storage bucket for inspiration photos
--
-- The client never talks to Supabase Storage directly. The create-booking
-- Edge Function (service role) validates the uploaded file server-side and
-- uploads it on the client's behalf, then stores only the object path on
-- the appointment row (see appointments.inspiration_photo_path). Because
-- of that, no anon/authenticated Storage policy is needed or added here —
-- RLS on storage.objects stays fully closed to the public, same posture as
-- the customers/appointments tables.

insert into storage.buckets (id, name, public)
values ('inspiration-photos', 'inspiration-photos', false)
on conflict (id) do nothing;

-- No policies created intentionally: default-deny for anon/authenticated.
-- Only the service role (which bypasses RLS) can read/write this bucket.
