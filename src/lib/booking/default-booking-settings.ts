/**
 * Hardcoded booking-rule defaults. Used as a safety fallback when the
 * booking_settings RPC fails or returns no row. Keep these in sync with the
 * migration defaults (20260521120000_booking_settings.sql).
 */

export type BookingSettings = {
  /** Item subtotal a customer must meet before they can continue to checkout. */
  minimumOrderAmount: number;
  /** ISO timestamp of the last dashboard save, or null when serving hardcoded defaults. */
  updatedAt: string | null;
};

export const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  minimumOrderAmount: 80,
  updatedAt: null,
};
