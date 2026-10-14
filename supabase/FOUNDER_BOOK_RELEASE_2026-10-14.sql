-- Applied to ReadMalawi on 14 October 2026 after explicit founder approval of the first 100 hosted books.
-- Source record of the applied DDL; do not rerun blindly. The 100-book approval and previous metadata are recorded privately in founder_book_release_log.
-- verified_rights remains false for this founder-authorised batch; founder approval is a separate field.

alter table public.library_books add column founder_release_at timestamptz;
create table readmalawi_private.founder_book_release_log (
 book_id uuid primary key references public.library_books(id),
 approved_at timestamptz not null default now(),
 approval_source text not null,
 previous_metadata jsonb not null
);
alter table readmalawi_private.founder_book_release_log enable row level security;
revoke all on readmalawi_private.founder_book_release_log from public,anon,authenticated;
alter table public.library_books drop constraint readmalawi_publication_requires_rights;
alter table public.library_books add constraint readmalawi_publication_requires_rights check (
 status <> 'approved' or founder_release_at is not null or
 (verified_rights is true and rights_basis in ('public_domain','open_licence','original_creator','authorised'))
);
create or replace function readmalawi_private.guard_prelaunch_member_publication()
returns trigger language plpgsql security invoker set search_path='' as $guard$
begin
 if TG_OP='INSERT' then
  if new.founder_release_at is not null or new.status='approved' or new.verified_rights then
   raise exception 'New member publications remain disabled during prelaunch.';
  end if;
 else
  if new.founder_release_at is distinct from old.founder_release_at and current_user <> 'postgres' then
   raise exception 'Only the administrative founder-release workflow may set release approval.';
  end if;
  if ((new.status='approved' and old.status is distinct from 'approved')
    or (new.verified_rights and old.verified_rights is distinct from true))
    and new.founder_release_at is null then
   raise exception 'Publication requires a specific founder release during prelaunch.';
  end if;
 end if;
 return new;
end $guard$;
revoke all on function readmalawi_private.guard_prelaunch_member_publication() from public,anon,authenticated;
alter policy "browse only rights-verified approved books" on public.library_books to anon,authenticated
using ((status='approved' and (verified_rights or founder_release_at is not null))
 or uploaded_by=auth.uid() or readmalawi_private.is_readmalawi_admin());
alter policy "owners and verified-approved book readers access files" on storage.objects to anon,authenticated
using (bucket_id='readmalawi-library' and (
 (storage.foldername(name))[1]=auth.uid()::text or readmalawi_private.is_readmalawi_admin()
 or exists(select 1 from public.library_books b where b.file_path=name and b.status='approved'
 and (b.verified_rights or b.founder_release_at is not null))));
