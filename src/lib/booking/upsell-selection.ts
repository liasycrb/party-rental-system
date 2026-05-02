/** Upsell line items persisted on `bookings.addons` as `upsellSelections`. */

export type UpsellSelection = {
  productId: string;
  slug: string;
  name: string;
  qty: number;
  /** Listing unit estimate used for deposits; staff confirms final pricing. */
  priceFrom: number | null;
};
