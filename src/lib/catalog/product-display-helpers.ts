export function formatCategoryLabelFromSlug(slug: string | null): string {
  if (!slug) return "Party Rental";
  if (slug.toLowerCase() === "disney-jumpers") return "Character Jumpers";
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Listing price: prefer `price_from` when present, else `price`. */
export function effectiveListingPrice(p: {
  price?: number | null;
  price_from?: number | null;
}): number | null {
  const pf =
    typeof p.price_from === "number" && Number.isFinite(p.price_from)
      ? p.price_from
      : null;
  const pr =
    typeof p.price === "number" && Number.isFinite(p.price) ? p.price : null;
  const v = pf ?? pr;
  if (v == null || v <= 0) return null;
  return v;
}

/** e.g. "from $125" */
export function formatFromPriceUsd(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount) || amount <= 0) {
    return "Pricing on request";
  }
  return `from $${Math.round(amount)}`;
}

export function formatUseTypeLabel(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const norm = raw.trim().toLowerCase().replace(/[/\\]+/g, " ").replace(/_/g, " ");
  const t = norm.replace(/\s+/g, " ").trim();
  if (!t) return null;
  if (
    t === "dry wet" ||
    t === "dry or wet" ||
    t === "both" ||
    t === "drywet" ||
    t === "dry and wet"
  ) {
    return "Dry or wet use";
  }
  if (t === "dry") return "Dry use";
  if (t === "wet") return "Wet use";
  return raw.trim();
}

/** First non-empty string among camelCase/snake_case RPC keys. */
export function coalesceTrimString(
  row: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

/** Parse `allowed_surfaces` / `allowedSurfaces` as array, JSON string, or comma-separated. */
export function coalesceSurfacesFromRow(
  row: Record<string, unknown>,
): string[] | null {
  for (const k of ["allowed_surfaces", "allowedSurfaces"] as const) {
    const v = row[k];
    if (Array.isArray(v)) {
      const parts = v.map((x) => String(x).trim()).filter(Boolean);
      if (parts.length) return parts;
    }
    if (typeof v === "string") {
      const t = v.trim();
      if (!t) continue;
      if (t.startsWith("[")) {
        try {
          const parsed = JSON.parse(t) as unknown;
          if (Array.isArray(parsed)) {
            const parts = parsed.map((x) => String(x).trim()).filter(Boolean);
            if (parts.length) return parts;
          }
        } catch {
          /* ignore */
        }
      }
      if (t.includes(",")) {
        const parts = t.split(",").map((s) => s.trim()).filter(Boolean);
        if (parts.length) return parts;
      }
    }
  }
  return null;
}

const INTERNAL_NOTE_PATTERNS: RegExp[] = [
  /corrected\s+spelling/i,
  /missing\s+dimensions/i,
  /internal\s+note/i,
  /staff\s+only/i,
  /admin\s+only/i,
  /do\s+not\s+show/i,
  /\btodo\b/i,
  /\bfixme\b/i,
  /source\s+(sheet|file|csv)/i,
  /cleanup:/i,
  /\[internal\]/i,
  /not\s+for\s+customers?/i,
  /typo\s+fix/i,
];

export function isLikelyInternalProductNote(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return INTERNAL_NOTE_PATTERNS.some((re) => re.test(t));
}

export function customerSafeProductNote(
  notes: string | null | undefined,
): string | null {
  if (notes == null) return null;
  const t = notes.trim();
  if (!t) return null;
  if (isLikelyInternalProductNote(t)) return null;
  return t;
}

export function formatSurfacesList(
  surfaces: string[] | null | undefined,
): string | null {
  if (!Array.isArray(surfaces) || surfaces.length === 0) return null;
  const parts = surfaces.map((s) => String(s).trim()).filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export function splitRulesToLines(rules: string | null | undefined): string[] {
  if (rules == null) return [];
  return rules
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function formatDeliverySummary(args: {
  delivery_included?: boolean | null;
  delivery_fee?: number | null;
}): string | null {
  if (args.delivery_included === true) {
    return "Delivery & setup included with this rental.";
  }
  if (
    typeof args.delivery_fee === "number" &&
    Number.isFinite(args.delivery_fee) &&
    args.delivery_fee > 0
  ) {
    return `A delivery fee may apply (from $${Math.round(args.delivery_fee)}). Final total confirmed at booking.`;
  }
  if (args.delivery_included === false) {
    return "Delivery details and any fees are confirmed when you book.";
  }
  return null;
}
