/**
 * City SEO data architecture (Phase 1).
 *
 * Single source of truth for the *localized, brand-neutral* facts behind every
 * city landing page (`/party-rentals/[city]`, `/jumper-rentals/[city]`, …).
 *
 * Design rules that keep this an SEO asset rather than thin/spam content:
 *  - Everything here is **geographic + locally factual** and written once per
 *    city. Real neighborhoods, landmarks, ZIPs, and city-specific FAQs are what
 *    make each page unique and avoid duplicate-content penalties.
 *  - It is **brand-neutral**: no "Lias"/"CRB" names, phone numbers, or theme.
 *    Brand voice is layered on at render time (services + content helpers) so
 *    BOTH brands reuse this data without producing duplicate brand copy.
 *  - `nearbyCitySlugs` must reference other keys in `CITY_SEO` — they power the
 *    "areas we serve" internal-linking mesh and the nearby-cities section.
 *
 * Adding a city = add one entry here (and make sure its `nearbyCitySlugs`
 * resolve). Routes, sitemap, and internal links pick it up automatically.
 */

export type CityFaq = {
  /** Question — city-specific where possible. */
  q: string;
  /** Answer — brand-neutral; rendered prose + FAQPage JSON-LD. */
  a: string;
};

export type CityDelivery = {
  /**
   * True only for the home-base city where delivery + setup is included at no
   * extra charge. Everywhere else delivery is available for a distance-based
   * fee (quoted live in the booking flow), reflected honestly in `note`.
   */
  includedFree: boolean;
  /** One honest sentence about delivery to this city. */
  note: string;
};

export type CitySeo = {
  /** URL slug (kebab-case). Stable — changing it breaks canonicals. */
  slug: string;
  /** Display name, e.g. "Moreno Valley". */
  name: string;
  county: string;
  state: string;
  /** e.g. "CA" — used in H1/title ("…in Perris, CA"). */
  stateAbbr: string;
  /** Representative ZIP codes served (not exhaustive). */
  zipCodes: string[];
  /** Real neighborhoods/areas used in localized prose (not keyword stuffing). */
  neighborhoods: string[];
  /** Recognizable local landmarks/parks used in prose + FAQs. */
  landmarks: string[];
  /** Slugs of nearby cities for internal links — must exist in CITY_SEO. */
  nearbyCitySlugs: string[];
  delivery: CityDelivery;
  /** ~1–2 sentence hero subheading, unique per city (brand name added later). */
  heroText: string;
  /** Meta description seed (<=155 chars); brand name appended at render. */
  seoDescription: string;
  /** 2 unique localized intro paragraphs (city-specific intro + "why here"). */
  intro: [string, string];
  /** City-specific FAQs (brand-neutral). Rendered + FAQPage schema. */
  faqs: CityFaq[];
  /**
   * Optional product slugs to feature for this city. Validated against the live
   * catalog at render; unknown slugs are ignored and the page falls back to the
   * brand's popular inventory. Left undefined for most cities on purpose.
   */
  featuredProductSlugs?: string[];
};

const CALIFORNIA = "California";
const CA = "CA";

/**
 * Seed cities (Inland Empire). Home base is Moreno Valley — the only city with
 * delivery included; all others get an honest distance-fee note.
 */
export const CITY_SEO: Record<string, CitySeo> = {
  "moreno-valley": {
    slug: "moreno-valley",
    name: "Moreno Valley",
    county: "Riverside County",
    state: CALIFORNIA,
    stateAbbr: CA,
    zipCodes: ["92551", "92553", "92555", "92557"],
    neighborhoods: ["TownGate", "Sunnymead", "Moreno Valley Ranch", "Edgemont"],
    landmarks: [
      "Moreno Valley Mall",
      "March Field Air Museum",
      "Box Springs Mountain Reserve",
    ],
    nearbyCitySlugs: ["riverside", "perris", "san-bernardino"],
    delivery: {
      includedFree: true,
      note: "Moreno Valley is our home base, so delivery and setup are included at no extra charge across the city.",
    },
    heroText:
      "Backyard bounce houses, water slides, and party rentals delivered and set up across Moreno Valley — from TownGate to Sunnymead.",
    seoDescription:
      "Bounce house, jumper, and water slide rentals in Moreno Valley, CA. Free local delivery and setup, clean inflatables, and easy online booking.",
    intro: [
      "From birthday parties in Moreno Valley Ranch to block parties near TownGate, we keep Moreno Valley weekends bouncing. Because this is our home turf, we know the neighborhoods, the HOA quirks, and how to get a jumper through a narrow side gate in Sunnymead without a scratch.",
      "Every rental arrives clean, fully anchored, and inspected before your guests show up. We deliver, set up, and come back for pickup so the only thing on your to-do list is cake — whether you're hosting in a backyard off Alessandro or at a park near Box Springs.",
    ],
    faqs: [
      {
        q: "Do you deliver bounce houses anywhere in Moreno Valley?",
        a: "Yes — we cover all of Moreno Valley including TownGate, Sunnymead, Moreno Valley Ranch, and Edgemont, with delivery and setup included at no extra charge.",
      },
      {
        q: "Can you set up at a park in Moreno Valley?",
        a: "We can set up at Moreno Valley parks where inflatables are allowed. Most city parks require a reservation and a generator since outlets aren't guaranteed — let us know and we'll bring power.",
      },
      {
        q: "How early should I book for a Moreno Valley weekend party?",
        a: "Spring and summer Saturdays book out fast locally. We recommend reserving 2–3 weeks ahead, though we'll always try to help with last-minute Moreno Valley requests.",
      },
    ],
  },

  perris: {
    slug: "perris",
    name: "Perris",
    county: "Riverside County",
    state: CALIFORNIA,
    stateAbbr: CA,
    zipCodes: ["92570", "92571", "92572"],
    neighborhoods: ["May Ranch", "Green Valley", "Villages of Avalon", "Mead Valley"],
    landmarks: [
      "Lake Perris State Recreation Area",
      "Skydive Perris",
      "Southern California Railway Museum",
    ],
    nearbyCitySlugs: ["moreno-valley", "menifee", "riverside"],
    delivery: {
      includedFree: false,
      note: "Perris is just minutes from our home base, so delivery is quick and the fee is calculated live by distance when you book.",
    },
    heroText:
      "Jumper, water slide, and party rentals delivered across Perris — from May Ranch to the Villages of Avalon and out toward Lake Perris.",
    seoDescription:
      "Bounce house, jumper, and water slide rentals in Perris, CA. Reliable delivery and setup, sanitized units, and simple online booking.",
    intro: [
      "Perris summers get hot, which is exactly why our water slides and combo jumpers are local favorites here. From quinceañeras in May Ranch to backyard birthdays near Lake Perris, we bring the unit, anchor it safely, and handle the heavy lifting.",
      "We're based just up the road, so getting to Perris neighborhoods like Green Valley and the Villages of Avalon is fast and dependable. Every inflatable is cleaned and inspected before delivery, and our crew sets up and tears down so your day stays stress-free.",
    ],
    faqs: [
      {
        q: "Do you rent water slides for Perris backyards?",
        a: "Yes — wet water slides and combo units are some of our most popular Perris rentals in the warmer months. We'll confirm hose and space requirements before your event.",
      },
      {
        q: "Is there a delivery fee to Perris?",
        a: "Perris is close to our home base, so the delivery fee is modest and calculated automatically by distance when you book online — no surprises at drop-off.",
      },
      {
        q: "Can you deliver to events near Lake Perris?",
        a: "We can deliver to homes and approved venues around Lake Perris. For state recreation areas, you'll need to confirm the site allows inflatables and arrange any required permit.",
      },
    ],
  },

  riverside: {
    slug: "riverside",
    name: "Riverside",
    county: "Riverside County",
    state: CALIFORNIA,
    stateAbbr: CA,
    zipCodes: ["92503", "92504", "92505", "92506", "92507", "92508", "92509"],
    neighborhoods: ["Canyon Crest", "La Sierra", "Orangecrest", "Arlington", "Woodcrest"],
    landmarks: [
      "Mission Inn",
      "Fairmount Park",
      "Mount Rubidoux",
      "UC Riverside",
    ],
    nearbyCitySlugs: ["moreno-valley", "corona", "san-bernardino"],
    delivery: {
      includedFree: false,
      note: "We deliver throughout Riverside for a distance-based fee that's quoted live when you book.",
    },
    heroText:
      "Bounce house and party rentals delivered across Riverside — from Canyon Crest and Orangecrest to La Sierra and the Eastside.",
    seoDescription:
      "Bounce house, jumper, and water slide rentals in Riverside, CA. Clean, insured-setup inflatables with delivery and easy online booking.",
    intro: [
      "Riverside parties range from big backyard celebrations in Orangecrest to graduation parties near UC Riverside, and we've set up for all of them. We know which neighborhoods have the tight gates, which need a generator, and how to make a jumper the centerpiece of any Canyon Crest backyard.",
      "Our crew handles delivery, anchoring, and pickup so you can focus on your guests. Every unit is sanitized and inspected, and we plan setup around your space — grass, concrete, or a level pad near Fairmount Park.",
    ],
    faqs: [
      {
        q: "Which areas of Riverside do you deliver to?",
        a: "We deliver across Riverside, including Canyon Crest, La Sierra, Arlington, Orangecrest, Woodcrest, and the Eastside near UC Riverside.",
      },
      {
        q: "Do you set up on concrete or only grass?",
        a: "Both. We anchor with stakes on grass and use sandbags on concrete or indoor surfaces, so Riverside driveways and patios work fine — just let us know your setup surface.",
      },
      {
        q: "Can I rent a jumper for a park event in Riverside?",
        a: "Yes, where the park permits inflatables. Many Riverside parks require a reservation and proof of insured setup, and outlets aren't guaranteed, so we'll bring a generator if needed.",
      },
    ],
  },

  "san-bernardino": {
    slug: "san-bernardino",
    name: "San Bernardino",
    county: "San Bernardino County",
    state: CALIFORNIA,
    stateAbbr: CA,
    zipCodes: ["92404", "92405", "92407", "92408", "92410", "92411"],
    neighborhoods: ["Arrowhead", "Del Rosa", "Verdemont", "University District"],
    landmarks: [
      "San Manuel Stadium",
      "Cal State San Bernardino",
      "Glen Helen Regional Park",
    ],
    nearbyCitySlugs: ["riverside", "redlands", "fontana"],
    delivery: {
      includedFree: false,
      note: "San Bernardino is within our extended delivery area; the fee is based on distance and shown live at booking.",
    },
    heroText:
      "Jumper, water slide, and party rentals delivered across San Bernardino — from Del Rosa and Arrowhead to the University District.",
    seoDescription:
      "Bounce house, jumper, and water slide rentals in San Bernardino, CA. Sanitized units, professional setup, and quick online booking.",
    intro: [
      "San Bernardino knows how to throw a party, and we're here to make it easy. From birthdays in the foothills near Arrowhead to celebrations in Del Rosa and the University District, we deliver clean inflatables and set them up the right way.",
      "Summers run hot in the valley, so combo jumpers and water slides are big sellers here. Our crew anchors every unit safely, walks you through the rules, and returns for pickup — all you do is enjoy the day.",
    ],
    faqs: [
      {
        q: "Do you deliver bounce houses to San Bernardino?",
        a: "Yes — San Bernardino is part of our extended service area, covering Arrowhead, Del Rosa, Verdemont, and the University District near Cal State San Bernardino.",
      },
      {
        q: "How is the delivery fee to San Bernardino calculated?",
        a: "It's based on distance from our home base and shown automatically when you book online, so you'll see the exact fee before you confirm.",
      },
      {
        q: "Are your inflatables safe for the hot San Bernardino sun?",
        a: "Yes. We anchor and inspect every unit, and we'll position the inflatable for shade where possible and review hot-surface and hydration tips at setup.",
      },
    ],
  },

  redlands: {
    slug: "redlands",
    name: "Redlands",
    county: "San Bernardino County",
    state: CALIFORNIA,
    stateAbbr: CA,
    zipCodes: ["92373", "92374"],
    neighborhoods: ["South Redlands", "The Terrace", "downtown State Street", "Mentone"],
    landmarks: [
      "University of Redlands",
      "Prospect Park",
      "Redlands Bowl",
    ],
    nearbyCitySlugs: ["san-bernardino", "fontana", "riverside"],
    delivery: {
      includedFree: false,
      note: "We deliver to Redlands as part of our extended area, with a distance-based fee quoted at booking.",
    },
    heroText:
      "Party and bounce house rentals delivered across Redlands — from the historic Terrace neighborhood to South Redlands and Mentone.",
    seoDescription:
      "Bounce house, jumper, and water slide rentals in Redlands, CA. Clean inflatables, careful setup, and straightforward online booking.",
    intro: [
      "Redlands backyards — especially the deep lots in the historic Terrace and South Redlands — are made for a great party setup, and we love working here. Whether it's a kid's birthday near Prospect Park or a graduation off Citrus Avenue, we bring a clean unit and handle the details.",
      "We deliver, anchor, and pick up, so the citrus-grove charm of your Redlands event stays the focus. Every inflatable is inspected and sanitized, and we plan around your gate width and setup surface ahead of time.",
    ],
    faqs: [
      {
        q: "Do you deliver to historic neighborhoods in Redlands?",
        a: "Yes. We're used to the mature trees and narrower gates in the Terrace and South Redlands — just share your gate width when booking and we'll confirm the right unit fits.",
      },
      {
        q: "Is delivery available to Mentone and East Redlands?",
        a: "Yes, both fall within our Redlands delivery area. The exact distance fee appears when you enter your address at booking.",
      },
      {
        q: "Can you set up for a University of Redlands event?",
        a: "We can deliver to approved venues and homes near the University of Redlands. For on-campus or park events, please confirm the site allows insured inflatable setups.",
      },
    ],
  },

  fontana: {
    slug: "fontana",
    name: "Fontana",
    county: "San Bernardino County",
    state: CALIFORNIA,
    stateAbbr: CA,
    zipCodes: ["92335", "92336", "92337"],
    neighborhoods: ["North Fontana", "Sierra Lakes", "Southridge", "Jurupa Hills"],
    landmarks: [
      "Auto Club Speedway",
      "Fontana Park",
      "Sierra Lakes",
    ],
    nearbyCitySlugs: ["san-bernardino", "ontario", "riverside"],
    delivery: {
      includedFree: false,
      note: "Fontana is in our extended delivery area; the distance-based fee is calculated live when you book.",
    },
    heroText:
      "Jumper, water slide, and party rentals delivered across Fontana — from Sierra Lakes and North Fontana to Southridge.",
    seoDescription:
      "Bounce house, jumper, and water slide rentals in Fontana, CA. Sanitized units, safe professional setup, and easy online booking.",
    intro: [
      "Fontana's newer master-planned neighborhoods like Sierra Lakes and the established streets of Southridge both make for great party setups, and we deliver to all of them. From first birthdays to backyard graduations, we bring the bounce and do the heavy lifting.",
      "Because Fontana heats up in summer, water slides and combo units are popular here. Our crew anchors every inflatable safely, reviews the rules with you, and returns for pickup so your celebration runs smoothly start to finish.",
    ],
    faqs: [
      {
        q: "Do you deliver bounce houses to North Fontana and Sierra Lakes?",
        a: "Yes — we cover North Fontana, Sierra Lakes, Southridge, and the Jurupa Hills area within our extended delivery zone.",
      },
      {
        q: "What does delivery to Fontana cost?",
        a: "Delivery is a distance-based fee shown automatically at booking, so you'll know the exact cost for your Fontana address before confirming.",
      },
      {
        q: "Do you provide power for backyard setups in Fontana?",
        a: "Inflatables need a nearby outlet or a generator. If your Fontana yard doesn't have convenient power, let us know and we'll bring a generator.",
      },
    ],
  },

  ontario: {
    slug: "ontario",
    name: "Ontario",
    county: "San Bernardino County",
    state: CALIFORNIA,
    stateAbbr: CA,
    zipCodes: ["91761", "91762", "91764"],
    neighborhoods: ["Ontario Ranch", "Creekside", "Downtown Ontario"],
    landmarks: [
      "Ontario Mills",
      "Toyota Arena",
      "Ontario International Airport",
    ],
    nearbyCitySlugs: ["fontana", "corona", "san-bernardino"],
    delivery: {
      includedFree: false,
      note: "Ontario is at the edge of our extended area — delivery may be available with a distance-based fee shown at booking.",
    },
    heroText:
      "Party and bounce house rentals for Ontario — from the new Ontario Ranch community to Creekside and Downtown.",
    seoDescription:
      "Bounce house, jumper, and water slide rentals in Ontario, CA. Clean inflatables, professional setup, and simple online booking.",
    intro: [
      "Ontario's fast-growing Ontario Ranch neighborhoods have the kind of backyards built for a great party, and we're glad to bring the fun. From toddler birthdays to family reunions near Ontario Mills, we deliver a clean unit and set it up the right way.",
      "Every rental is sanitized and inspected before it reaches your Ontario address, and our crew handles anchoring and pickup. Enter your address at booking and we'll confirm availability and the exact delivery fee for your area.",
    ],
    faqs: [
      {
        q: "Do you deliver to Ontario, CA?",
        a: "Ontario sits at the edge of our extended delivery area, so availability can depend on the date. Enter your address at booking and we'll confirm delivery and the fee right away.",
      },
      {
        q: "Can you set up in newer Ontario Ranch backyards?",
        a: "Yes. Newer Ontario Ranch yards are great for inflatables — just share your gate width and setup surface so we bring the right unit and anchoring.",
      },
      {
        q: "How far in advance should I book for Ontario?",
        a: "Because Ontario is on the edge of our range, booking 2–4 weeks ahead gives the best chance of locking your date and unit.",
      },
    ],
  },

  corona: {
    slug: "corona",
    name: "Corona",
    county: "Riverside County",
    state: CALIFORNIA,
    stateAbbr: CA,
    zipCodes: ["92879", "92880", "92881", "92882", "92883"],
    neighborhoods: ["Sierra Del Oro", "Eagle Glen", "Temescal Valley", "Coronita"],
    landmarks: [
      "Santana Regional Park",
      "Skull Canyon",
      "Cleveland National Forest foothills",
    ],
    nearbyCitySlugs: ["riverside", "ontario", "moreno-valley"],
    delivery: {
      includedFree: false,
      note: "Corona is part of our extended delivery area, with a distance-based fee quoted live at booking.",
    },
    heroText:
      "Jumper, water slide, and party rentals delivered across Corona — from Sierra Del Oro and Eagle Glen to Temescal Valley.",
    seoDescription:
      "Bounce house, jumper, and water slide rentals in Corona, CA. Sanitized units, insured setup, and quick online booking.",
    intro: [
      "Corona spreads from the hillside views of Sierra Del Oro to the family neighborhoods of Eagle Glen and Temescal Valley, and we deliver across all of it. Whether it's a backyard birthday or a graduation bash, we bring a clean unit and handle setup end to end.",
      "Our crew anchors every inflatable safely for your Corona yard — grass or concrete — and returns for pickup when the party's over. Each unit is inspected and sanitized, and the delivery fee for your address is shown before you confirm.",
    ],
    faqs: [
      {
        q: "Which Corona neighborhoods do you serve?",
        a: "We deliver throughout Corona, including Sierra Del Oro, Eagle Glen, Coronita, and the Temescal Valley area.",
      },
      {
        q: "Is there a delivery fee to Corona?",
        a: "Yes, a distance-based delivery fee that's calculated automatically when you enter your Corona address at booking.",
      },
      {
        q: "Can you set up on a sloped Corona backyard?",
        a: "Inflatables need a reasonably level area for safe anchoring. Many hillside Corona yards have a flat pad or grass section that works — send us a photo if you're unsure and we'll advise.",
      },
    ],
  },

  hemet: {
    slug: "hemet",
    name: "Hemet",
    county: "Riverside County",
    state: CALIFORNIA,
    stateAbbr: CA,
    zipCodes: ["92543", "92544", "92545"],
    neighborhoods: ["East Hemet", "Valle Vista", "Seven Hills"],
    landmarks: [
      "Diamond Valley Lake",
      "Ramona Bowl Amphitheatre",
      "Western Science Center",
    ],
    nearbyCitySlugs: ["menifee", "perris", "moreno-valley"],
    delivery: {
      includedFree: false,
      note: "Hemet is in our extended delivery area; availability and the distance-based fee are confirmed at booking.",
    },
    heroText:
      "Bounce house and party rentals for Hemet — from East Hemet and Valle Vista out toward Diamond Valley Lake.",
    seoDescription:
      "Bounce house, jumper, and water slide rentals in Hemet, CA. Clean inflatables, careful setup, and easy online booking.",
    intro: [
      "Hemet's big lots in East Hemet and Valle Vista give families plenty of room for a real backyard celebration, and the summer heat makes water slides a local go-to. We bring the unit, anchor it safely, and take care of pickup.",
      "Every inflatable is sanitized and inspected before it reaches your Hemet address. Tell us your date and setup surface, and we'll confirm availability and the exact delivery fee so your celebration near Diamond Valley Lake goes off without a hitch.",
    ],
    faqs: [
      {
        q: "Do you deliver water slides to Hemet?",
        a: "Yes — wet water slides are popular in Hemet's summer heat. We'll confirm space and hose requirements for your yard when you book.",
      },
      {
        q: "Is delivery available to East Hemet and Valle Vista?",
        a: "Yes, both are within our Hemet delivery area. Enter your address at booking to see the exact distance-based fee.",
      },
      {
        q: "How early should I reserve for a Hemet summer party?",
        a: "Summer weekends are the busiest, so we recommend booking 2–3 weeks ahead to lock your date and your preferred unit.",
      },
    ],
  },

  menifee: {
    slug: "menifee",
    name: "Menifee",
    county: "Riverside County",
    state: CALIFORNIA,
    stateAbbr: CA,
    zipCodes: ["92584", "92585", "92586", "92587"],
    neighborhoods: ["Sun City", "Quail Valley", "Audie Murphy Ranch", "Menifee Lakes"],
    landmarks: [
      "Wheatfield Park",
      "Menifee Lakes",
      "Mt. San Jacinto College",
    ],
    nearbyCitySlugs: ["perris", "hemet", "moreno-valley"],
    delivery: {
      includedFree: false,
      note: "Menifee is part of our extended delivery area, with a distance-based fee quoted live at booking.",
    },
    heroText:
      "Jumper, water slide, and party rentals delivered across Menifee — from Audie Murphy Ranch and Menifee Lakes to Sun City.",
    seoDescription:
      "Bounce house, jumper, and water slide rentals in Menifee, CA. Sanitized units, professional setup, and simple online booking.",
    intro: [
      "Menifee has grown into one of the Inland Empire's busiest party towns, from the newer Audie Murphy Ranch backyards to the established streets of Sun City and Quail Valley. We deliver clean inflatables across all of it and handle setup so you don't have to.",
      "Our crew anchors every unit safely for your Menifee yard and returns for pickup when you're done. Each inflatable is inspected and sanitized, and you'll see the exact delivery fee for your address before you confirm your booking.",
    ],
    faqs: [
      {
        q: "Which parts of Menifee do you deliver to?",
        a: "We cover all of Menifee, including Sun City, Quail Valley, Audie Murphy Ranch, and the Menifee Lakes area.",
      },
      {
        q: "Can you set up at Wheatfield Park or another Menifee park?",
        a: "We can set up at Menifee parks that allow inflatables. Most require a reservation and a generator since outlets aren't guaranteed — let us know and we'll plan for power.",
      },
      {
        q: "What's the delivery fee to Menifee?",
        a: "Delivery is a distance-based fee shown automatically when you enter your Menifee address at booking, so there are no surprises.",
      },
    ],
  },
};

/** All city slugs (stable order = insertion order). Powers routes + sitemap. */
export const CITY_SLUGS: string[] = Object.keys(CITY_SEO);

/** All city records as an array (e.g. for "areas we serve" lists). */
export const CITY_SEO_LIST: CitySeo[] = Object.values(CITY_SEO);

/** Lookup a city by slug; null when unknown (use to trigger notFound()). */
export function getCitySeo(slug: string | null | undefined): CitySeo | null {
  if (!slug) return null;
  return CITY_SEO[slug.trim().toLowerCase()] ?? null;
}

export function isKnownCity(slug: string | null | undefined): boolean {
  return getCitySeo(slug) !== null;
}

/**
 * Resolve a city's nearby cities to full records for the internal-link mesh.
 * Silently drops any slug that doesn't resolve, so a typo can't crash a page.
 */
export function getNearbyCities(slug: string | null | undefined): CitySeo[] {
  const city = getCitySeo(slug);
  if (!city) return [];
  return city.nearbyCitySlugs
    .map((s) => getCitySeo(s))
    .filter((c): c is CitySeo => c !== null);
}

/** "Moreno Valley, CA" — shared label for H1s, breadcrumbs, and schema. */
export function cityLabel(city: CitySeo): string {
  return `${city.name}, ${city.stateAbbr}`;
}
