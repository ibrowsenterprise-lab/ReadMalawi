-- APPLIED to ReadMalawi Supabase project ezejmipymjzfsnemgaig on 13 October 2026.
-- GitHub source-control record of the live prelaunch publication freeze.
-- DO NOT blindly re-run, or automatically drop this trigger in a deploy.
-- Removing this publication freeze requires the founder's explicit final-launch approval.
-- This protects against BOTH individual librarian metadata UPDATE and privileged RPC calls.

create or replace function readmalawi_private.guard_prelaunch_member_publication()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $guard$
begin
  if TG_OP = 'INSERT' then
    if new.status = 'approved' or new.verified_rights then
      raise exception 'Member book publication is disabled during ReadMalawi prelaunch testing.';
    end if;
  elsif TG_OP = 'UPDATE' then
    if (new.status = 'approved' and old.status is distinct from 'approved')
       or (new.verified_rights and old.verified_rights is distinct from true) then
      raise exception 'Member book publication is disabled during ReadMalawi prelaunch testing.';
    end if;
  end if;
  return new;
end;
$guard$;

revoke all on function readmalawi_private.guard_prelaunch_member_publication()
from public, anon, authenticated;

drop trigger if exists readmalawi_prelaunch_member_publication_guard
on public.library_books;

create trigger readmalawi_prelaunch_member_publication_guard
  before insert or update on public.library_books
  for each row
  execute function readmalawi_private.guard_prelaunch_member_publication();

-- VERIFICATION ALREADY PERFORMED in the live database:
--   Trigger installed = true.
--   Attempt to move a pending member book to approved + verified-rights was rejected
--   and automatically rolled back; status counts remained 26 pending / 3 rejected / 0 approved.
--   Private Storage bucket readmalawi-library remains public=false.
--
-- LAUNCH RELEASE PROCEDURE (NOT APPROVED; DO NOT RUN NOW):
--   1. Confirm founder identity, full licence evidence and rights moderation readiness.
--   2. Require a reviewed backend approval process, and founder's explicit launch sign-off.
--   3. Only in a separately approved migration, drop this prelaunch trigger and
--      grant specific publication capability to audited personnel.
--   4. Never bulk-approve 1,793 unverified offline PDF candidates.
