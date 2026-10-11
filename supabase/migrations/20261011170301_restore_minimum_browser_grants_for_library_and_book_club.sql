-- ReadMalawi production migration applied 11 October 2026; recorded for source control.
-- Grants alone never bypass row-level security. Keep RLS enabled on these tables.
-- Live ReadMalawi project already has migration version 20261011170301.
-- DO NOT manually rerun the initial database schema or duplicate migrations.
grant select on table public.readmalawi_admins to authenticated;
grant select on table public.library_books to anon, authenticated;
grant insert, update on table public.library_books to authenticated;
grant select on table public.book_requests to anon, authenticated;
grant insert, update on table public.book_requests to authenticated;
grant select, insert on table public.book_request_offers to authenticated;
grant select on table public.readmalawi_trusted_publishers to authenticated;
grant select on table public.readmalawi_book_comments to anon, authenticated;
grant insert, update on table public.readmalawi_book_comments to authenticated;
grant select, insert, update on table public.readmalawi_book_comment_reports to authenticated;
