-- The owner explicitly approved this one Google identity.
create policy approved_google_owner_enrollment on public.sl_members
for insert to authenticated
with check (
 user_id=(select auth.uid())
 and lower((select auth.jwt())->>'email')='saadcr224@gmail.com'
 and (select auth.jwt())->'app_metadata'->>'provider'='google'
 and exists(select 1 from jsonb_array_elements(coalesce((select auth.jwt())->'amr','[]'::jsonb)) entry where entry->>'method'='oauth')
);
grant insert on public.sl_members to authenticated;
