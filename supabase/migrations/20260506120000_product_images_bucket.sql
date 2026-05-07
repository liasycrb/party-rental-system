-- Storage bucket for self-service product image uploads from /dashboard/products.
-- Service role uploads only (bypasses RLS). Public read so <img src> works without auth.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'product-images public read'
  ) then
    create policy "product-images public read" on storage.objects
      for select
      to public
      using (bucket_id = 'product-images');
  end if;
end$$;
