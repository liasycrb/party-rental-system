/** Minimal class merge — avoids extra deps; last wins for duplicate Tailwind keys only if ordered intentionally. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
