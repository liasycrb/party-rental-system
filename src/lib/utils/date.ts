/**
 * UTC-safe date arithmetic for ISO `YYYY-MM-DD` strings.
 * Avoids local timezone / DST shifts at month, year, and DST boundaries.
 */
export function addDaysUTC(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const ms = Date.UTC(y, (m ?? 1) - 1, d ?? 1) + days * 86_400_000;
  const dt = new Date(ms);
  const yyyy = dt.getUTCFullYear().toString().padStart(4, "0");
  const mm = (dt.getUTCMonth() + 1).toString().padStart(2, "0");
  const dd = dt.getUTCDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
