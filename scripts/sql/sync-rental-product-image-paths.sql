-- Align image URL fields with folder layout:
--   /public/products/{category_slug}/{slug}/main.jpg  → web path /products/{category_slug}/{slug}/main.jpg
--
-- Run after `npm run sync:product-folders` (or compatible script).
-- Review in a staging project first.

begin;

UPDATE public.rental_products
SET
  image_src = '/products/' || category_slug || '/' || slug || '/main.jpg'
WHERE is_active = true;

-- If (and only if) `image_path` exists on `rental_products`, run this in the same transaction:
-- UPDATE public.rental_products
-- SET
--   image_path = '/products/' || category_slug || '/' || slug || '/main.jpg'
-- WHERE is_active = true;

commit;
