/**
 * When a `src` under /public is missing, `CatalogImage` swaps to these URLs (client `onError`).
 * Add an entry for each local path you introduce in demo data.
 */
export const LOCAL_PUBLIC_IMAGE_FALLBACKS: Record<string, string> = {
  "/party-rentals/shared/hero-bounce-house.jpg":
    "https://images.unsplash.com/photo-1566576729106-7964fcc8a866?w=1200&h=1500&fit=crop&q=80",
  "/party-rentals/shared/rainbow-castle.jpg":
    "https://images.unsplash.com/photo-1566576729106-7964fcc8a866?w=1200&h=1500&fit=crop&q=80",
  "/party-rentals/shared/tropical-combo.jpg":
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&h=900&fit=crop&q=80",
  "/party-rentals/shared/experience-moment-03.jpg":
    "https://images.unsplash.com/photo-1464366400600-7161ecd9ec52?w=1200&h=900&fit=crop&q=80",
};
