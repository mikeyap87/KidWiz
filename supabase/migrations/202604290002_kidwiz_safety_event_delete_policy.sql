-- Allow parent-owned cloud deletion to remove AI safety event rows.

drop policy if exists "KidWiz parents can delete their safety events"
  on public.kidwiz_ai_safety_events;

create policy "KidWiz parents can delete their safety events"
  on public.kidwiz_ai_safety_events
  for delete
  using (auth.uid() = owner_id);
