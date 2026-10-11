-- Reference only: this migration was applied via Supabase on 2026-10-11.
-- Do not manually rerun it in production.
-- This table tracks private human reviews; it NEVER publishes translation drafts.
create table if not exists public.readmalawi_translation_reviews (
 story_key text primary key,
 title_en text not null,
 title_ny_draft text not null,
 language text not null default 'ny' check (language='ny'),
 status text not null default 'needs_reviewer'
  check(status in ('needs_reviewer','under_review','changes_needed','approved')),
 reviewer_name text not null default '',
 reviewer_notes text not null default '',
 meaning_checked boolean not null default false,
 language_checked boolean not null default false,
 quiz_checked boolean not null default false,
 corrected_copy_received boolean not null default false,
 review_date date,
 updated_at timestamptz not null default now(),
 constraint review_signoff check (status <> 'approved' or
 (length(btrim(reviewer_name))>=2 and meaning_checked and language_checked and
 quiz_checked and corrected_copy_received and review_date is not null)),
 constraint limited_review_text check (length(reviewer_name)<=140 and length(reviewer_notes)<=5000)
);
alter table public.readmalawi_translation_reviews enable row level security;
revoke all on public.readmalawi_translation_reviews from anon;
revoke all on public.readmalawi_translation_reviews from authenticated;
grant select, update on public.readmalawi_translation_reviews to authenticated;
create policy "Translation reviews are private to ReadMalawi admins"
 on public.readmalawi_translation_reviews for select to authenticated
 using (readmalawi_private.is_readmalawi_admin());
create policy "Only ReadMalawi admins update translation reviews"
 on public.readmalawi_translation_reviews for update to authenticated
 using (readmalawi_private.is_readmalawi_admin())
 with check (readmalawi_private.is_readmalawi_admin());
insert into public.readmalawi_translation_reviews(story_key,title_en,title_ny_draft) values
('bench', 'The Book on the Bench', 'Buku pa Benchi'),
('seedjar', 'The Seed Jar', 'Mitsuko ya Mbewu'),
('rainclub', 'The Rainy Day Book Club', 'Gulu Lowerengera Mabuku pa Tsiku la Mvula'),
('cleanstream', 'Thoko and the Clean Stream', 'Thoko ndi Kamtsinje Koyera'),
('librarybag', 'A Library in a Bag', 'Laibulale M’chikwama'),
('marketpuzzle', 'Tadala''s Market Puzzle', 'Funso la Masamu la Tadala pa Msika'),
('rainnotebook', 'The Blue Rain Notebook', 'Kope Labuluu la Mvula'),
('wordbasket', 'Grandmother''s Word Basket', 'Dengu la Mawu la Agogo'),
('secretcode', 'The Message That Asked for a Code', 'Uthenga Wopempha Nambala Yachinsinsi'),
('missingpencil', 'The Missing Pencil', 'Pensulo Yosowa')
on conflict (story_key) do nothing;
