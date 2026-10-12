-- Applied in Supabase production on 2026-10-12.
-- Safe to review; do not reapply manually to the existing project.
-- Adds enquiry categories only. It does not enable payments or publish books.
alter table public.readmalawi_partnership_enquiries
  drop constraint if exists readmalawi_partnership_enquiries_interest_check;
alter table public.readmalawi_partnership_enquiries
  add constraint readmalawi_partnership_enquiries_interest_check
  check(interest in (
    'donor','sponsor','impact_investor','books_and_resources','volunteer_partner',
    'education_services','ai_services','author_services'
  ));
