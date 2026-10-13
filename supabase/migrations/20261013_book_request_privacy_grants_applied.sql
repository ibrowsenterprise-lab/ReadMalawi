-- APPLIED to ReadMalawi test Supabase project ezejmipymjzfsnemgaig on 2026-10-13.
-- Historical source-control record; do not blindly rerun when initializing environments.
-- Book requests contain private requested_by auth UID and possibly private notes.
-- Public listing must expose ONLY bibliographic text, public id, status and timestamp.
revoke select on table public.book_requests from anon, authenticated;
grant select (id,title,author,language,status,created_at)
  on table public.book_requests to anon,authenticated;
revoke update on table public.book_requests from authenticated;
grant update (status) on table public.book_requests to authenticated;
-- Keep existing signed-in INSERT rights and RLS: requested_by must equal auth.uid()
-- and status must be 'open'. Status updates remain RLS-restricted to librarians.
-- This change does not create any book requests and does not make private notes public.
--
-- Verified privileges after applying:
-- anon SELECT id/title=true; anon SELECT requested_by/notes=false
-- authenticated SELECT requested_by/notes=false;
-- authenticated INSERT notes=true; UPDATE status=true; UPDATE requested_by=false.
-- 0 book_request records at time of migration. Reader JS queries no hidden fields.
