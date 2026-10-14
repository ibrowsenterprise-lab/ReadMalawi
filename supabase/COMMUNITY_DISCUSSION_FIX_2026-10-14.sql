-- Applied during the community-preview audit. Founder-released books support moderated comments; authentication, review and anti-spam checks remain enforced.
CREATE OR REPLACE FUNCTION readmalawi_private.validate_book_discussion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare parent_status text;
declare parent_book text;
declare parent_reply uuid;
begin
 if tg_op='INSERT' then
   if auth.uid() is null or new.submitted_by is distinct from auth.uid() or new.status<>'pending' then
     raise exception 'Please sign in; new comments need approval';
   end if;
   if new.book_key !~ '^(readmalawi:(bench|seedjar|rainclub|cleanstream|librarybag|marketpuzzle|rainnotebook|wordbasket|secretcode|missingpencil)|member:[0-9a-f-]{36})$' then
     raise exception 'This book is not supported for discussion';
   end if;
   if new.book_key like 'member:%' and not exists (
     select 1 from public.library_books b
     where b.id=substring(new.book_key from 8)::uuid and b.status='approved' and (b.verified_rights or b.founder_release_at is not null)
   ) then raise exception 'This book is not yet available for discussion'; end if;
   if new.reply_to is not null then
     select c.status,c.book_key,c.reply_to into parent_status,parent_book,parent_reply
     from public.readmalawi_book_comments c where c.id=new.reply_to;
     if parent_status is distinct from 'approved' or parent_book is distinct from new.book_key or parent_reply is not null
     then raise exception 'Replies must belong to an approved comment on this book'; end if;
   end if;
   if new.body ~* '(https?://|www[.]|@)' then
     raise exception 'Please do not share links or contact details in discussions';
   end if;
   if exists(select 1 from public.readmalawi_book_comments c
     where c.submitted_by=auth.uid() and c.created_at>now()-interval '30 seconds') then
     raise exception 'Please wait 30 seconds between comments';
   end if;
   if (select count(*) from public.readmalawi_book_comments c where c.submitted_by=auth.uid()
     and c.created_at>now()-interval '15 minutes') >=5 then
     raise exception 'Please wait before posting more comments';
   end if;
 elsif tg_op='UPDATE' then
   if not readmalawi_private.is_readmalawi_admin() then raise exception 'Only librarians can review comments'; end if;
   new.reviewed_at=now();new.reviewed_by=auth.uid();
 end if;
 return new;
end $function$

