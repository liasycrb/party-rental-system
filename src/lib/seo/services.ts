/**
 * Service intent layer (Phase 2).
 *
 * Each entry models a *search-intent vertical* (e.g. "jumper rentals", "water
 * slide rentals"). Combined with `cities.ts` and the brand layer, it produces a
 * unique landing page per (service × city × brand) without duplicate content.
 *
 * How duplicate content is avoided across overlapping intents:
 *  - Each service has its own **angle** (`introAngle` / `whyUsAngle` /
 *    `safetyAngle`) — written so jumper / bounce-house / inflatable pages read
 *    differently even when they show similar products.
 *  - H1, title, description, CTA, and FAQs are **template-typed per service**
 *    and rendered with city/brand tokens at compose time.
 *  - `productMatcher` decides which catalog rows belong on each page so a
 *    water-slide page never lists tables, and a table-and-chair page never
 *    lists inflatables.
 *
 * "Near me" intent: handled via `nearMeAware: true` on relevant services —
 * Google resolves "{service} near me" to the user's city, so the existing
 * `/{service}/{city}` URLs already capture it. We deliberately do NOT create
 * separate `/…-near-me/` slugs (that's thin/duplicate content).
 *
 * Adding a service = add one entry here. Adding a seasonal/holiday/audience
 * overlay (Halloween, school events, etc.) is reserved for a future
 * `LandingScope` layer (see `seo-routes.ts`) and does NOT need new services.
 */

import {
  CATEGORY_SLUGS as C,
  // The catalog uses these category_slug values today (audited live). Importing
  // the canonical set keeps service→inventory mapping correct and future-safe.
} from "./catalog-categories";

/** Stable URL-segment slugs for routes (`/{service-slug}/{city}`). */
export type ServiceSlug =
  | "party-rentals"
  | "jumper-rentals"
  | "bounce-house-rentals"
  | "water-slide-rentals"
  | "inflatable-rentals"
  | "table-and-chair-rentals"
  | "obstacle-course-rentals"
  | "dunk-tank-rentals";

/**
 * Search-intent classification — used by composition + future analytics to
 * differentiate angle and cross-link weight.
 *   - "primary"   → bread-and-butter intent (most relevant inventory + traffic)
 *   - "synonym"   → same products, different keyword (e.g. bounce-house ↔ jumper)
 *   - "category"  → umbrella vertical that aggregates multiple primaries
 *   - "specialty" → narrow niche (small inventory, dedicated FAQs)
 */
export type ServiceIntent = "primary" | "synonym" | "category" | "specialty";

/**
 * Whitelist-based predicate for matching products to a service page. Keeping
 * the matcher *declarative* means sitemap/internal-link code can reason about
 * relevance without running TS predicates at SQL/edge time.
 */
export type ServiceProductMatcher =
  | { mode: "all" }
  | { mode: "categoryWhitelist"; categorySlugs: readonly string[] }
  | {
      mode: "categoryWhitelistOrUseType";
      categorySlugs: readonly string[];
      useTypes: readonly ("wet" | "both")[];
    }
  | { mode: "nameContains"; needles: readonly string[] }
  | { mode: "none" };

/** Templates use `{city}`, `{state}`, `{brand}`, `{brandShort}`, `{brandPhone}` tokens. */
export type ServiceTemplates = {
  h1: string;
  title: string;
  description: string;
  heroSubtitle: string;
  ctaPrimary: string;
};

export type ServiceContent = {
  /** First paragraph after the hero — sets the service-specific angle. */
  introAngle: string;
  /** "Why families choose us" angle — differs per service to avoid dup copy. */
  whyUsAngle: string;
  /** Safety paragraph — heavier for inflatables, lighter for tables/chairs. */
  safetyAngle: string;
  /** Heading for the inventory section (e.g. "Popular water slides in {city}"). */
  inventoryHeading: string;
  /**
   * Optional fallback prose shown when zero inventory matches (e.g. dunk tanks
   * before that inventory exists). Honest CTA, never a fake product. Tokens OK.
   */
  emptyInventoryFallback?: string;
};

export type ServiceFaq = {
  /** Question — tokens allowed (e.g. "Do you deliver water slides to {city}?"). */
  q: string;
  a: string;
};

export type Service = {
  slug: ServiceSlug;
  /** Singular noun, e.g. "Jumper Rental". */
  noun: string;
  /** Plural label, e.g. "Jumper Rentals". Used in nav/breadcrumbs. */
  label: string;
  /** Lowercase phrase for inline text, e.g. "jumper rentals". */
  phrase: string;
  intent: ServiceIntent;
  templates: ServiceTemplates;
  content: ServiceContent;
  /** Service-specific FAQs (city-neutral). Combined with city FAQs at render. */
  faqs: readonly ServiceFaq[];
  /** Semantic keyword cluster — feeds meta-keywords analysis + alt prose. */
  semanticKeywords: readonly string[];
  /** Cross-linked sibling services rendered as "Related rentals in {city}". */
  relatedServiceSlugs: readonly ServiceSlug[];
  /** How we pick relevant catalog rows for the inventory section. */
  productMatcher: ServiceProductMatcher;
  /** `serviceType` for schema.org Service JSON-LD. */
  schemaServiceType: string;
  /** True for verticals where "near me" is the dominant query pattern. */
  nearMeAware: boolean;
};

// --- Service catalog -------------------------------------------------------

const JUMPER_CATEGORY_SLUGS = [
  C.regularJumper,
  C.disneyJumpers,
  C.fiveInOneJumpers,
  C.elevenByElevenJumpers,
  C.xtremeDiscoDome,
] as const;

const COMBO_CATEGORY_SLUGS = [C.combos, C.miniCombo] as const;

const INFLATABLE_CATEGORY_SLUGS = [
  ...JUMPER_CATEGORY_SLUGS,
  ...COMBO_CATEGORY_SLUGS,
  C.waterslide,
  C.obstacleCourse,
  C.inflatableGames,
] as const;

const SEATING_CATEGORY_SLUGS = [
  C.tablesAndChairs,
  C.throneChairs,
  C.canopies,
] as const;

export const SERVICES: readonly Service[] = [
  {
    slug: "jumper-rentals",
    noun: "Jumper Rental",
    label: "Jumper Rentals",
    phrase: "jumper rentals",
    intent: "primary",
    templates: {
      h1: "Jumper Rentals in {city}, {state}",
      title: "Jumper Rentals in {city}, {state} | {brand}",
      description:
        "Reliable jumper rentals in {city}, {state}. Clean, anchored, and inspected by a real local crew — delivery and setup included. Book online with {brand}.",
      heroSubtitle:
        "Delivered, anchored, and ready before your guests show up.",
      ctaPrimary: "Check jumper availability",
    },
    content: {
      introAngle:
        "Renting a jumper should be the easiest part of a {city} birthday. We show up on time, anchor the unit safely, walk you through the rules, and come back for pickup so the day stays about your guests.",
      whyUsAngle:
        "We deliver to {city} families every weekend, so we know which jumpers fit a tight side gate, when a generator is needed, and how to anchor on grass or concrete without scuffing anything.",
      safetyAngle:
        "Every jumper is anchored to its surface (stakes on grass, sandbags on concrete), the blower runs on a dedicated circuit, and the unit is cleaned and inspected between rentals.",
      inventoryHeading: "Popular jumpers near {city}",
    },
    faqs: [
      {
        q: "How long is a jumper rental?",
        a: "A standard rental covers your event day with delivery in the morning and pickup later the same day. Multi-day holds are available — just mention your timing at booking.",
      },
      {
        q: "How much space do I need for a jumper?",
        a: "Most 13×13 jumpers need a roughly 16×16 ft clear, level area with a few feet of overhead clearance. Larger combo units need more — we confirm fit based on your address before delivery.",
      },
      {
        q: "What happens if it rains on my jumper rental day?",
        a: "Light wind and dry conditions are required for safe use. If forecasts are unsafe, we'll work with you on a reschedule per our rental terms — we don't want anyone bouncing in unsafe weather.",
      },
    ],
    semanticKeywords: [
      "jumper",
      "jumpers",
      "jumper rental",
      "kids jumper",
      "jumper rental near me",
      "moonbounce",
    ],
    relatedServiceSlugs: [
      "bounce-house-rentals",
      "water-slide-rentals",
      "obstacle-course-rentals",
      "party-rentals",
    ],
    productMatcher: {
      mode: "categoryWhitelist",
      categorySlugs: [...JUMPER_CATEGORY_SLUGS, ...COMBO_CATEGORY_SLUGS],
    },
    schemaServiceType: "Bounce House Rental",
    nearMeAware: true,
  },

  {
    slug: "bounce-house-rentals",
    noun: "Bounce House Rental",
    label: "Bounce House Rentals",
    phrase: "bounce house rentals",
    intent: "synonym",
    templates: {
      h1: "Bounce House Rentals in {city}, {state}",
      title: "Bounce House Rentals — {city}, {state} | {brand}",
      description:
        "Safe, clean bounce house rentals for {city}, {state} birthday parties. Mesh-paneled, fully anchored, and inspected — book online with {brand}.",
      heroSubtitle: "Safer bounces. Cleaner units. Calmer parties.",
      ctaPrimary: "See bounce houses & book",
    },
    content: {
      introAngle:
        "A bounce house can make a {city} birthday — or end it badly if it isn't anchored right. We bring kid-safe units with full mesh sides, anchor them properly, and brief you on the rules before guests arrive.",
      whyUsAngle:
        "Our crews set up bounce houses in {city} backyards every weekend, so we know what fits where, how to position the unit for shade and supervision, and how to keep younger kids safely separated from older ones.",
      safetyAngle:
        "Mesh-paneled sides, daily-cleaned floors, blower on a dedicated circuit, and proper anchoring — bounce houses should be fun, not a worry.",
      inventoryHeading: "Bounce houses available in {city}",
    },
    faqs: [
      {
        q: "What age range is a bounce house safe for?",
        a: "Standard jumper units are best for ages 3–12; we recommend separating much-older kids by turn rotations. For toddlers, we'll point you to smaller, lower-wall units when available.",
      },
      {
        q: "How many kids can use a bounce house at once?",
        a: "It depends on the unit and the kids' ages. A common rule for a 13×13 is roughly 6–8 younger kids or 4–5 older kids at a time — we share a posted rules card at setup.",
      },
      {
        q: "Do I need to supervise the bounce house?",
        a: "Yes — an adult should keep an eye on the bounce house anytime kids are inside. We'll walk you through key safety rules (no shoes, no flips, no food) when we set up.",
      },
    ],
    semanticKeywords: [
      "bounce house",
      "bounce houses",
      "moon bounce",
      "moonbounce",
      "kids bounce house",
      "bounce house rental near me",
    ],
    relatedServiceSlugs: [
      "jumper-rentals",
      "water-slide-rentals",
      "party-rentals",
    ],
    productMatcher: {
      mode: "categoryWhitelist",
      categorySlugs: [...JUMPER_CATEGORY_SLUGS, ...COMBO_CATEGORY_SLUGS],
    },
    schemaServiceType: "Bounce House Rental",
    nearMeAware: true,
  },

  {
    slug: "water-slide-rentals",
    noun: "Water Slide Rental",
    label: "Water Slide Rentals",
    phrase: "water slide rentals",
    intent: "primary",
    templates: {
      h1: "Water Slide Rentals in {city}, {state}",
      title: "Water Slide Rentals — {city}, {state} | {brand}",
      description:
        "Wet water slide and combo rentals for {city}, {state} summer parties. Sanitized units, easy hookup, professional setup — book online with {brand}.",
      heroSubtitle: "Beat the Inland Empire heat — wet or dry-stay.",
      ctaPrimary: "Reserve a water slide",
    },
    content: {
      introAngle:
        "Inland Empire summers turn brutal, and a water slide is what turns a sweaty {city} backyard party into the one the kids talk about all year.",
      whyUsAngle:
        "We carry combo units that double as a jumper when dry and a slide when wet, plus single-purpose slides for older kids. We confirm hose access and runoff for your {city} address before booking so there are no surprises on the day.",
      safetyAngle:
        "Water slides need a level pad, a continuous water source, and proper anchor weight. Our crew handles all three and walks you through height and turn rules before guests arrive.",
      inventoryHeading: "Water slides available for {city}",
    },
    faqs: [
      {
        q: "Do I need a hose for a water slide rental?",
        a: "Yes — you provide the hose connection; we provide everything else. The slide includes its own water-feed line that connects to a standard garden hose.",
      },
      {
        q: "Where does the water drain after the slide is done?",
        a: "Most setups drain across grass or onto a hardscape that can shed water. We'll review your runoff path during setup so you don't end up with a soaked side yard.",
      },
      {
        q: "What ages are water slides safe for?",
        a: "Most of our slides are best for ages 5+ with adult supervision. Combo units with smaller slides can work for younger riders — we'll match the unit to your guest mix.",
      },
    ],
    semanticKeywords: [
      "water slide",
      "water slides",
      "water slide rental",
      "wet slide",
      "water slide rental near me",
      "summer party rental",
    ],
    relatedServiceSlugs: [
      "jumper-rentals",
      "inflatable-rentals",
      "party-rentals",
    ],
    productMatcher: {
      // Pure category whitelist: `waterslide`, `combos`, and `minicombo` cover
      // every product that's wet-capable today. An earlier draft also matched
      // on `use_type ∈ {wet, both}` but that let 2 canopies (data quirk:
      // `use_type='both'`) bleed onto the water-slide page. Categories are the
      // authoritative source of water-relevance here.
      mode: "categoryWhitelist",
      categorySlugs: [C.waterslide, C.combos, C.miniCombo],
    },
    schemaServiceType: "Water Slide Rental",
    nearMeAware: true,
  },

  {
    slug: "party-rentals",
    noun: "Party Rental",
    label: "Party Rentals",
    phrase: "party rentals",
    intent: "primary",
    templates: {
      h1: "Party Rentals in {city}, {state}",
      title: "Party Rentals in {city}, {state} | {brand}",
      description:
        "Jumpers, water slides, tables, chairs, canopies, and more — party rentals for {city}, {state} delivered and set up by a real local crew. Book online with {brand}.",
      heroSubtitle:
        "One crew, one booking, one stop — inflatables and equipment.",
      ctaPrimary: "Plan your party",
    },
    content: {
      introAngle:
        "From a backyard birthday to a graduation party in the driveway, we put together the rentals that make a {city} event easy — and clean up after.",
      whyUsAngle:
        "One booking, one crew, one stop: inflatables, tables, chairs, canopies, even add-ons like generators. We deliver, set up, and come back for pickup so you don't juggle vendors.",
      safetyAngle:
        "Every inflatable is anchored and inspected; every table and chair is wiped and stacked safely. The crew shows up insured, on time, and ready.",
      inventoryHeading: "Popular party rentals in {city}",
    },
    faqs: [
      {
        q: "Can I bundle a jumper with tables and chairs?",
        a: "Yes — bundling on one drop-off keeps your delivery fee lower and your day simpler. Add tables and chairs in the booking flow with your inflatable.",
      },
      {
        q: "How far in advance should I book a {city} party?",
        a: "Spring and summer Saturdays book out fast in {city}. We recommend 2–3 weeks ahead for the best date and unit selection; last-minute requests are welcome when we have space.",
      },
      {
        q: "Do you provide setup and pickup?",
        a: "Yes — every rental includes delivery, setup, and same-day or next-morning pickup as part of the quote. You don't lift a thing.",
      },
    ],
    semanticKeywords: [
      "party rentals",
      "event rentals",
      "party rental near me",
      "kids party rentals",
      "backyard party rentals",
    ],
    relatedServiceSlugs: [
      "jumper-rentals",
      "water-slide-rentals",
      "table-and-chair-rentals",
      "inflatable-rentals",
      "obstacle-course-rentals",
      // Reciprocal link target so dunk-tank pages aren't orphans from the
      // party-rentals catch-all (the most-linked-to landing per city).
      "dunk-tank-rentals",
    ],
    productMatcher: { mode: "all" },
    schemaServiceType: "Party Equipment Rental",
    nearMeAware: true,
  },

  {
    slug: "inflatable-rentals",
    noun: "Inflatable Rental",
    label: "Inflatable Rentals",
    phrase: "inflatable rentals",
    intent: "category",
    templates: {
      h1: "Inflatable Rentals in {city}, {state}",
      title: "Inflatable Rentals — Jumpers, Slides & Obstacle Courses · {city}, {state} | {brand}",
      description:
        "Jumpers, combos, water slides, obstacle courses, and inflatable games for {city}, {state} parties. Sanitized and anchored — book online with {brand}.",
      heroSubtitle: "Every inflatable we run, in one place.",
      ctaPrimary: "Browse inflatables",
    },
    content: {
      introAngle:
        "Inflatables are what most {city} parties are really about. Whatever shape — jumper, combo, slide, obstacle course, or inflatable game — we keep a real working catalog and deliver clean, anchored units.",
      whyUsAngle:
        "Because we run our own inventory instead of brokering other vendors, what you see online is what's actually available for your {city} date and address.",
      safetyAngle:
        "Every inflatable is anchored to its surface, the blower's power is reviewed at delivery, and each unit is inspected and sanitized between rentals.",
      inventoryHeading: "Inflatables available in {city}",
    },
    faqs: [
      {
        q: "What counts as an inflatable rental?",
        a: "Jumpers, combo jumpers, water slides, obstacle courses, and inflatable carnival games — anything that runs on a blower. Tables, chairs, and canopies are listed separately.",
      },
      {
        q: "Can I rent more than one inflatable for the same event?",
        a: "Yes. We'll confirm space, power, and anchor surface for each unit and bundle them on one delivery to keep the fee reasonable.",
      },
      {
        q: "What anchors are used for inflatables?",
        a: "Stakes on grass, sandbags on concrete or indoor surfaces. We choose anchoring based on your setup surface — not a one-size-fits-all approach.",
      },
    ],
    semanticKeywords: [
      "inflatable rentals",
      "inflatable rental near me",
      "inflatables",
      "moonbounce",
      "party inflatables",
    ],
    relatedServiceSlugs: [
      "jumper-rentals",
      "water-slide-rentals",
      "obstacle-course-rentals",
      "party-rentals",
    ],
    productMatcher: {
      mode: "categoryWhitelist",
      categorySlugs: INFLATABLE_CATEGORY_SLUGS,
    },
    schemaServiceType: "Inflatable Rental",
    nearMeAware: true,
  },

  {
    slug: "table-and-chair-rentals",
    noun: "Table and Chair Rental",
    label: "Table & Chair Rentals",
    phrase: "table and chair rentals",
    intent: "primary",
    templates: {
      h1: "Table and Chair Rentals in {city}, {state}",
      title: "Table & Chair Rentals — {city}, {state} | {brand}",
      description:
        "Folding tables, chairs, and canopies for {city}, {state} parties and events. Delivered with your inflatable or on their own — book online with {brand}.",
      heroSubtitle: "Seat the whole crew without buying anything.",
      ctaPrimary: "Add tables & chairs",
    },
    content: {
      introAngle:
        "Sometimes a {city} party isn't about the bounce — it's about seating 30 people in the backyard. We rent tables, chairs, and canopies that arrive clean and stacked, ready to set up.",
      whyUsAngle:
        "We bundle tables and chairs with our inflatable deliveries to {city} so it's one drop-off, one pickup, and one fee — not three vendors.",
      safetyAngle:
        "Tables and chairs are wiped between rentals, inspected for stability, and transported strapped so nothing arrives dented or wobbly.",
      inventoryHeading: "Tables, chairs & canopies for {city}",
    },
    faqs: [
      {
        q: "Can I rent only tables and chairs, no inflatable?",
        a: "Yes — tables, chairs, and canopies can be booked on their own. Delivery is still part of the quote so nothing about your day changes.",
      },
      {
        q: "How many guests can a 60-inch table seat?",
        a: "A 60-inch round seats roughly 8 guests comfortably; an 8-foot rectangle seats 8–10. We'll help size your order if you share the head count when booking.",
      },
      {
        q: "Do you rent canopies for the seating area?",
        a: "Yes. Canopies pair well with table-and-chair orders for shade or rain coverage — sizes vary, and we'll suggest a fit based on your guest count.",
      },
    ],
    semanticKeywords: [
      "table rental",
      "chair rental",
      "table and chair rental",
      "folding chairs",
      "folding tables",
      "canopy rental",
      "table and chair rental near me",
    ],
    relatedServiceSlugs: ["party-rentals", "jumper-rentals"],
    productMatcher: {
      mode: "categoryWhitelist",
      categorySlugs: SEATING_CATEGORY_SLUGS,
    },
    schemaServiceType: "Event Equipment Rental",
    nearMeAware: true,
  },

  {
    slug: "obstacle-course-rentals",
    noun: "Obstacle Course Rental",
    label: "Obstacle Course Rentals",
    phrase: "obstacle course rentals",
    intent: "specialty",
    templates: {
      h1: "Obstacle Course Rentals in {city}, {state}",
      title: "Obstacle Course Rentals — {city}, {state} | {brand}",
      description:
        "26ft, 40ft, 52ft, and 80ft obstacle course rentals for {city}, {state} parties, schools, and church events. Delivered and set up — book online with {brand}.",
      heroSubtitle: "Turn the backyard into a competition.",
      ctaPrimary: "See obstacle courses",
    },
    content: {
      introAngle:
        "Obstacle courses are the unit older kids and teens actually get excited about. They're our most-requested setup for {city} tween birthdays, school field days, and church youth events.",
      whyUsAngle:
        "Our courses run 26 ft to 80 ft so you can match the layout to your {city} backyard, school field, or church lot. We measure your space before confirming the booking so the unit you reserve actually fits.",
      safetyAngle:
        "Each course is anchored along its full length, blower power is verified, and we review entry, turn, and exit rules with your event crew before the first run.",
      inventoryHeading: "Obstacle courses available for {city}",
    },
    faqs: [
      {
        q: "How much space does an 80ft obstacle course need?",
        a: "Plan for at least 90 ft of length plus a few feet of clear margin on each side. We measure your address before confirming so we never deliver a course that doesn't fit.",
      },
      {
        q: "Are obstacle courses safe for younger kids?",
        a: "Most courses are designed for ages 6+. We can recommend a smaller course or a combo unit if your guest list skews younger.",
      },
      {
        q: "Do you rent obstacle courses for school or church events?",
        a: "Yes — school field days, fall festivals, and church youth events are some of our most common obstacle-course bookings. We coordinate setup timing and on-site logistics with your event lead.",
      },
    ],
    semanticKeywords: [
      "obstacle course rental",
      "inflatable obstacle course",
      "obstacle course near me",
      "school obstacle course",
      "church obstacle course",
    ],
    relatedServiceSlugs: [
      "jumper-rentals",
      "inflatable-rentals",
      "party-rentals",
      // Reciprocal link so school/church-event dunk-tank intent is one step
      // away from the obstacle-course pages.
      "dunk-tank-rentals",
    ],
    productMatcher: {
      mode: "categoryWhitelist",
      categorySlugs: [C.obstacleCourse],
    },
    schemaServiceType: "Inflatable Obstacle Course Rental",
    nearMeAware: true,
  },

  {
    slug: "dunk-tank-rentals",
    noun: "Dunk Tank Rental",
    label: "Dunk Tank Rentals",
    phrase: "dunk tank rentals",
    intent: "specialty",
    templates: {
      h1: "Dunk Tank Rentals in {city}, {state}",
      title: "Dunk Tank Rentals — {city}, {state} | {brand}",
      description:
        "Dunk tank rentals for {city}, {state} school fundraisers, church carnivals, and birthday parties. Availability on request — call {brand} to reserve.",
      heroSubtitle: "Fundraisers and field days the kids actually remember.",
      ctaPrimary: "Call for dunk tank availability",
    },
    content: {
      introAngle:
        "Dunk tanks are seasonal favorites for {city} school fundraisers, church carnivals, and competitive birthdays. We coordinate dunk tank rentals on request — call us early to lock your date.",
      whyUsAngle:
        "Because dunk tanks book by date in {city}, we keep the schedule tight and confirm everything (water source, drainage, transport) before we commit to your event.",
      safetyAngle:
        "A dunk tank needs a stable, level surface, a hose, and a clear thrower lane. We brief your event lead on safe seat height, water depth, and bystander spacing before the first throw.",
      inventoryHeading: "Dunk tanks in {city}",
      emptyInventoryFallback:
        "We're expanding our dunk tank fleet right now. To confirm availability for your {city} date, call {brandPhone} and we'll get you on the schedule — or browse our current inventory below for alternatives that work for fundraisers and field days.",
    },
    faqs: [
      {
        q: "Do you provide water for the dunk tank?",
        a: "We arrive with the empty tank and connect to a standard garden hose on site. Fill time is roughly 30–60 minutes depending on water pressure.",
      },
      {
        q: "Where does the water drain after the dunk tank is done?",
        a: "Most events drain onto grass or a hardscape that can shed water. We'll review your drain plan during setup and help you stage the tank with the right runoff.",
      },
      {
        q: "Is a dunk tank safe for school events in {city}?",
        a: "Yes, when sited correctly. We verify a stable surface, clear thrower lane, and proper seat height, and we'll coordinate with your event lead on supervision and ride rules.",
      },
    ],
    semanticKeywords: [
      "dunk tank",
      "dunk tank rental",
      "dunking booth",
      "school fundraiser rental",
      "church carnival rental",
    ],
    relatedServiceSlugs: [
      "obstacle-course-rentals",
      "party-rentals",
    ],
    productMatcher: { mode: "nameContains", needles: ["dunk", "dunk tank"] },
    schemaServiceType: "Dunk Tank Rental",
    nearMeAware: true,
  },
] as const;

// --- Accessors -------------------------------------------------------------

/** Service slugs in route order. Powers `generateStaticParams` + sitemap. */
export const SERVICE_SLUGS: readonly ServiceSlug[] = SERVICES.map((s) => s.slug);

const SERVICE_BY_SLUG: Readonly<Record<ServiceSlug, Service>> = Object.freeze(
  Object.fromEntries(SERVICES.map((s) => [s.slug, s])) as Record<ServiceSlug, Service>,
);

export function getService(slug: string | null | undefined): Service | null {
  if (!slug) return null;
  const s = slug.trim().toLowerCase();
  return (SERVICE_BY_SLUG as Record<string, Service>)[s] ?? null;
}

export function isKnownService(slug: string | null | undefined): boolean {
  return getService(slug) !== null;
}

/** Resolve a service's related siblings to full records (no broken links). */
export function getRelatedServices(slug: ServiceSlug): Service[] {
  const svc = SERVICE_BY_SLUG[slug];
  return svc.relatedServiceSlugs
    .map((s) => SERVICE_BY_SLUG[s])
    .filter((s): s is Service => Boolean(s));
}

/**
 * Future scope (NOT WIRED YET):
 *  - Seasonal overlays (Halloween, Fourth of July, Spring Break) — applied at
 *    compose time to nudge angle / hero image / CTA without new SERVICE entries.
 *  - Audience overlays (school events, church events, corporate events) — same
 *    mechanism, optional `audienceSlug` on `LandingScope` in seo-routes.ts.
 *  - Venue overlays (backyard, park, school field) — surfaces venue-specific
 *    FAQs and inventory subsets.
 *
 * The data layer is intentionally orthogonal to overlays: a service stays a
 * service, a city stays a city, and overlays apply on top via composition. No
 * combinatorial explosion of SERVICE entries.
 */
