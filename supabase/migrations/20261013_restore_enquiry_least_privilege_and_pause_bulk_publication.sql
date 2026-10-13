-- ReadMalawi security audit repair — APPLIED to project ezejmipymjzfsnemgaig on 2026-10-13.
-- Historical source-control record of live grants; do not reapply automatically via old migration runners.
-- This is prelaunch security hardening. All project services remain in TESTING mode.
-- Column-level grants are essential: public visitors may submit but cannot SELECT private enquiries.
-- RLS must remain enabled; policies are not changed by these statements.
revoke all on table public.readmalawi_partnership_enquiries from anon, authenticated;
grant insert (contact_name,contact_email,organisation,country,interest,message,consent)
  on table public.readmalawi_partnership_enquiries to anon,authenticated;
grant select (id,contact_name,contact_email,organisation,country,interest,message,status,created_at,admin_notes)
  on table public.readmalawi_partnership_enquiries to authenticated;
grant update (status,admin_notes)
  on table public.readmalawi_partnership_enquiries to authenticated;
-- RLS still limits SELECT and UPDATE to authorised librarians.
-- Suspend the high-impact book publishing RPC while prelaunch review continues.
-- Authenticated users, even librarians, cannot call it until a separate approved release.
revoke execute on function public.readmalawi_publish_book_batch(uuid[],text,text,boolean)
  from authenticated;

-- Reviewed audit evidence:
-- anon: INSERT contact data=true, table SELECT=false, table UPDATE=false
-- authenticated: SELECT enquiry fields=true, UPDATE status/admin_notes=true,
--                UPDATE contact_email=false, book bulk publish EXECUTE=false.
-- Enquiry count after repair: 1, test-labelled: 1.
