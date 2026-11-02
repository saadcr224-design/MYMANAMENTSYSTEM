-- The prior Google super-admin authorization has been removed.
drop policy if exists approved_google_owner_enrollment on public.sl_members;
revoke insert on public.sl_members from authenticated;
