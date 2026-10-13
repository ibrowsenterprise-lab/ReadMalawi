-- ReadMalawi TEST physical-book offer register.
-- APPLIED through Supabase apply_migration on 13 October 2026.
-- No real book collection or distribution can be reported through this schema.
-- Donors use a two-input website form that opens WhatsApp; only librarians manually log TEST leads.
create table if not exists public.readmalawi_physical_book_offers (
 id uuid primary key default gen_random_uuid(),
 book_count integer not null check (book_count between 1 and 50000),
 general_area text not null check (char_length(btrim(general_area)) between 2 and 95),
 stage text not null default 'offered_test'
  check (stage in ('offered_test','followup_test','potential_pickup_test','closed_test')),
 internal_note text not null default ''
  check (char_length(internal_note) <= 800),
 logged_by uuid not null default auth.uid() references auth.users(id),
 is_test boolean not null default true check (is_test = true),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.readmalawi_physical_book_offers enable row level security;
revoke all on public.readmalawi_physical_book_offers from public,anon,authenticated;
grant select(id,book_count,general_area,stage,internal_note,logged_by,is_test,created_at,updated_at)
 on public.readmalawi_physical_book_offers to authenticated;
grant insert(book_count,general_area) on public.readmalawi_physical_book_offers to authenticated;
grant update(stage,internal_note,updated_at) on public.readmalawi_physical_book_offers to authenticated;
create policy "readmalawi librarian read test physical offers"
 on public.readmalawi_physical_book_offers for select to authenticated
 using (readmalawi_private.is_readmalawi_admin());
create policy "readmalawi librarian log test physical offers"
 on public.readmalawi_physical_book_offers for insert to authenticated
 with check (readmalawi_private.is_readmalawi_admin()
             and logged_by=(select auth.uid()) and is_test=true and stage='offered_test');
create policy "readmalawi librarian update test followups"
 on public.readmalawi_physical_book_offers for update to authenticated
 using (readmalawi_private.is_readmalawi_admin() and is_test=true)
 with check (readmalawi_private.is_readmalawi_admin() and is_test=true);
create index if not exists readmalawi_physical_offers_created_desc
 on public.readmalawi_physical_book_offers(created_at desc);

-- Verification after migration:
-- RLS enabled; 3 policies; anonymous SELECT/INSERT false.
-- Only authorised authenticated librarian users can read/insert/update by RLS.
-- Authenticated UPDATE of original book_count denied by column grants;
-- DELETE privilege denied; zero existing records; no "collected" or "distributed" allowed.
-- Do not run a future migration that removes the TEST constraints without explicit
-- founder authorisation and separately approved physical collection procedures.
