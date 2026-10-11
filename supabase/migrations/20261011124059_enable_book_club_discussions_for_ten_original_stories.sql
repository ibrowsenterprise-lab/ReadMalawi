-- ReadMalawi Supabase migration applied to the dedicated production project on 2026-10-11.
-- Synchronises server-side comment moderation with ten original on-site stories.
-- DO NOT reapply to the active project: Supabase migration history already records this.
-- Existing controls for authentication, pending-only submission, rights checks,
-- same-book approved-parent replies, unsafe links and anti-spam remain unchanged.
--
-- This modifies only the permitted book ID pattern inside the existing trigger
-- function. It intentionally raises an error if the expected old rule differs,
-- rather than overwriting newer security changes blindly.
do $readmalawi_migration$
declare
  original_definition text;
  old_pattern constant text := '^(readmalawi:bench|member:[0-9a-f-]{36})$';
  new_pattern constant text := '^(readmalawi:(bench|seedjar|rainclub|cleanstream|librarybag|marketpuzzle|rainnotebook|wordbasket|secretcode|missingpencil)|member:[0-9a-f-]{36})$';
begin
  select pg_get_functiondef('readmalawi_private.validate_book_discussion()'::regprocedure)
    into original_definition;
  if original_definition is null or position(old_pattern in original_definition) = 0 then
    raise exception 'ReadMalawi validation function has changed; review before updating';
  end if;
  execute replace(original_definition, old_pattern, new_pattern);
end
$readmalawi_migration$;
