-- ReadMalawi Community Library (pilot)
-- Run in a NEW Supabase project via SQL Editor.
-- IMPORTANT: read SETUP_LIBRARY.md before executing.
-- The bucket stays PRIVATE. File metadata alone never makes a file public.
create extension if not exists pgcrypto;

create table if not exists public.readmalawi_admins(
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.readmalawi_trusted_publishers(
  user_id uuid primary key references auth.users(id) on delete cascade,
  reviewed_at timestamptz not null default now()
);
alter table public.readmalawi_admins enable row level security;
alter table public.readmalawi_trusted_publishers enable row level security;

create or replace function public.is_readmalawi_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.readmalawi_admins where user_id=auth.uid()); $$;

create policy "admins can inspect admin list" on public.readmalawi_admins
 for select to authenticated using (public.is_readmalawi_admin());
create policy "admins can inspect trusted list" on public.readmalawi_trusted_publishers
 for select to authenticated using (public.is_readmalawi_admin());
create policy "admins manage trusted publishers" on public.readmalawi_trusted_publishers
 for all to authenticated using (public.is_readmalawi_admin())
 with check (public.is_readmalawi_admin());

create table if not exists public.library_books (
 id uuid primary key default gen_random_uuid(),
 uploaded_by uuid not null references auth.users(id) on delete cascade,
 title text not null check (char_length(title) between 1 and 240),
 author text not null check (char_length(author) between 1 and 180),
 description text not null default '',
 category text not null check (category in ('Fiction','Education','History','Children','Religion','Technology','Language','Science','Poetry','Biography','Other')),
 language text not null check (char_length(language) between 2 and 80),
 origin text not null check (origin in ('Malawian','International')),
 media_type text not null check (media_type in ('ebook','audiobook')),
 access_mode text not null check (access_mode in ('download','online_only')),
 rights_basis text not null check (rights_basis in ('public_domain','open_licence','original_creator','authorised','unknown')),
 rights_url text,
 attested_rights boolean not null default false,
 file_path text not null unique,
 mime_type text not null,
 status text not null default 'pending' check (status in ('pending','approved','rejected','removed')),
 verified_rights boolean not null default false,
 submitted_at timestamptz not null default now(),
 reviewed_at timestamptz,
 reviewer_id uuid references auth.users(id)
);
create index if not exists idx_library_books_public on public.library_books(status,category,media_type);
create index if not exists idx_library_books_text on public.library_books using gin(to_tsvector('simple',title||' '||author||' '||description));

-- Users cannot set their own publication status via the client.
-- A previously verified "trusted publisher" may automatically publish a
-- rights-attested NON-MALAWIAN work with a traceable licence/permission.
-- ALL Malawian works require explicit moderator review.
create or replace function public.readmalawi_prepare_submission()
returns trigger language plpgsql security definer set search_path=public as $$
declare trusted boolean;
begin
 trusted := exists(select 1 from public.readmalawi_trusted_publishers t where t.user_id=auth.uid());
 new.uploaded_by := auth.uid();
 new.status := 'pending';
 new.verified_rights := false;
 new.reviewed_at := null;
 new.reviewer_id := null;
 if new.origin='International' and trusted and new.attested_rights
    and new.rights_basis in ('public_domain','open_licence','original_creator','authorised')
    and coalesce(length(trim(new.rights_url)),0)>8 then
    new.status := 'approved';
    new.verified_rights := true;
    new.reviewed_at := now();
 end if;
 return new;
end $$;
drop trigger if exists trg_prepare_submission on public.library_books;
create trigger trg_prepare_submission before insert on public.library_books
for each row execute function public.readmalawi_prepare_submission();

alter table public.library_books enable row level security;
create policy "browse only rights-verified approved books" on public.library_books
 for select to anon,authenticated
 using ((status='approved' and verified_rights) or uploaded_by=auth.uid() or public.is_readmalawi_admin());
create policy "signed in users submit book metadata" on public.library_books
 for insert to authenticated
 with check (
 uploaded_by=auth.uid()
 and rights_basis in ('public_domain','open_licence','original_creator','authorised','unknown')
 and split_part(file_path,'/',1)=auth.uid()::text
 and ((media_type='ebook' and mime_type in ('application/pdf','application/epub+zip'))
  or (media_type='audiobook' and mime_type in ('audio/mpeg','audio/mp4','audio/ogg','audio/wav')))
 );
create policy "admins moderate submitted books" on public.library_books
 for update to authenticated using(public.is_readmalawi_admin())
 with check(public.is_readmalawi_admin());
create policy "admins remove book metadata" on public.library_books
 for delete to authenticated using(public.is_readmalawi_admin());

create table if not exists public.book_requests(
 id uuid primary key default gen_random_uuid(),
 requested_by uuid not null references auth.users(id) on delete cascade,
 title text not null check(char_length(title) between 2 and 240),
 author text,
 language text,
 notes text,
 status text not null default 'open' check (status in ('open','in_progress','fulfilled','closed')),
 created_at timestamptz not null default now()
);
alter table public.book_requests enable row level security;
create policy "public can browse requests" on public.book_requests
 for select to anon,authenticated using(true);
create policy "signed in users request a book" on public.book_requests
 for insert to authenticated with check (requested_by=auth.uid() and status='open');
create policy "admins update requests" on public.book_requests
 for update to authenticated using(public.is_readmalawi_admin())
 with check(public.is_readmalawi_admin());

create table if not exists public.book_request_offers(
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.book_requests(id) on delete cascade,
 offered_by uuid not null references auth.users(id) on delete cascade,
 message text not null check(char_length(message) between 5 and 1200),
 created_at timestamptz not null default now()
);
alter table public.book_request_offers enable row level security;
create policy "admins or author view assistance offers" on public.book_request_offers
 for select to authenticated
 using(public.is_readmalawi_admin() or offered_by=auth.uid());
create policy "members can offer to help" on public.book_request_offers
 for insert to authenticated with check(offered_by=auth.uid());

-- This is PRIVATE. Do not flip to public even for downloadable books:
-- the future MK500 limit must be enforced by an authenticated server endpoint.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('readmalawi-library','readmalawi-library',false,52428800,
 array['application/pdf','application/epub+zip','audio/mpeg','audio/mp4','audio/ogg','audio/wav'])
on conflict(id) do update set public=false,file_size_limit=52428800,
allowed_mime_types=excluded.allowed_mime_types;

create policy "members can upload into their own folder" on storage.objects
 for insert to authenticated with check(
 bucket_id='readmalawi-library'
 and (storage.foldername(name))[1]=auth.uid()::text
 and lower(storage.extension(name)) in ('pdf','epub','mp3','m4a','ogg','wav')
);
create policy "owners and verified-approved book readers access files" on storage.objects
 for select to anon,authenticated using(
 bucket_id='readmalawi-library' and (
 (storage.foldername(name))[1]=auth.uid()::text
 or public.is_readmalawi_admin()
 or exists(select 1 from public.library_books b where b.file_path=name
  and b.status='approved' and b.verified_rights)
 )
);

-- No DELETE/UPDATE grants for ordinary storage objects.
-- Submissions of uncertain rights are held pending and PRIVATE; they cannot be published until documentation is verified.
-- Before activating paid downloads: implement SERVER-SIDE entitlements and
-- download counts, restrict issuing signed URLs, and record verified payments.
-- Read-only controls suppress a download button but cannot provide DRM.

-- Applied after initial database setup: move the RLS administrator check outside the exposed public API schema.
-- PostgreSQL tracks dependent RLS policies when the function changes schema.
create schema if not exists readmalawi_private;
revoke all on schema readmalawi_private from public;
grant usage on schema readmalawi_private to anon, authenticated;
alter function public.is_readmalawi_admin() set schema readmalawi_private;
revoke all on function readmalawi_private.is_readmalawi_admin() from public;
grant execute on function readmalawi_private.is_readmalawi_admin() to anon, authenticated;
-- Migration: move_readmalawi_admin_check_out_of_public_api
