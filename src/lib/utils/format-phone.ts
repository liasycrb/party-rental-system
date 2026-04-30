/**
 * Format a raw phone string for display.
 * +19515550123 or 9515550123 → (951) 555-0123
 * Falls back to returning the raw string unchanged when it does not look like a 10/11-digit US number.
 */
export function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits[0] === "1") {
    const d = digits.slice(1);
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

/**
 * Format a raw phone string for use in a tel: href.
 * Ensures E.164 (+1XXXXXXXXXX) when possible; otherwise prepends "+" to all digits.
 */
export function formatPhoneTel(raw: string): string {
  if (raw.startsWith("+")) return raw; // already E.164
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}
