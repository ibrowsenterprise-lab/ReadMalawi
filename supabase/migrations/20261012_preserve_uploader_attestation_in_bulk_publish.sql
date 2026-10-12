-- Keep contributor attestation unchanged. The admin's bulk rights verification
-- belongs in the private audit log, and must not impersonate uploader consent.
create or replace function public.readmalawi_publish_book_batch(
  p_book_ids uuid[],
  p_rights_basis text,
  p_evidence_reference text,
  p_rights_confirmed boolean
)
returns integer
language plpgsql
security definer
set search_path = ''
as $bulk$
declare
  v_actor uuid := auth.uid();
  v_count integer := coalesce(array_length(p_book_ids,1),0);
  v_distinct integer;
  v_locked integer;
  v_updated integer;
  v_batch uuid := pg_catalog.gen_random_uuid();
  v_evidence text := pg_catalog.btrim(coalesce(p_evidence_reference,''));
begin
  if v_actor is null or not exists (
    select 1 from public.readmalawi_admins a where a.user_id=v_actor
  ) then
    raise exception 'Only an authorised ReadMalawi librarian can publish books.';
  end if;
  if v_count < 1 or v_count > 50 then
    raise exception 'Select between 1 and 50 books per publication action.';
  end if;
  if p_book_ids @> array[null::uuid] or array_position(p_book_ids, null) is not null then
    raise exception 'Invalid book ID.';
  end if;
  select count(distinct u.book_id)::integer into v_distinct
  from unnest(p_book_ids) as u(book_id);
  if v_distinct <> v_count then
    raise exception 'Duplicate book IDs are not allowed.';
  end if;
  if p_rights_basis not in ('original_creator','authorised','open_licence','public_domain')
    or p_rights_basis is null then
    raise exception 'A verified publication-rights basis is required.';
  end if;
  if p_rights_confirmed is distinct from true then
    raise exception 'Librarian must confirm that each selected work has been checked.';
  end if;
  if char_length(v_evidence) < 20 or char_length(v_evidence) > 500 then
    raise exception 'Give a specific rights-evidence reference (20-500 characters) applicable to all selected books.';
  end if;
  perform 1 from public.library_books b where b.id=any(p_book_ids) for update;
  get diagnostics v_locked = row_count;
  if v_locked <> v_count then
    raise exception 'A selected book no longer exists. Refresh and review again.';
  end if;
  if exists (
    select 1 from public.library_books b
    where b.id=any(p_book_ids)
      and (b.status <> 'pending' or b.verified_rights
      or pg_catalog.lower(pg_catalog.btrim(b.title))='profile'
      or pg_catalog.lower(b.title) like '%readmalawi test%'
      or pg_catalog.lower(b.title) ~ '(vacanc(y|ies)|job advertis|company profile|government of malawi|malawi government|gazette|request for quotation|request for proposals|tender notice|invoice)'
      or not exists (
        select 1 from storage.objects o
        where o.bucket_id='readmalawi-library' and o.name=b.file_path
      ))
  ) then
    raise exception 'Selection contains a test, excluded, unverified-state, missing-file, or otherwise ineligible book. Review items individually.';
  end if;
  update public.library_books b
  set status='approved',verified_rights=true,
      rights_basis=p_rights_basis,
      rights_url=case when pg_catalog.left(v_evidence,8)='https://' then v_evidence else null end,
      reviewer_id=v_actor,reviewed_at=now(),
      access_mode='online_only'
  where b.id=any(p_book_ids) and b.status='pending' and not b.verified_rights;
  get diagnostics v_updated = row_count;
  if v_updated <> v_count then
    raise exception 'The requested batch changed during publishing. No partial publication was committed.';
  end if;
  insert into readmalawi_private.book_bulk_publication_log(
    batch_id,book_id,reviewer_id,rights_basis,evidence_reference
  )
  select v_batch,u.book_id,v_actor,p_rights_basis,v_evidence from unnest(p_book_ids) as u(book_id);
  return v_updated;
end
$bulk$;
revoke all on function public.readmalawi_publish_book_batch(uuid[],text,text,boolean) from public, anon;
grant execute on function public.readmalawi_publish_book_batch(uuid[],text,text,boolean) to authenticated;
