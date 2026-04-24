export type BrandSlug = "lias" | "crb";

export type BrandConfig = {
  slug: BrandSlug;
  displayName: string;
  shortName: string;
  /** Canonical site URL for metadata, sitemaps, and absolute links (no trailing slash). */
  siteUrl: string;
  /** Hostnames that resolve to this brand (lowercase, no port). Include `www` and apex as needed. */
  hostnames: string[];
  supportPhone: string;
  supportPhoneDisplay: string;
  seo: {
    siteName: string;
    defaultDescription: string;
  };
  /** Short marketing lines for hero + sections */
  copy: {
    heroKicker: string;
    heroTitle: string;
    heroSubtitle: string;
    trustLine: string;
  };
  theme: {
    primary: string;
    onPrimary: string;
    secondary: string;
    onSecondary: string;
    accent: string;
    onAccent: string;
    surface: string;
    surfaceElevated: string;
    muted: string;
    border: string;
    /** Full-bleed hero (color-block friendly CSS background) */
    heroBackdrop: string;
    /** Decorative hero glow blobs (RGBA) */
    heroBlobA: string;
    heroBlobB: string;
    /** Full-page backdrop (CSS background stack) */
    pageBackdrop: string;
    footerBackdrop: string;
    radiusLg: string;
    radiusMd: string;
    headerBg: string;
    headerBorder: string;
    /** Section rhythm — solid / stepped fills (home + marketing) */
    stripeTicker: string;
    stripePackages: string;
    packagesGlow: string;
    stripeTrust: string;
    stripeExperience: string;
    experienceGlow: string;
    stripeFleet: string;
    fleetAmbient: string;
    stripeFeature: string;
    stripeUpgrades: string;
    stripeLocalPanel: string;
    ctaBannerBg: string;
    /** Elevated panel (cards, dark shells) */
    panel: string;
    /** Grain overlay on site shell (0–1) */
    shellNoiseOpacity: string;
  };
};

export const DEFAULT_BRAND_SLUG: BrandSlug = "lias";

export const BRANDS = {
  lias: {
    slug: "lias",
    displayName: "Lias Party Rentals",
    shortName: "Lias",
    siteUrl: "https://www.liaspartyrentals.com",
    hostnames: ["www.liaspartyrentals.com", "liaspartyrentals.com"],
    supportPhone: "+19515550123",
    supportPhoneDisplay: "(951) 555-0123",
    seo: {
      siteName: "Lias Party Rentals",
      defaultDescription:
        "Party and event rentals serving Moreno Valley and the Inland Empire. Jumpers, tables, chairs, and more.",
    },
    copy: {
      heroKicker: "Moreno Valley",
      heroTitle: "Your backyard. Their best day ever.",
      heroSubtitle:
        "The inflatable is the star — we just roll up, set up, and let the laughter take over.",
      trustLine: "Real crew · insured setups · one shared calendar",
    },
    theme: {
      primary: "#0d9488",
      onPrimary: "#ffffff",
      secondary: "#ec4899",
      onSecondary: "#ffffff",
      accent: "#facc15",
      onAccent: "#422006",
      surface: "#fffbeb",
      surfaceElevated: "#ffffff",
      muted: "#57534e",
      border: "rgba(234, 88, 12, 0.22)",
      heroBackdrop:
        "linear-gradient(106deg, #fde047 0% 32%, #fb923c 32% 60%, #fb7185 60% 100%)",
      heroBlobA: "rgba(236, 72, 153, 0.5)",
      heroBlobB: "rgba(45, 212, 191, 0.42)",
      pageBackdrop:
        "linear-gradient(180deg, #fffbeb 0%, #fff7ed 38%, #ffffff 100%), radial-gradient(720px 420px at 100% 0%, rgba(251, 113, 133, 0.22), transparent 58%)",
      footerBackdrop:
        "linear-gradient(90deg, #ea580c 0%, #ec4899 42%, #0f7669 100%)",
      radiusLg: "1.5rem",
      radiusMd: "1rem",
      headerBg: "rgba(255, 251, 235, 0.92)",
      headerBorder: "rgba(234, 88, 12, 0.22)",
      stripeTicker: "#facc15",
      stripePackages: "#ffffff",
      packagesGlow:
        "radial-gradient(circle at 18% 0%, rgba(251, 113, 133, 0.14), transparent 55%)",
      stripeTrust: "#fce7f3",
      stripeExperience: "#ffedd5",
      experienceGlow:
        "radial-gradient(circle at 70% 10%, rgba(251, 146, 60, 0.12), transparent 45%)",
      stripeFleet: "#cffafe",
      fleetAmbient:
        "radial-gradient(circle at 38% 0%, rgba(236, 72, 153, 0.16), transparent 58%)",
      stripeFeature:
        "linear-gradient(120deg, #f97316 0% 34%, #ec4899 34% 67%, #14b8a6 67% 100%)",
      stripeUpgrades:
        "linear-gradient(120deg, #f97316 0% 34%, #ec4899 34% 67%, #14b8a6 67% 100%)",
      stripeLocalPanel: "linear-gradient(180deg, #c2410c 0%, #9d174d 100%)",
      ctaBannerBg:
        "linear-gradient(92deg, #0f7669 0%, #ea580c 48%, #db2777 100%)",
      panel: "#fafaf9",
      shellNoiseOpacity: "0.18",
    },
  },
  crb: {
    slug: "crb",
    displayName: "CRB Jumpers",
    shortName: "CRB",
    siteUrl: "https://www.crbjumpers.com",
    hostnames: ["www.crbjumpers.com", "crbjumpers.com"],
    supportPhone: "+19515550177",
    supportPhoneDisplay: "(951) 555-0177",
    seo: {
      siteName: "CRB Jumpers",
      defaultDescription:
        "Bounce houses and jumpers for your next event in Moreno Valley. Online booking and fast, friendly service.",
    },
    copy: {
      heroKicker: "Inland Empire",
      heroTitle: "Go huge. Bounce harder.",
      heroSubtitle:
        "Lock the jumper. Stack the upgrades. Feel the weekend start early.",
      trustLine: "Same inventory as our sister brand · zero double-booking",
    },
    theme: {
      primary: "#22d3ee",
      onPrimary: "#020617",
      secondary: "#fb923c",
      onSecondary: "#020617",
      accent: "#38bdf8",
      onAccent: "#020617",
      surface: "#020617",
      surfaceElevated: "#0c1629",
      muted: "#94a3b8",
      border: "rgba(34, 211, 238, 0.3)",
      heroBackdrop:
        "linear-gradient(150deg, #020617 0% 40%, #082f49 40% 72%, #0e7490 72% 100%)",
      heroBlobA: "rgba(34, 211, 238, 0.35)",
      heroBlobB: "rgba(251, 146, 60, 0.32)",
      pageBackdrop:
        "linear-gradient(180deg, #020617 0%, #030b16 45%, #020617 100%), radial-gradient(ellipse 100% 55% at 50% -8%, rgba(34, 211, 238, 0.12), transparent 52%)",
      footerBackdrop:
        "linear-gradient(90deg, #020617 0%, #0c4a6e 35%, #020617 100%)",
      radiusLg: "1rem",
      radiusMd: "0.75rem",
      headerBg: "rgba(2, 10, 20, 0.9)",
      headerBorder: "rgba(34, 211, 238, 0.28)",
      stripeTicker: "#0a1828",
      stripePackages: "#060f18",
      packagesGlow:
        "radial-gradient(circle at 22% 0%, rgba(34, 211, 238, 0.18), transparent 55%)",
      stripeTrust: "#070f1a",
      stripeExperience: "#050c14",
      experienceGlow:
        "radial-gradient(circle at 72% 8%, rgba(34, 211, 238, 0.14), transparent 46%)",
      stripeFleet: "#040a12",
      fleetAmbient:
        "radial-gradient(circle at 50% 0%, rgba(34, 211, 238, 0.22), transparent 64%)",
      stripeFeature: "#0369a1",
      stripeUpgrades: "#020810",
      stripeLocalPanel: "linear-gradient(135deg, #0369a1 0%, #020617 88%)",
      ctaBannerBg:
        "linear-gradient(92deg, #0c4a6e 0%, #020617 45%, #155e75 100%)",
      panel: "#0a1628",
      shellNoiseOpacity: "0.14",
    },
  },
} as const satisfies Record<BrandSlug, BrandConfig>;

export type Brand = (typeof BRANDS)[BrandSlug];
