-- READMALAWI: run ONLY in a dedicated Supabase project using SQL Editor.
-- All member-uploaded files remain private until a human reviewer approves sharing rights.
-- Never commit a Supabase service_role key to a public GitHub repository.
create extension if not exists pgcrypto;

create table if not exists public.readmalawi_books (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 180),
  author text not null check (length(trim(author)) between 1 and 150),
  description text not null default '',
  kind text not null check (kind in ('book','audio')),
  category text not null check (category in ('Fiction','Children','Education','History','Science','Poetry','Biography','Language','Other')),
  language text not null check (language in ('English','Chichewa','Chitumbuka','Chiyao','Chilomwe','Chisena','Chitonga','Other')),
  rights_basis text not null check (rights_basis in ('original','licensed','public_domain')),
  rights_evidence text not null check (length(trim(rights_evidence)) between 5 and 1500),
  storage_path text not null unique,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint path_ownership check (storage_path like uploader_id::text || '/%')
);
create index if not exists idx_rm_books_approved on public.readmalawi_books(status,created_at desc);

create table if not exists public.readmalawi_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 180),
  author text not null default '' check (length(author)<=150),
  notes text not null default '' check (length(notes)<=700),
  status text not null default 'open' check (status in ('open','fulfilled','closed')),
  created_at timestamptz not null default now()
);
create index if not exists idx_rm_requests on public.readmalawi_requests(created_at desc);

create table if not exists public.readmalawi_request_offers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.readmalawi_requests(id) on delete cascade,
  helper_id uuid not null references auth.users(id) on delete cascade,
  note text not null check (length(trim(note)) between 1 and 800),
  created_at timestamptz not null default now()
);


-- Restrict public API access to non-sensitive catalogue/request fields.
-- Rights evidence and private offer details must not be broadly exposed via SELECT *.
revoke all on table public.readmalawi_books from anon,authenticated;
grant select(id,uploader_id,title,author,description,kind,category,language,storage_path,status,created_at)
on public.readmalawi_books to anon,authenticated;
grant insert(uploader_id,title,author,description,kind,category,language,rights_basis,rights_evidence,storage_path,status)
on public.readmalawi_books to authenticated;
revoke all on table public.readmalawi_requests from anon,authenticated;
grant select(id,requester_id,title,author,notes,status,created_at)
on public.readmalawi_requests to anon,authenticated;
grant insert(requester_id,title,author,notes,status)
on public.readmalawi_requests to authenticated;
revoke all on table public.readmalawi_request_offers from anon,authenticated;
grant select(id,request_id,helper_id,note,created_at) on public.readmalawi_request_offers to authenticated;
grant insert(request_id,helper_id,note) on public.readmalawi_request_offers to authenticated;

alter table public.readmalawi_books enable row level security;
alter table public.readmalawi_requests enable row level security;
alter table public.readmalawi_request_offers enable row level security;

drop policy if exists "rm_public_read_approved_books" on public.readmalawi_books;
create policy "rm_public_read_approved_books" on public.readmalawi_books
for select to anon,authenticated using (status='approved' or (select auth.uid())=uploader_id);
drop policy if exists "rm_members_submit_pending_books" on public.readmalawi_books;
create policy "rm_members_submit_pending_books" on public.readmalawi_books
for insert to authenticated with check (
  uploader_id=(select auth.uid()) and status='pending'
);

drop policy if exists "rm_public_read_requests" on public.readmalawi_requests;
create policy "rm_public_read_requests" on public.readmalawi_requests
for select to anon,authenticated using (status in ('open','fulfilled') or (select auth.uid())=requester_id);
drop policy if exists "rm_members_make_requests" on public.readmalawi_requests;
create policy "rm_members_make_requests" on public.readmalawi_requests
for insert to authenticated with check (
  requester_id=(select auth.uid()) and status='open'
);

drop policy if exists "rm_member_send_offer" on public.readmalawi_request_offers;
create policy "rm_member_send_offer" on public.readmalawi_request_offers
for insert to authenticated with check(
  helper_id=(select auth.uid()) and exists (
    select 1 from public.readmalawi_requests r
    where r.id=request_id and r.status='open'
  )
);
drop policy if exists "rm_member_read_own_offers" on public.readmalawi_request_offers;
create policy "rm_member_read_own_offers" on public.readmalawi_request_offers
for select to authenticated using(helper_id=(select auth.uid()));
-- Admin reviews pending books and member offers in the authenticated Supabase Dashboard;
-- no public UPDATE/DELETE policies exist. Only trusted service/dashboard users may modify status.

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values
('readmalawi-books','readmalawi-books',false,20971520,ARRAY['application/pdf','application/epub+zip']),
('readmalawi-audio','readmalawi-audio',false,52428800,ARRAY['audio/mpeg','audio/mp4','audio/x-m4a'])
on conflict (id) do update set
public=false,
file_size_limit=excluded.file_size_limit,
allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "rm_auth_upload_ebooks" on storage.objects;
create policy "rm_auth_upload_ebooks" on storage.objects for insert to authenticated
with check (
 bucket_id='readmalawi-books' and (storage.foldername(name))[1]=(select auth.uid())::text
 and lower(storage.extension(name)) in ('pdf','epub')
);
drop policy if exists "rm_auth_upload_audio" on storage.objects;
create policy "rm_auth_upload_audio" on storage.objects for insert to authenticated
with check (
 bucket_id='readmalawi-audio' and (storage.foldername(name))[1]=(select auth.uid())::text
 and lower(storage.extension(name)) in ('mp3','m4a')
);
drop policy if exists "rm_read_approved_and_own_files" on storage.objects;
create policy "rm_read_approved_and_own_files" on storage.objects for select to anon,authenticated
using(
 bucket_id in ('readmalawi-books','readmalawi-audio') and exists(
   select 1 from public.readmalawi_books b
   where b.storage_path=storage.objects.name
   and ((b.kind='audio' and bucket_id='readmalawi-audio')
   or (b.kind='book' and bucket_id='readmalawi-books'))
   and (b.status='approved' or b.uploader_id=(select auth.uid()))
 )
);
-- IMPORTANT: Signed URLs for approved objects allow saving/copying files. A paid-download quota
-- cannot be enforced using only this database or browser JS. Build an audited payment webhook
-- and server-side entitlement service BEFORE enabling paid passes. Limit personal data retention.
-- For production, add malware/file scanning, abuse protection and an infringement-takedown route.
