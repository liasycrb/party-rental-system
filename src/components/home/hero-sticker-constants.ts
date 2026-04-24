/** Shared PNG paths for Lias/CRB hero stickers (not catalog PDP). */
export const HERO_PNG = {
  castle: "/party-rentals/mobile/castle-jumper.png",
  combo: "/party-rentals/mobile/combo-slide.png",
  theme: "/party-rentals/mobile/theme-jumper.png",
  toddler: "/party-rentals/mobile/toddler-unit.png",
} as const;

export const HERO_CAROUSEL_STICKERS: {
  src: string;
  label: string;
  alt: string;
}[] = [
  { src: HERO_PNG.castle, label: "Castle Jumper", alt: "Castle jumper inflatable" },
  { src: HERO_PNG.combo, label: "Combo Slide", alt: "Combo slide inflatable" },
  { src: HERO_PNG.theme, label: "Theme Jumper", alt: "Theme jumper inflatable" },
  { src: HERO_PNG.toddler, label: "Toddler Unit", alt: "Toddler unit inflatable" },
];

/** Desktop hero (md+ right column): one image at a time, auto-rotates. */
export const HERO_DESKTOP_ROTATE_LIAS: { src: string; alt: string }[] = [
  { src: HERO_PNG.castle, alt: "Castle jumper inflatable" },
  { src: HERO_PNG.combo, alt: "Combo slide inflatable" },
  { src: HERO_PNG.theme, alt: "Theme jumper inflatable" },
];

export const HERO_DESKTOP_ROTATE_CRB: { src: string; alt: string }[] = [
  { src: HERO_PNG.combo, alt: "Combo slide inflatable" },
  { src: HERO_PNG.castle, alt: "Castle jumper inflatable" },
  { src: HERO_PNG.toddler, alt: "Toddler unit inflatable" },
];
