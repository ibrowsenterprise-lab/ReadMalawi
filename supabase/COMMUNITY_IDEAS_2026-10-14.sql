-- Community suggestions: anonymous intake, private moderation, approved ideas only in public.
CREATE TABLE public.readmalawi_community_ideas (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 category text NOT NULL CHECK (category IN ('books','website','learning','community','other')),
 body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 20 AND 1200),
 consent boolean NOT NULL CHECK (consent),
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','declined')),
 response text NOT NULL DEFAULT '' CHECK (char_length(response)<=600),
 created_at timestamptz NOT NULL DEFAULT now(),
 reviewed_at timestamptz
);
CREATE UNIQUE INDEX readmalawi_ideas_body_unique ON public.readmalawi_community_ideas (md5(lower(regexp_replace(btrim(body),'\s+',' ','g'))));
CREATE INDEX readmalawi_ideas_review_queue ON public.readmalawi_community_ideas (status,created_at DESC);
CREATE INDEX readmalawi_ideas_created ON public.readmalawi_community_ideas (created_at);
ALTER TABLE public.readmalawi_community_ideas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.readmalawi_community_ideas FROM anon,authenticated;
GRANT SELECT ON public.readmalawi_community_ideas TO anon,authenticated;
GRANT INSERT(category,body,consent) ON public.readmalawi_community_ideas TO anon,authenticated;
GRANT UPDATE(status,response) ON public.readmalawi_community_ideas TO authenticated;
CREATE POLICY "approved ideas are public" ON public.readmalawi_community_ideas FOR SELECT TO anon,authenticated USING (status='approved');
CREATE POLICY "ideas arrive privately" ON public.readmalawi_community_ideas FOR INSERT TO anon,authenticated WITH CHECK (status='pending' AND response='' AND reviewed_at IS NULL AND consent);
CREATE POLICY "librarians review ideas" ON public.readmalawi_community_ideas FOR SELECT TO authenticated USING (readmalawi_private.is_readmalawi_admin());
CREATE POLICY "librarians update ideas" ON public.readmalawi_community_ideas FOR UPDATE TO authenticated USING (readmalawi_private.is_readmalawi_admin()) WITH CHECK (readmalawi_private.is_readmalawi_admin());
CREATE FUNCTION readmalawi_private.guard_community_idea() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NEW.body ~* '(https?://|www\.|@|\+?[0-9][0-9 ()-]{8,}[0-9])' OR NEW.response ~* '(https?://|www\.|@|\+?[0-9][0-9 ()-]{8,}[0-9])' THEN
  RAISE EXCEPTION 'Please remove links, email addresses and phone numbers.' USING ERRCODE='22023';
 END IF;
 IF TG_OP='INSERT' THEN
  IF NEW.status<>'pending' OR NEW.response<>'' OR NEW.reviewed_at IS NOT NULL THEN
   RAISE EXCEPTION 'New suggestions must await review.' USING ERRCODE='42501';
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('readmalawi_community_ideas_intake'));
  IF (SELECT count(*) FROM public.readmalawi_community_ideas WHERE created_at>now()-interval '1 hour')>=40 OR
     (SELECT count(*) FROM public.readmalawi_community_ideas WHERE created_at>now()-interval '1 day')>=200 THEN
   RAISE EXCEPTION 'Suggestions are busy. Please try again later.' USING ERRCODE='P0001';
  END IF;
  NEW.body=btrim(NEW.body);NEW.created_at=statement_timestamp();NEW.id=gen_random_uuid();
 ELSE
  IF NOT readmalawi_private.is_readmalawi_admin() THEN RAISE EXCEPTION 'Librarian permission required.' USING ERRCODE='42501';END IF;
  IF NEW.id<>OLD.id OR NEW.body<>OLD.body OR NEW.category<>OLD.category OR NEW.created_at<>OLD.created_at OR NEW.consent<>OLD.consent THEN
   RAISE EXCEPTION 'Submitted ideas cannot be rewritten.' USING ERRCODE='42501';
  END IF;
  NEW.reviewed_at=statement_timestamp();
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION readmalawi_private.guard_community_idea() FROM PUBLIC;
CREATE TRIGGER guard_community_idea BEFORE INSERT OR UPDATE ON public.readmalawi_community_ideas FOR EACH ROW EXECUTE FUNCTION readmalawi_private.guard_community_idea();
