/**
 * Canonical customer and payment phone numbers (display + link helpers).
 * UI should read `BRANDS[*].supportPhone*` for primary contact and use
 * `BRAND_CONTACT.payments` for Zelle — do not duplicate numbers elsewhere.
 */
export const BRAND_CONTACT = {
  lias: {
    primaryPhone: "(951) 259-4444",
    secondaryPhone: "(951) 259-4484",
  },
  crb: {
    primaryPhone: "(951) 425-6480",
  },
  payments: {
    /** Zelle enrollment / payments — shared by both brands */
    zelle: "(951) 259-4484",
  },
} as const;

/** Digits only (for `wa.me/{digits}` etc.). */
export function phoneDigitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

/**
 * `(951) …` or `951…` → E.164 `+1…` when possible (for `tel:` / APIs).
 */
export function toSupportE164(displayOrE164: string): string {
  if (displayOrE164.startsWith("+")) return displayOrE164;
  const d = phoneDigitsOnly(displayOrE164);
  if (d.length === 11 && d[0] === "1") return `+${d}`;
  if (d.length === 10) return `+1${d}`;
  return `+${d}`;
}
