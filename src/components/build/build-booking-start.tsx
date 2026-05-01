"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import type { BrandSlug } from "@/lib/brand/config";
import { BRANDS } from "@/lib/brand/config";
import {
  formatCategorySlugLabel,
  inventoryMatchesGuidedCategory,
  type GuidedCategoryDef,
} from "@/lib/build/build-guided-categories";
import { checkBuildAvailability } from "@/lib/booking/check-build-availability";
import { getBookedDates } from "@/lib/booking/get-booked-dates";
import { submitBookingLead } from "@/lib/booking/submit-booking-lead";
import { createOnlineBooking } from "@/lib/booking/create-online-booking";
import { BuildInventoryCardImage } from "@/components/build/build-inventory-card-image";
import { AvailabilityCalendar } from "@/components/build/_availability-calendar";
import type { BuildInventoryOption } from "@/lib/inventory/get-build-inventory-options";
import type { RentalCategoryUIModel } from "@/lib/catalog/get-rental-categories";
import { resolveRentalCategoryForLookup } from "@/lib/catalog/get-rental-categories";
import {
  effectiveListingPrice,
  formatDeliverySummary,
  formatSurfacesList,
  formatUseTypeLabel,
} from "@/lib/catalog/product-display-helpers";
import { BuildProductDetailFields } from "@/components/build/build-product-detail-fields";
import { Container } from "@/components/marketing/container";
import { cn } from "@/lib/utils/cn";
import { formatPhoneTel } from "@/lib/utils/format-phone";
import { BRAND_CONTACT } from "@/lib/config/brand-contact";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type BuildBookingStartProps = {
  isCrb: boolean;
  brandSlug: BrandSlug;
  categorySlug: string | null;
  productSlug: string | null;
  categoryLine: string | null;
  inventoryOptions: BuildInventoryOption[];
  guidedCategories: RentalCategoryUIModel[];
};

function inputClass(isCrb: boolean) {
  return cn(
    "w-full rounded-xl border px-4 py-3.5 text-base outline-none transition ring-0",
    "focus:ring-2 focus:ring-offset-0",
    "disabled:cursor-not-allowed disabled:opacity-60",
    isCrb
      ? "border-slate-600/80 bg-slate-800/60 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/40"
      : "border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus:border-rose-400 focus:ring-rose-200",
  );
}

const labelClass = (isCrb: boolean) =>
  cn("mb-1.5 block text-sm font-semibold", isCrb ? "text-cyan-100/90" : "text-stone-700");


function countInGuidedCategory(
  items: BuildInventoryOption[],
  def: GuidedCategoryDef,
): number {
  return items.filter((o) => inventoryMatchesGuidedCategory(o.category_slug, def)).length;
}

function whatsappHrefFromPhone(supportPhone: string): string {
  return `https://wa.me/${supportPhone.replace(/\D/g, "")}`;
}

function whatsappHrefPrefilled(supportPhone: string, message: string): string {
  return `${whatsappHrefFromPhone(supportPhone)}?text=${encodeURIComponent(message)}`;
}

function CategoryTile({
  def,
  n,
  isCrb,
  onClick,
}: {
  def: GuidedCategoryDef;
  n: number;
  isCrb: boolean;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const isEmpty = n === 0;
  const initials = def.label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  const hasImage = !imgError && !!def.image;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isEmpty}
      className={cn(
        "group relative flex flex-col overflow-hidden text-left",
        "rounded-2xl transition-all duration-200 active:scale-[0.98]",
        isCrb
          ? cn(
              "bg-slate-800/90 ring-1 ring-white/[0.08]",
              isEmpty
                ? "cursor-default opacity-40"
                : "hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.45)] hover:ring-cyan-400/40",
            )
          : cn(
              "bg-white/95 shadow-sm ring-1 ring-stone-200",
              isEmpty
                ? "cursor-default opacity-40"
                : "hover:-translate-y-0.5 hover:shadow-md hover:ring-rose-300",
            ),
      )}
    >
      {/* Image area — fixed height, centered, never stretched */}
      <div
        className={cn(
          "relative flex h-[130px] w-full shrink-0 items-center justify-center overflow-hidden",
          isCrb ? "bg-slate-700/50" : "bg-stone-100",
        )}
      >
        {hasImage ? (
          <img
            src={def.image}
            alt={def.label}
            onError={() => setImgError(true)}
            className="h-full w-full object-contain p-4 drop-shadow-md transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 px-3 text-center">
            <span
              className={cn(
                "text-2xl font-black",
                isCrb ? "text-slate-500" : "text-stone-300",
              )}
            >
              {initials}
            </span>
            <span
              className={cn(
                "text-[9px] font-semibold uppercase tracking-widest",
                isCrb ? "text-slate-600" : "text-stone-400",
              )}
            >
              Image coming soon
            </span>
          </div>
        )}
      </div>

      {/* Text area */}
      <div className="px-4 py-3">
        <span
          className={cn(
            "block text-sm font-bold leading-tight",
            isCrb ? "text-white" : "text-stone-900",
          )}
        >
          {def.label}
        </span>
        <span
          className={cn(
            "mt-1.5 block text-xs font-medium",
            isEmpty
              ? isCrb
                ? "text-slate-600"
                : "text-stone-400"
              : isCrb
                ? "text-slate-400"
                : "text-stone-500",
          )}
        >
          {isEmpty ? "Coming soon" : `${n} ${n === 1 ? "item" : "items"} available`}
        </span>
      </div>
    </button>
  );
}

type SelectedAddonsState = {
  tables: number;
  chairs: number;
  canopy: number;
  generator: number;
  extraJumper: number;
};

function buildMainRentalNotesSection(itemLabel: string, quantity: number): string {
  return `Main rental:\n${itemLabel} x ${quantity}`;
}

function buildLeadNotesBlock(input: {
  eventTime: string;
  preferredPickup: string;
  customerNotes: string;
}): string | null {
  const lines: string[] = [];
  const et = input.eventTime.trim();
  const pp = input.preferredPickup.trim();
  const cn = input.customerNotes.trim();
  if (et) lines.push(`Event start preference: ${et}`);
  if (pp) lines.push(`Pickup window preference: ${pp}`);
  if (cn) lines.push(`Customer notes: ${cn}`);
  return lines.length ? lines.join("\n") : null;
}

function buildAddonsNotesSection(a: SelectedAddonsState): string | null {
  const lines: string[] = [];
  if (a.tables > 0) lines.push(`Tables: ${a.tables}`);
  if (a.chairs > 0) lines.push(`Chairs: ${a.chairs}`);
  if (a.canopy > 0) lines.push(`Canopy: ${a.canopy}`);
  if (a.generator > 0) lines.push(`Generator: ${a.generator}`);
  if (a.extraJumper > 0) lines.push(`Extra jumper: ${a.extraJumper}`);
  if (!lines.length) return null;
  return ["Add-ons:", ...lines].join("\n");
}

function combineLeadNotes(
  base: string | null,
  section: string | null,
): string | null {
  const parts = [base, section].filter((p): p is string => Boolean(p && p.trim()));
  return parts.length ? parts.join("\n\n") : null;
}

const PAYMENT_PROOF_BUCKET = "payment-proofs";
const PAYMENT_PROOF_MAX_BYTES = 5 * 1024 * 1024;
const PAYMENT_PROOF_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function safePaymentProofFileBase(original: string): string {
  const base = original.replace(/^.*[/\\]/, "").replace(/[^a-zA-Z0-9._-]/g, "_");
  return (base.slice(0, 120) || "proof") as string;
}

function paymentProofDateFolder(eventDate: string | null): string {
  if (eventDate && /^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    return eventDate;
  }
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const INITIAL_ADDONS: SelectedAddonsState = {
  tables: 0,
  chairs: 0,
  canopy: 0,
  generator: 0,
  extraJumper: 0,
};
const ADDON_QTY_MAX = 99;
type AddonCardKey = keyof SelectedAddonsState;

const ADDON_CARD_CONFIG: Array<{
  key: AddonCardKey;
  image: string;
  name: string;
  description: string;
}> = [
  {
    key: "tables",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    name: "Tables",
    description: "Sturdy tables for dining, gifts, or extra surface space.",
  },
  {
    key: "chairs",
    image: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a",
    name: "Chairs",
    description: "Comfortable seating for guests alongside your main rental.",
  },
  {
    key: "canopy",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
    name: "Canopy",
    description: "Shade and weather cover for outdoor parties.",
  },
  {
    key: "generator",
    image: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0",
    name: "Generator",
    description: "Reliable power for blowers or extras away from outlets.",
  },
  {
    key: "extraJumper",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
    name: "Extra jumper",
    description: "Add another inflatable for bigger crowds or back-to-back fun.",
  },
];

const EVENT_TIME_WINDOW_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "midday", label: "Midday" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
] as const;

const PREFERRED_TIME_WINDOW_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "midday", label: "Midday" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "next_day", label: "Next day" },
] as const;

/** Shown in build funnel only — customers do not pick delivery time. */
const DELIVERY_EXPECTATION_HELPER =
  "Delivery is scheduled within a time window. We will contact you to confirm the exact delivery time.";
/** Stored on `bookings.delivery_window` when no customer preference is collected. */
const INTERNAL_DELIVERY_WINDOW_DEFAULT = "To be confirmed";

const BUILD_DEFAULT_BASE_ITEM_PRICE = 150;
const BUILD_ADDON_UNIT_PRICES = {
  tableEach: 10,
  chairEach: 2,
  canopy: 75,
  generator: 50,
  extraJumper: 100,
} as const;
const BUILD_DEPOSIT_MIN = 50;
const BUILD_DEPOSIT_RATE = 0.5;

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function computeReservationPricing(input: {
  selectedAddons: SelectedAddonsState;
  mainItemQuantity: number;
}): {
  mainItemTotal: number;
  addonsTotal: number;
  subtotal: number;
  depositAmount: number;
  balanceDue: number;
} {
  const qty = Math.max(1, Math.floor(input.mainItemQuantity) || 1);
  const mainItemTotal = BUILD_DEFAULT_BASE_ITEM_PRICE * qty;
  let addonsTotal = 0;
  addonsTotal += input.selectedAddons.tables * BUILD_ADDON_UNIT_PRICES.tableEach;
  addonsTotal += input.selectedAddons.chairs * BUILD_ADDON_UNIT_PRICES.chairEach;
  addonsTotal += input.selectedAddons.canopy * BUILD_ADDON_UNIT_PRICES.canopy;
  addonsTotal += input.selectedAddons.generator * BUILD_ADDON_UNIT_PRICES.generator;
  addonsTotal += input.selectedAddons.extraJumper * BUILD_ADDON_UNIT_PRICES.extraJumper;
  const subtotal = Math.round((mainItemTotal + addonsTotal) * 100) / 100;
  const depositHalf = Math.round(subtotal * BUILD_DEPOSIT_RATE * 100) / 100;
  const depositUncapped = Math.max(BUILD_DEPOSIT_MIN, depositHalf);
  const depositAmount = Math.round(Math.min(subtotal, depositUncapped) * 100) / 100;
  const balanceDue = Math.round((subtotal - depositAmount) * 100) / 100;
  return {
    mainItemTotal: Math.round(mainItemTotal * 100) / 100,
    addonsTotal: Math.round(addonsTotal * 100) / 100,
    subtotal,
    depositAmount,
    balanceDue,
  };
}

function buildPricingNotesSection(p: {
  subtotal: number;
  depositAmount: number;
  balanceDue: number;
}): string {
  return [
    "Pricing:",
    `Subtotal: ${formatUsd(p.subtotal)}`,
    `Deposit due today: ${formatUsd(p.depositAmount)}`,
    `Balance due at delivery: ${formatUsd(p.balanceDue)}`,
  ].join("\n");
}

const GENERAL_RENTAL_RULES: readonly string[] = [
  "I understand that if the equipment is damaged during my rental, I am responsible for repair or replacement costs.",
  "I understand the setup area must be clean, flat, and large enough for safe installation.",
  "I understand electrical access may be required for inflatables, blowers, or other powered equipment.",
  "I understand pets, sharp objects, food, drinks, gum, paint, and similar items are not allowed on inflatables.",
  "I understand refunds are not provided after reservation, except when weather or safety conditions prevent setup/use.",
];

function buildRentalAgreementNotesSection(input: {
  agreementAccepted: boolean;
  petsAtLocation: "yes" | "no";
  itemRulesShown: boolean;
}): string {
  return [
    "Rental agreement:",
    `Accepted: ${input.agreementAccepted ? "Yes" : "No"}`,
    `Pets at location: ${input.petsAtLocation === "yes" ? "Yes" : "No"}`,
    `Item rules shown: ${input.itemRulesShown ? "Yes" : "No"}`,
  ].join("\n");
}

function windowOptionLabel(
  value: string,
  options: readonly { value: string; label: string }[],
): string {
  const v = value.trim();
  if (!v) return "—";
  return options.find((o) => o.value === v)?.label ?? v;
}

function contactActionsClass(isCrb: boolean) {
  return cn(
    "mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start",
  );
}

function contactButtonClass(isCrb: boolean, variant: "primary" | "outline") {
  return cn(
    "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-black transition active:scale-[0.99]",
    variant === "primary"
      ? isCrb
        ? "bg-cyan-500 text-black hover:bg-cyan-400"
        : "bg-rose-600 text-white hover:bg-rose-700"
      : cn(
          "ring-1",
          isCrb
            ? "bg-slate-800/80 text-cyan-100 ring-cyan-500/35 hover:bg-slate-800"
            : "bg-white text-stone-800 ring-stone-300 hover:bg-stone-50",
        ),
  );
}

export function BuildBookingStart({
  isCrb,
  brandSlug,
  categorySlug,
  productSlug,
  categoryLine,
  inventoryOptions,
  guidedCategories,
}: BuildBookingStartProps) {
  const brandContact = BRANDS[brandSlug];
  const inventoryEmpty = inventoryOptions.length === 0;

  const productSlugTrimmed =
    productSlug && productSlug.trim() !== "" ? productSlug.trim() : null;

  const guidedCatsRef = useRef(guidedCategories);
  guidedCatsRef.current = guidedCategories;

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(() => {
    if (inventoryEmpty) return 2;
    const match =
      productSlugTrimmed &&
      inventoryOptions.find((o) => o.product_slug === productSlugTrimmed);
    return match ? 2 : 1;
  });

  const [selectedItem, setSelectedItem] = useState<BuildInventoryOption | null>(() => {
    if (inventoryEmpty) return null;
    if (!productSlugTrimmed) return null;
    return inventoryOptions.find((o) => o.product_slug === productSlugTrimmed) ?? null;
  });

  const [guidedCategoryIndex, setGuidedCategoryIndex] = useState<number | null>(() => {
    if (productSlugTrimmed) return null;
    const cs = categorySlug?.trim();
    if (!cs || cs === "*") return null;
    const def = resolveRentalCategoryForLookup(categorySlug, guidedCategories);
    if (!def) return null;
    const idx = guidedCategories.findIndex((c) => c.slug === def.slug);
    return idx >= 0 ? idx : null;
  });

  const [formDate, setFormDate] = useState("");
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [formCity, setFormCity] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [preferredPickupTime, setPreferredPickupTime] = useState("");
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddonsState>(() => ({
    ...INITIAL_ADDONS,
  }));
  const [selectedItemQuantity, setSelectedItemQuantity] = useState(1);

  const [availabilityOk, setAvailabilityOk] = useState<boolean | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const [rentalRulesAgreed, setRentalRulesAgreed] = useState(false);
  const [petsAtLocation, setPetsAtLocation] = useState<"yes" | "no" | null>(null);
  const [agreementSignature, setAgreementSignature] = useState("");

  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentProofPreviewUrl, setPaymentProofPreviewUrl] = useState<string | null>(null);
  const paymentProofPreviewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (paymentProofPreviewUrlRef.current) {
        URL.revokeObjectURL(paymentProofPreviewUrlRef.current);
        paymentProofPreviewUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const slug = selectedItem?.product_slug;
    if (!slug) {
      setBookedDates([]);
      return;
    }
    getBookedDates(slug).then(setBookedDates).catch(() => setBookedDates([]));
  }, [selectedItem?.product_slug]);

  useEffect(() => {
    if (productSlugTrimmed) {
      setGuidedCategoryIndex(null);
      return;
    }
    const cs = categorySlug?.trim();
    if (!cs || cs === "*") return;
    const def = resolveRentalCategoryForLookup(categorySlug, guidedCatsRef.current);
    if (!def) {
      setGuidedCategoryIndex(null);
      return;
    }
    const idx = guidedCatsRef.current.findIndex((c) => c.slug === def.slug);
    setGuidedCategoryIndex(idx >= 0 ? idx : null);
  }, [categorySlug, productSlugTrimmed]);

  const inventoryCategoryLabels = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of guidedCategories) {
      if (c.slug === "*" || c.categorySlugs.includes("*")) continue;
      m.set(c.slug.toLowerCase(), c.label);
      for (const s of c.categorySlugs) {
        if (s !== "*") m.set(String(s).toLowerCase(), c.label);
      }
    }
    return m;
  }, [guidedCategories]);

  function handlePaymentProofChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (paymentProofPreviewUrlRef.current) {
      URL.revokeObjectURL(paymentProofPreviewUrlRef.current);
      paymentProofPreviewUrlRef.current = null;
    }
    if (!file) {
      setPaymentFile(null);
      setPaymentProofPreviewUrl(null);
      return;
    }
    setPaymentFile(file);
    const mime = (file.type || "").toLowerCase();
    const isImage =
      mime === "image/png" ||
      mime === "image/jpeg" ||
      mime === "image/jpg" ||
      mime === "image/webp";
    if (isImage) {
      const url = URL.createObjectURL(file);
      paymentProofPreviewUrlRef.current = url;
      setPaymentProofPreviewUrl(url);
    } else {
      setPaymentProofPreviewUrl(null);
    }
  }

  const formId = useId();
  const idDate = `${formId}-date`;
  const idCity = `${formId}-city`;
  const idEventTime = `${formId}-event-time`;
  const idPickup = `${formId}-pickup`;
  const idName = `${formId}-name`;
  const idPhone = `${formId}-phone`;
  const idNotes = `${formId}-notes`;
  const idAddonTablesQty = `${formId}-addon-tables-qty`;
  const idAddonChairsQty = `${formId}-addon-chairs-qty`;
  const idMainQty = `${formId}-main-qty`;
  const idAddonCanopyQty = `${formId}-addon-canopy-qty`;
  const idAddonGeneratorQty = `${formId}-addon-generator-qty`;
  const idAddonExtraJumperQty = `${formId}-addon-extra-jumper-qty`;
  const idRentalRulesAgree = `${formId}-rental-rules-agree`;
  const idAgreementSignature = `${formId}-agreement-signature`;
  const idPetsYes = `${formId}-pets-yes`;
  const idPetsNo = `${formId}-pets-no`;
  const idPaymentProof = `${formId}-payment-proof`;

  const productForFlow = selectedItem?.product_slug ?? productSlugTrimmed;

  const guidedDef =
    guidedCategoryIndex !== null ? guidedCategories[guidedCategoryIndex] : null;
  const itemsInGuidedCategory = useMemo(() => {
    if (!guidedDef) return [];
    return inventoryOptions.filter((o) =>
      inventoryMatchesGuidedCategory(o.category_slug, guidedDef),
    );
  }, [guidedDef, inventoryOptions]);

  const reservationPricing = useMemo(
    () =>
      computeReservationPricing({
        selectedAddons,
        mainItemQuantity: selectedItemQuantity,
      }),
    [selectedAddons, selectedItemQuantity],
  );

  async function submitReservationLead() {
    setErrorMessage(null);

    if (availabilityOk !== true) {
      setErrorMessage("Please complete the availability check before submitting.");
      setStep(2);
      return;
    }

    if (inventoryOptions.length > 0 && !selectedItem && !productSlugTrimmed) {
      setErrorMessage("Please select a rental item to continue.");
      setStep(1);
      return;
    }

    if (!rentalRulesAgreed || petsAtLocation === null || !agreementSignature.trim()) {
      setErrorMessage(
        "Please read the rental rules, answer about pets, accept, and type your full name.",
      );
      setStep(7);
      return;
    }

    if (!paymentFile) {
      setErrorMessage("Please upload your Zelle payment confirmation.");
      setStep(8);
      return;
    }

    const eventDate = formDate.trim() ? formDate.trim() : null;
    const customerName = formName;
    const phone = formPhone;
    const eventCity = formCity.trim() ? formCity.trim() : null;
    const itemLabel =
      selectedItem?.name ?? (productForFlow ? `Product (${productForFlow})` : "Rental item");
    const mainRentalBlock = buildMainRentalNotesSection(itemLabel, selectedItemQuantity);
    const rentalAgreementBlock = buildRentalAgreementNotesSection({
      agreementAccepted: rentalRulesAgreed,
      petsAtLocation,
      itemRulesShown: false,
    });
    const notes = combineLeadNotes(
      combineLeadNotes(
        combineLeadNotes(
          combineLeadNotes(
            mainRentalBlock,
            buildLeadNotesBlock({
              eventTime,
              preferredPickup: preferredPickupTime,
              customerNotes: formNotes,
            }),
          ),
          buildAddonsNotesSection(selectedAddons),
        ),
        buildPricingNotesSection({
          subtotal: reservationPricing.subtotal,
          depositAmount: reservationPricing.depositAmount,
          balanceDue: reservationPricing.balanceDue,
        }),
      ),
      rentalAgreementBlock,
    );

    const submitCategorySlug = selectedItem?.category_slug ?? categorySlug;
    const submitProductSlug = selectedItem?.product_slug ?? productSlugTrimmed;

    setIsSubmitting(true);
    try {
      const file = paymentFile;
      const mime = (file.type || "").toLowerCase();
      if (file.size === 0) {
        setErrorMessage("Please choose a payment confirmation file.");
        return;
      }
      if (file.size > PAYMENT_PROOF_MAX_BYTES) {
        setErrorMessage("File is too large. Maximum size is 5MB.");
        return;
      }
      if (!PAYMENT_PROOF_ALLOWED_TYPES.has(mime)) {
        setErrorMessage("Please upload a PNG, JPG, WebP, or PDF file.");
        return;
      }

      const objectPath = `${brandSlug}/${paymentProofDateFolder(eventDate)}/${Date.now()}-${safePaymentProofFileBase(file.name || "proof")}`;
      const supabase = createSupabaseBrowserClient();
      const { error: uploadError } = await supabase.storage
        .from(PAYMENT_PROOF_BUCKET)
        .upload(objectPath, file, { upsert: false, contentType: mime });

      if (uploadError) {
        setErrorMessage(uploadError.message);
        return;
      }

      const notesWithProof = combineLeadNotes(
        notes,
        `Payment proof path: ${PAYMENT_PROOF_BUCKET}/${objectPath}`,
      );
      const paymentProofFullPath = `${PAYMENT_PROOF_BUCKET}/${objectPath}`;

      const result = await submitBookingLead({
        brandSlug,
        categorySlug: submitCategorySlug,
        productSlug: submitProductSlug,
        eventDate,
        customerName,
        phone,
        eventCity,
        notes: notesWithProof,
        agreementSignature: agreementSignature.trim(),
      });
      if (!result.ok) {
        setErrorMessage(result.error);
        return;
      }

      const bookingResult = await createOnlineBooking({
        brandSlug,
        categorySlug: submitCategorySlug,
        productSlug: submitProductSlug,
        eventDate,
        eventCity,
        customerName,
        phone,
        notes: notesWithProof,
        quantity: selectedItemQuantity,
        addons: selectedAddons,
        eventTimeWindow: eventTime,
        deliveryWindow: INTERNAL_DELIVERY_WINDOW_DEFAULT,
        pickupWindow: preferredPickupTime,
        subtotal: reservationPricing.subtotal,
        depositAmount: reservationPricing.depositAmount,
        balanceDue: reservationPricing.balanceDue,
        paymentProofPath: paymentProofFullPath,
      });
      if (!bookingResult.ok) {
        setErrorMessage(bookingResult.error);
        return;
      }

      setSuccess(true);
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : "Something went wrong. Please try again or call us.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function runAvailabilityCheck() {
    setErrorMessage(null);
    const date = formDate.trim() ? formDate.trim() : null;
    if (!date) {
      setErrorMessage("Please choose an event date to check availability.");
      return;
    }
    if (!productForFlow) {
      setErrorMessage("Please select an item before checking availability.");
      return;
    }

    setIsCheckingAvailability(true);
    try {
      const result = await checkBuildAvailability({
        brandSlug,
        productSlug: productForFlow,
        eventDate: date,
      });
      if (result.available === null) {
        setErrorMessage("Please select an item and choose an event date.");
        return;
      }
      if (!result.available) {
        setAvailabilityOk(false);
        setStep(3);
        return;
      }
      const qtyOk = result.availableQuantity >= selectedItemQuantity;
      setAvailabilityOk(qtyOk);
      setStep(3);
    } catch {
      setErrorMessage("Could not check availability. Please try again or call us.");
    } finally {
      setIsCheckingAvailability(false);
    }
  }

  function goBackFromStepTwo() {
    if (inventoryEmpty) return;
    setStep(1);
    setSelectedItem(null);
    setSelectedItemQuantity(1);
    setGuidedCategoryIndex(null);
    setAvailabilityOk(null);
  }

  function goBackFromResultToEventDetails() {
    setStep(2);
    setAvailabilityOk(null);
  }

  function goBackFromCustomerToAddons() {
    setStep(4);
  }

  function goBackFromReviewToContact() {
    setStep(5);
  }

  function goBackFromPaymentToAgreement() {
    setStep(7);
  }

  function goBackFromAgreementToReview() {
    setStep(6);
  }

  function goBackFromAddonsToAvailability() {
    setStep(3);
  }

  function chooseAnotherItemFromUnavailable() {
    setAvailabilityOk(null);
    setStep(1);
    setSelectedItem(null);
    setSelectedItemQuantity(1);
    setGuidedCategoryIndex(null);
  }

  function selectInventoryItem(item: BuildInventoryOption) {
    setSelectedItem(item);
    setSelectedItemQuantity(1);
    setStep(2);
    setAvailabilityOk(null);
  }

  const cardShell = isCrb
    ? "bg-slate-800/80 ring-1 ring-slate-600/50"
    : "bg-white ring-1 ring-stone-200/80";
  const waHref = whatsappHrefFromPhone(brandContact.supportPhone);

  if (success) {
    const firstName = formName.trim().split(/\s+/)[0] ?? formName.trim();
    const refCode = `${firstName.toUpperCase()}-${formDate.replace(/-/g, "")}`;
    const readableDate = formDate
      ? new Date(`${formDate}T12:00:00`).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "—";

    const waMessage = [
      "Hi, I just submitted a reservation request.",
      `Product: ${selectedItem?.name ?? productSlugTrimmed ?? "—"}`,
      `Date: ${readableDate}`,
      `City: ${formCity.trim() || "—"}`,
      `Name: ${formName.trim()}`,
      `Deposit paid: ${formatUsd(reservationPricing.depositAmount)}`,
      `Reference: ${refCode}`,
    ].join("\n");

    const waHrefPrefilled = whatsappHrefPrefilled(brandContact.supportPhone, waMessage);

    const summaryRows: [string, string][] = [
      ["Product", selectedItem?.name ?? productSlugTrimmed ?? "—"],
      ["Date", readableDate],
      ["City", formCity.trim() || "—"],
      ["Customer", formName.trim()],
      ["Deposit paid", formatUsd(reservationPricing.depositAmount)],
      ["Balance due", formatUsd(reservationPricing.balanceDue)],
    ];

    return (
      <div
        className={cn(
          "min-h-[60vh] py-10 sm:py-14",
          isCrb ? "bg-slate-900 text-slate-100" : "bg-amber-50/50 text-stone-900",
        )}
      >
        <Container className="max-w-lg">
          <div
            className={cn(
              "rounded-2xl p-8 shadow-lg ring-1 sm:p-10",
              isCrb ? "bg-slate-800/80 ring-cyan-500/25" : "bg-white/90 ring-stone-200/80",
            )}
            style={{ borderRadius: "var(--brand-radius-lg)" }}
            role="status"
          >
            {/* Heading */}
            <p
              className={cn(
                "text-2xl font-black tracking-tight sm:text-3xl",
                isCrb ? "text-cyan-300" : "text-rose-600",
              )}
            >
              Reservation request received ✓
            </p>
            <p
              className={cn(
                "mt-2 text-sm leading-relaxed",
                isCrb ? "text-slate-300" : "text-stone-600",
              )}
            >
              We received your request and will contact you shortly to confirm final details.
            </p>

            {/* Summary */}
            <dl
              className={cn(
                "mt-6 divide-y rounded-xl px-4 py-1 text-sm",
                isCrb
                  ? "divide-slate-700 bg-slate-900/50 ring-1 ring-slate-700"
                  : "divide-stone-100 bg-stone-50 ring-1 ring-stone-200",
              )}
              style={{ borderRadius: "var(--brand-radius-md)" }}
            >
              {summaryRows.map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className={cn("shrink-0 font-semibold", isCrb ? "text-slate-400" : "text-stone-500")}>
                    {label}
                  </dt>
                  <dd className={cn("text-right font-bold", isCrb ? "text-white" : "text-stone-900")}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Reference */}
            <p
              className={cn(
                "mt-4 text-center text-xs font-bold uppercase tracking-widest",
                isCrb ? "text-slate-500" : "text-stone-400",
              )}
            >
              Ref: {refCode}
            </p>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={waHrefPrefilled}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex flex-1 items-center justify-center rounded-xl px-5 py-3 text-sm font-black transition",
                  isCrb
                    ? "bg-cyan-500 text-black hover:bg-cyan-400"
                    : "bg-emerald-500 text-white hover:bg-emerald-600",
                )}
                style={{ borderRadius: "var(--brand-radius-md)" }}
              >
                Message us on WhatsApp
              </a>
              <a
                href={`tel:${formatPhoneTel(brandContact.supportPhone)}`}
                className={cn(
                  "flex flex-1 items-center justify-center rounded-xl border px-5 py-3 text-sm font-black transition",
                  isCrb
                    ? "border-slate-600 text-slate-200 hover:bg-slate-700"
                    : "border-stone-300 text-stone-700 hover:bg-stone-100",
                )}
                style={{ borderRadius: "var(--brand-radius-md)" }}
              >
                Call {brandContact.supportPhoneDisplay}
              </a>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const stepLabel =
    step === 1
      ? "Step 1 of 8 — Pick your rental"
      : step === 2
        ? "Step 2 of 8 — Event details"
        : step === 3
          ? "Step 3 of 8 — Availability"
          : step === 4
            ? "Step 4 of 8 — Add-ons"
            : step === 5
              ? "Step 5 of 8 — Your contact info"
              : step === 6
                ? "Step 6 of 8 — Review reservation"
                : step === 7
                  ? "Step 7 of 8 — Rental rules & responsibility"
                  : "Step 8 of 8 — Secure your reservation";

  return (
    <div
      className={cn(
        "min-h-[60vh] py-8 sm:py-12",
        isCrb ? "bg-slate-900 text-slate-100" : "bg-gradient-to-b from-amber-50/80 via-stone-50 to-white text-stone-900",
      )}
    >
      <Container className={step === 1 && !inventoryEmpty ? "max-w-3xl" : "max-w-lg"}>
        <header className="text-center sm:text-left">
          <h1
            className={cn("text-3xl font-black tracking-tight sm:text-4xl", isCrb ? "text-white" : "text-stone-900")}
          >
            Let’s build your party
          </h1>
          <p
            className={cn("mt-3 text-base leading-relaxed sm:text-lg", isCrb ? "text-cyan-100/85" : "text-stone-600")}
          >
            Choose your date and tell us what you’re looking for. We’ll confirm availability fast.
          </p>
          <p
            className={cn(
              "mt-3 text-xs font-bold uppercase tracking-widest sm:text-sm",
              isCrb ? "text-cyan-200/80" : "text-stone-500",
            )}
            aria-live="polite"
          >
            {stepLabel}
          </p>
        </header>

        <div className={contactActionsClass(isCrb)} style={{ borderRadius: "var(--brand-radius-md)" }}>
          <a
            href={`tel:${formatPhoneTel(brandContact.supportPhone)}`}
            className={contactButtonClass(isCrb, "primary")}
            style={{ borderRadius: "var(--brand-radius-md)" }}
          >
            Call {brandContact.supportPhoneDisplay}
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className={contactButtonClass(isCrb, "outline")}
            style={{ borderRadius: "var(--brand-radius-md)" }}
          >
            WhatsApp
          </a>
        </div>

        {categoryLine ? (
          <p
            className={cn(
              "mt-6 rounded-xl px-4 py-3 text-center text-sm font-semibold sm:px-5 sm:text-left",
              isCrb ? "bg-cyan-500/15 text-cyan-100 ring-1 ring-cyan-500/30" : "bg-rose-50 text-rose-900 ring-1 ring-rose-200/60",
            )}
          >
            {categoryLine}
          </p>
        ) : null}

        {errorMessage ? (
          <p
            className={cn(
              "mt-4 rounded-xl border px-4 py-3 text-sm font-semibold sm:text-left",
              isCrb
                ? "border-red-400/35 bg-red-950/50 text-red-100"
                : "border-red-300/60 bg-red-50 text-red-900",
            )}
            role="alert"
            aria-live="polite"
          >
            {errorMessage}
          </p>
        ) : null}

        {step === 1 && !inventoryEmpty ? (
          <div className="mt-8 space-y-6">
            {guidedCategoryIndex === null ? (
              <>
                <h2 className={cn("text-lg font-bold", isCrb ? "text-white" : "text-stone-900")}>
                  What type of rental do you need?
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {guidedCategories.map((def, idx) => {
                    const n = countInGuidedCategory(inventoryOptions, def);
                    return (
                      <CategoryTile
                        key={def.slug}
                        def={def}
                        n={n}
                        isCrb={isCrb}
                        onClick={() => setGuidedCategoryIndex(idx)}
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className={cn(
                      "text-sm font-bold underline-offset-4 hover:underline",
                      isCrb ? "text-cyan-300" : "text-rose-700",
                    )}
                    onClick={() => setGuidedCategoryIndex(null)}
                  >
                    ← All categories
                  </button>
                </div>
                <h2 className={cn("text-lg font-bold", isCrb ? "text-white" : "text-stone-900")}>
                  {guidedDef?.label}
                </h2>
                {itemsInGuidedCategory.length === 0 ? (
                  <p
                    className={cn(
                      "rounded-xl px-4 py-3 text-sm",
                      isCrb ? "bg-slate-800/80 text-slate-300" : "bg-stone-100 text-stone-700",
                    )}
                  >
                    No items in this category right now. Try another or call us.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {itemsInGuidedCategory
                      .slice()
                      .sort((a, b) => {
                        const cat = (a.category_slug ?? "").localeCompare(b.category_slug ?? "");
                        if (cat !== 0) return cat;
                        return a.name.localeCompare(b.name);
                      })
                      .map((item) => {
                        const isAvailable = item.quantity_active > 0;
                        const listPrice = effectiveListingPrice(item);
                        const useLabel = formatUseTypeLabel(item.use_type);
                        const surfLine = formatSurfacesList(item.allowed_surfaces);
                        const specRows = [
                          (item.dimensions ?? "").trim()
                            ? {
                                label: "Dimensions",
                                value: (item.dimensions ?? "").trim(),
                              }
                            : null,
                          (item.required_space ?? "").trim()
                            ? {
                                label: "Setup space",
                                value: (item.required_space ?? "").trim(),
                              }
                            : null,
                          useLabel ? { label: "Use", value: useLabel } : null,
                          surfLine ? { label: "Surfaces", value: surfLine } : null,
                        ].filter(
                          (r): r is { label: string; value: string } => r != null,
                        );
                        const deliveryBlurb = formatDeliverySummary({
                          delivery_included: item.delivery_included,
                          delivery_fee: item.delivery_fee,
                        });
                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "flex flex-col overflow-hidden shadow-md transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl",
                              cardShell,
                            )}
                            style={{ borderRadius: "var(--brand-radius-lg)" }}
                          >
                            <BuildInventoryCardImage
                              imageSrc={item.image_src}
                              imageAlt={item.name}
                              productName={item.name}
                              isCrb={isCrb}
                            />

                            <div className="flex flex-1 flex-col gap-2 p-3">
                              {item.category_slug && (
                                <span
                                  className={cn(
                                    "inline-block w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                    isCrb
                                      ? "bg-slate-700/80 text-cyan-300"
                                      : "bg-stone-100 text-stone-500",
                                  )}
                                >
                                  {inventoryCategoryLabels.get(item.category_slug.toLowerCase()) ??
                                    formatCategorySlugLabel(item.category_slug)}
                                </span>
                              )}

                              <p className={cn("text-sm font-bold leading-snug", isCrb ? "text-white" : "text-stone-900")}>
                                {item.name}
                              </p>

                              {listPrice != null ? (
                                <p className={cn("text-lg font-black tabular-nums leading-none", isCrb ? "text-white" : "text-stone-900")}>
                                  <span className={cn("text-[11px] font-semibold", isCrb ? "text-slate-400" : "text-stone-400")}>
                                    from{" "}
                                  </span>
                                  ${Math.round(listPrice)}
                                </p>
                              ) : (
                                <p className={cn("text-xs font-semibold", isCrb ? "text-slate-400" : "text-stone-500")}>
                                  Pricing on request
                                </p>
                              )}

                              {(item.short_description ?? "").trim() ? (
                                <p className={cn("line-clamp-2 text-xs leading-snug", isCrb ? "text-slate-400" : "text-stone-600")}>
                                  {(item.short_description ?? "").trim()}
                                </p>
                              ) : null}

                              {specRows.length > 0 ? (
                                <div
                                  className={cn(
                                    "grid grid-cols-1 gap-x-2 gap-y-0.5 text-[10px] font-semibold leading-snug sm:grid-cols-2",
                                    isCrb ? "text-slate-400" : "text-stone-600",
                                  )}
                                >
                                  {specRows.map((row) => (
                                    <div key={row.label} className="min-w-0">
                                      <span
                                        className={cn(
                                          "font-bold",
                                          isCrb ? "text-cyan-200/90" : "text-stone-700",
                                        )}
                                      >
                                        {row.label}:
                                      </span>{" "}
                                      <span className="break-words font-medium">{row.value}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : null}

                              <p className={cn("text-[11px] leading-relaxed", isCrb ? "text-slate-500" : "text-stone-400")}>
                                {deliveryBlurb ??
                                  "Professional delivery & setup available · equipment cleaned & inspected"}
                              </p>

                              <button
                                type="button"
                                disabled={!isAvailable}
                                className={cn(
                                  "mt-auto h-9 rounded-lg text-xs font-black transition active:scale-[0.99]",
                                  isAvailable
                                    ? isCrb
                                      ? "bg-cyan-500 text-black hover:bg-cyan-400"
                                      : "bg-rose-600 text-white hover:bg-rose-700"
                                    : "cursor-not-allowed opacity-40",
                                  !isAvailable && (isCrb ? "bg-slate-700 text-slate-400" : "bg-stone-200 text-stone-400"),
                                )}
                                style={{ borderRadius: "var(--brand-radius-md)" }}
                                onClick={() => isAvailable && selectInventoryItem(item)}
                              >
                                {isAvailable ? "Check availability" : "Not available"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            )}
          </div>
        ) : null}

        {step === 2 ? (
          <div
            className={cn(
              "mt-8 space-y-5 rounded-2xl p-5 shadow-xl ring-1 sm:p-7",
              isCrb ? "bg-slate-800/70 ring-cyan-500/20 backdrop-blur-md" : "bg-white/80 ring-stone-200/90 backdrop-blur-sm",
            )}
            style={{ borderRadius: "var(--brand-radius-lg)" }}
          >
            {inventoryEmpty ? (
              <p
                className={cn(
                  "rounded-xl px-4 py-3 text-center text-sm font-medium sm:text-left",
                  isCrb ? "bg-slate-900/60 text-slate-300 ring-1 ring-slate-600/40" : "bg-stone-100 text-stone-700 ring-1 ring-stone-200",
                )}
                role="status"
              >
                No rental items are currently available for this brand.
              </p>
            ) : null}
            {productForFlow ? (
              <div
                className={cn(
                  "rounded-xl px-4 py-3 text-sm",
                  isCrb ? "bg-cyan-500/10 text-cyan-100 ring-1 ring-cyan-500/25" : "bg-rose-50 text-rose-900 ring-1 ring-rose-200/70",
                )}
              >
                <span className="font-bold">Selected: </span>
                {selectedItem?.name ?? `Product (${productForFlow})`}
                {productSlugTrimmed && productForFlow === productSlugTrimmed ? (
                  <span className={cn("ml-2 text-xs font-medium", isCrb ? "text-cyan-200/80" : "text-rose-700/90")}>
                    (from your link)
                  </span>
                ) : null}
              </div>
            ) : null}
            {selectedItem ? (
              <div
                className={cn(
                  "rounded-xl px-4 py-4 ring-1",
                  isCrb
                    ? "bg-slate-900/50 text-slate-200 ring-slate-600/40"
                    : "bg-stone-50 text-stone-800 ring-stone-200/90",
                )}
              >
                <p
                  className={cn(
                    "text-xs font-black uppercase tracking-widest",
                    isCrb ? "text-cyan-200/90" : "text-stone-500",
                  )}
                >
                  Rental details
                </p>
                <div className="mt-3">
                  <BuildProductDetailFields item={selectedItem} isCrb={isCrb} />
                </div>
              </div>
            ) : null}
            {productForFlow && selectedItem ? (
              selectedItem.quantity_active > 1 ? (
                <div>
                  <label htmlFor={idMainQty} className={labelClass(isCrb)}>
                    How many do you need?
                  </label>
                  <input
                    id={idMainQty}
                    type="number"
                    min={1}
                    max={selectedItem.quantity_active}
                    aria-label="Main rental quantity"
                    className={cn(inputClass(isCrb), "max-w-[8rem]")}
                    value={selectedItemQuantity}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const n = parseInt(raw, 10);
                      const max = selectedItem.quantity_active;
                      setSelectedItemQuantity(
                        raw === ""
                          ? 1
                          : Number.isFinite(n) && n >= 1
                            ? Math.min(max, n)
                            : selectedItemQuantity,
                      );
                    }}
                    disabled={isCheckingAvailability || isSubmitting}
                  />
                  <p className={cn("mt-1 text-xs", isCrb ? "text-slate-400" : "text-stone-500")}>
                    Max {selectedItem.quantity_active} available for this item.
                  </p>
                </div>
              ) : (
                <p className={cn("text-sm font-medium", isCrb ? "text-slate-300" : "text-stone-700")}>
                  Qty: 1
                </p>
              )
            ) : productForFlow ? (
              <p className={cn("text-sm font-medium", isCrb ? "text-slate-300" : "text-stone-700")}>Qty: 1</p>
            ) : null}
            {!inventoryEmpty && !productForFlow ? (
              <p className={cn("text-sm font-semibold", isCrb ? "text-amber-200" : "text-amber-900")}>
                Select a rental item on the previous step first.
              </p>
            ) : null}
            <div>
              <label className={labelClass(isCrb)}>
                Event date
              </label>
              <AvailabilityCalendar
                bookedDates={bookedDates}
                value={formDate}
                onChange={setFormDate}
                disabled={isCheckingAvailability || isSubmitting}
                isCrb={isCrb}
              />
            </div>
            <div>
              <label htmlFor={idCity} className={labelClass(isCrb)}>
                Event city
              </label>
              <input
                id={idCity}
                name="city"
                type="text"
                className={inputClass(isCrb)}
                placeholder="e.g. Moreno Valley"
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                disabled={isCheckingAvailability || isSubmitting}
              />
            </div>
            <div>
              <label htmlFor={idEventTime} className={labelClass(isCrb)}>
                What time does your event start?
              </label>
              <select
                id={idEventTime}
                name="event_time"
                className={inputClass(isCrb)}
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                disabled={isCheckingAvailability || isSubmitting}
              >
                <option value="">Select a window…</option>
                {EVENT_TIME_WINDOW_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div
              className={cn(
                "rounded-xl px-4 py-3 text-sm font-medium leading-snug",
                isCrb ? "bg-slate-900/45 text-slate-200 ring-1 ring-slate-600/35" : "bg-stone-100 text-stone-800 ring-1 ring-stone-200",
              )}
            >
              {DELIVERY_EXPECTATION_HELPER}
            </div>
            <div>
              <label htmlFor={idPickup} className={labelClass(isCrb)}>
                Desired pickup window
              </label>
              <select
                id={idPickup}
                className={inputClass(isCrb)}
                value={preferredPickupTime}
                onChange={(e) => setPreferredPickupTime(e.target.value)}
                disabled={isCheckingAvailability || isSubmitting}
              >
                <option value="">Select a window…</option>
                {PREFERRED_TIME_WINDOW_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              {!inventoryEmpty ? (
                <button
                  type="button"
                  className={cn(
                    "h-12 rounded-xl px-4 text-sm font-bold underline-offset-4 hover:underline",
                    isCrb ? "text-cyan-200" : "text-rose-700",
                  )}
                  onClick={goBackFromStepTwo}
                  disabled={isCheckingAvailability}
                >
                  ← Back
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                disabled={isCheckingAvailability || !productForFlow}
                className={cn(
                  "h-12 rounded-xl px-8 text-base font-black transition active:scale-[0.99]",
                  "disabled:pointer-events-none disabled:opacity-70",
                  isCrb ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-rose-600 text-white shadow-lg shadow-rose-900/15 hover:bg-rose-700",
                )}
                style={{ borderRadius: "var(--brand-radius-md)" }}
                onClick={() => {
                  void runAvailabilityCheck();
                }}
              >
                {isCheckingAvailability ? "Checking…" : "Check availability"}
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div
            className={cn(
              "mt-8 space-y-5 rounded-2xl p-5 shadow-xl ring-1 sm:p-7",
              isCrb ? "bg-slate-800/70 ring-cyan-500/20 backdrop-blur-md" : "bg-white/80 ring-stone-200/90 backdrop-blur-sm",
            )}
            style={{ borderRadius: "var(--brand-radius-lg)" }}
          >
            {availabilityOk === true ? (
              <>
                <p className={cn("text-base font-bold leading-relaxed", isCrb ? "text-cyan-50" : "text-stone-900")}>
                  Good news — this item is available for your date.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                  <button
                    type="button"
                    className={cn(
                      "h-12 rounded-xl px-4 text-sm font-bold underline-offset-4 hover:underline",
                      isCrb ? "text-cyan-200" : "text-rose-700",
                    )}
                    onClick={goBackFromResultToEventDetails}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "h-12 rounded-xl px-8 text-base font-black transition active:scale-[0.99]",
                      isCrb ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-rose-600 text-white shadow-lg shadow-rose-900/15 hover:bg-rose-700",
                    )}
                    style={{ borderRadius: "var(--brand-radius-md)" }}
                    onClick={() => setStep(4)}
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : availabilityOk === false ? (
              <>
                <p className={cn("text-base font-bold leading-relaxed", isCrb ? "text-cyan-50" : "text-stone-900")}>
                  This item may already be booked for this date, or there are not enough units free. Try another
                  item or contact us.
                </p>
                <div className="flex flex-col gap-3">
                  {!inventoryEmpty ? (
                    <button
                      type="button"
                      className={cn(
                        "h-11 w-full rounded-xl text-sm font-black transition active:scale-[0.99]",
                        isCrb ? "bg-slate-700 text-white ring-1 ring-slate-500/50 hover:bg-slate-600" : "bg-stone-200 text-stone-900 hover:bg-stone-300",
                      )}
                      style={{ borderRadius: "var(--brand-radius-md)" }}
                      onClick={chooseAnotherItemFromUnavailable}
                    >
                      Choose another item
                    </button>
                  ) : null}
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <a
                      href={`tel:${formatPhoneTel(brandContact.supportPhone)}`}
                      className={cn(
                        "flex h-11 flex-1 items-center justify-center rounded-xl text-sm font-black transition",
                        isCrb ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-rose-600 text-white hover:bg-rose-700",
                      )}
                      style={{ borderRadius: "var(--brand-radius-md)" }}
                    >
                      Call
                    </a>
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex h-11 flex-1 items-center justify-center rounded-xl text-sm font-black ring-1 transition",
                        isCrb
                          ? "bg-slate-800 text-cyan-100 ring-cyan-500/35 hover:bg-slate-700"
                          : "bg-white text-stone-800 ring-stone-300 hover:bg-stone-50",
                      )}
                      style={{ borderRadius: "var(--brand-radius-md)" }}
                    >
                      WhatsApp
                    </a>
                  </div>
                  <button
                    type="button"
                    className={cn(
                      "h-11 text-sm font-bold underline-offset-4 hover:underline",
                      isCrb ? "text-cyan-200" : "text-rose-700",
                    )}
                    onClick={goBackFromResultToEventDetails}
                  >
                    ← Edit event details
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm font-medium">
                Use “Check availability” on the previous step to see results here.
              </p>
            )}
          </div>
        ) : null}

        {step === 4 ? (
          <div
            className={cn(
              "mt-8 space-y-5 rounded-2xl p-5 shadow-xl ring-1 sm:p-7",
              isCrb ? "bg-slate-800/70 ring-cyan-500/20 backdrop-blur-md" : "bg-white/80 ring-stone-200/90 backdrop-blur-sm",
            )}
            style={{ borderRadius: "var(--brand-radius-lg)" }}
          >
            <h2 className={cn("text-lg font-bold", isCrb ? "text-white" : "text-stone-900")}>Enhance your event</h2>
            <p className={cn("text-sm", isCrb ? "text-slate-400" : "text-stone-600")}>
              Optional add-ons — select anything you need and we’ll confirm with you.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {ADDON_CARD_CONFIG.map((def) => {
                const selected = selectedAddons[def.key] > 0;
                return (
                  <div
                    key={def.key}
                    className={cn(
                      "flex flex-col overflow-hidden rounded-xl border shadow-sm transition",
                      isCrb
                        ? "border-slate-600/80 bg-slate-800/50 hover:border-cyan-400/55"
                        : "border-stone-200 bg-white/90 hover:border-rose-300/90",
                      selected &&
                        (isCrb
                          ? "border-cyan-400/70 ring-2 ring-cyan-400/40"
                          : "border-rose-400/80 ring-2 ring-rose-200/90"),
                    )}
                  >
                    <img src={def.image} alt="" className="h-36 w-full shrink-0 object-cover sm:h-40" />
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <h3 className={cn("text-base font-black", isCrb ? "text-white" : "text-stone-900")}>
                        {def.name}
                      </h3>
                      <p className={cn("text-sm leading-relaxed", isCrb ? "text-slate-400" : "text-stone-600")}>
                        {def.description}
                      </p>
                      {def.key === "tables" && selectedAddons.tables > 0 ? (
                        <div>
                          <label htmlFor={idAddonTablesQty} className={labelClass(isCrb)}>
                            Quantity
                          </label>
                          <input
                            id={idAddonTablesQty}
                            type="number"
                            min={1}
                            max={ADDON_QTY_MAX}
                            className={cn(inputClass(isCrb), "max-w-[8rem]")}
                            value={selectedAddons.tables}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const n = parseInt(raw, 10);
                              setSelectedAddons((a) => ({
                                ...a,
                                tables:
                                  raw === ""
                                    ? 1
                                    : Number.isFinite(n) && n >= 1
                                      ? Math.min(ADDON_QTY_MAX, n)
                                      : a.tables,
                              }));
                            }}
                          />
                        </div>
                      ) : null}
                      {def.key === "chairs" && selectedAddons.chairs > 0 ? (
                        <div>
                          <label htmlFor={idAddonChairsQty} className={labelClass(isCrb)}>
                            Quantity
                          </label>
                          <input
                            id={idAddonChairsQty}
                            type="number"
                            min={1}
                            max={ADDON_QTY_MAX}
                            className={cn(inputClass(isCrb), "max-w-[8rem]")}
                            value={selectedAddons.chairs}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const n = parseInt(raw, 10);
                              setSelectedAddons((a) => ({
                                ...a,
                                chairs:
                                  raw === ""
                                    ? 1
                                    : Number.isFinite(n) && n >= 1
                                      ? Math.min(ADDON_QTY_MAX, n)
                                      : a.chairs,
                              }));
                            }}
                          />
                        </div>
                      ) : null}
                      {def.key === "canopy" && selectedAddons.canopy > 0 ? (
                        <div>
                          <label htmlFor={idAddonCanopyQty} className={labelClass(isCrb)}>
                            Quantity
                          </label>
                          <input
                            id={idAddonCanopyQty}
                            type="number"
                            min={1}
                            max={ADDON_QTY_MAX}
                            className={cn(inputClass(isCrb), "max-w-[8rem]")}
                            value={selectedAddons.canopy}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const n = parseInt(raw, 10);
                              setSelectedAddons((a) => ({
                                ...a,
                                canopy:
                                  raw === ""
                                    ? 1
                                    : Number.isFinite(n) && n >= 1
                                      ? Math.min(ADDON_QTY_MAX, n)
                                      : a.canopy,
                              }));
                            }}
                          />
                        </div>
                      ) : null}
                      {def.key === "generator" && selectedAddons.generator > 0 ? (
                        <div>
                          <label htmlFor={idAddonGeneratorQty} className={labelClass(isCrb)}>
                            Quantity
                          </label>
                          <input
                            id={idAddonGeneratorQty}
                            type="number"
                            min={1}
                            max={ADDON_QTY_MAX}
                            className={cn(inputClass(isCrb), "max-w-[8rem]")}
                            value={selectedAddons.generator}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const n = parseInt(raw, 10);
                              setSelectedAddons((a) => ({
                                ...a,
                                generator:
                                  raw === ""
                                    ? 1
                                    : Number.isFinite(n) && n >= 1
                                      ? Math.min(ADDON_QTY_MAX, n)
                                      : a.generator,
                              }));
                            }}
                          />
                        </div>
                      ) : null}
                      {def.key === "extraJumper" && selectedAddons.extraJumper > 0 ? (
                        <div>
                          <label htmlFor={idAddonExtraJumperQty} className={labelClass(isCrb)}>
                            Quantity
                          </label>
                          <input
                            id={idAddonExtraJumperQty}
                            type="number"
                            min={1}
                            max={ADDON_QTY_MAX}
                            className={cn(inputClass(isCrb), "max-w-[8rem]")}
                            value={selectedAddons.extraJumper}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const n = parseInt(raw, 10);
                              setSelectedAddons((a) => ({
                                ...a,
                                extraJumper:
                                  raw === ""
                                    ? 1
                                    : Number.isFinite(n) && n >= 1
                                      ? Math.min(ADDON_QTY_MAX, n)
                                      : a.extraJumper,
                              }));
                            }}
                          />
                        </div>
                      ) : null}
                      <button
                        type="button"
                        className={cn(
                          "mt-auto h-11 rounded-xl text-sm font-black transition active:scale-[0.99]",
                          selected
                            ? isCrb
                              ? "bg-slate-700 text-white ring-1 ring-slate-500 hover:bg-slate-600"
                              : "bg-stone-200 text-stone-900 hover:bg-stone-300"
                            : isCrb
                              ? "bg-cyan-500 text-black hover:bg-cyan-400"
                              : "bg-rose-600 text-white hover:bg-rose-700",
                        )}
                        style={{ borderRadius: "var(--brand-radius-md)" }}
                        onClick={() =>
                          setSelectedAddons((a) => {
                            if (def.key === "tables") {
                              const on = a.tables > 0;
                              return { ...a, tables: on ? 0 : 1 };
                            }
                            if (def.key === "chairs") {
                              const on = a.chairs > 0;
                              return { ...a, chairs: on ? 0 : 1 };
                            }
                            if (def.key === "canopy") {
                              const on = a.canopy > 0;
                              return { ...a, canopy: on ? 0 : 1 };
                            }
                            if (def.key === "generator") {
                              const on = a.generator > 0;
                              return { ...a, generator: on ? 0 : 1 };
                            }
                            return { ...a, extraJumper: a.extraJumper > 0 ? 0 : 1 };
                          })
                        }
                      >
                        {selected ? "Remove" : "Add"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <button
                type="button"
                className={cn(
                  "h-12 rounded-xl px-4 text-sm font-bold underline-offset-4 hover:underline",
                  isCrb ? "text-cyan-200" : "text-rose-700",
                )}
                onClick={goBackFromAddonsToAvailability}
              >
                ← Back
              </button>
              <button
                type="button"
                className={cn(
                  "h-12 rounded-xl px-8 text-base font-black transition active:scale-[0.99]",
                  isCrb ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-rose-600 text-white shadow-lg shadow-rose-900/15 hover:bg-rose-700",
                )}
                style={{ borderRadius: "var(--brand-radius-md)" }}
                onClick={() => setStep(5)}
              >
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <form
            className={cn(
              "mt-8 space-y-5 rounded-2xl p-5 shadow-xl ring-1 sm:p-7",
              isCrb ? "bg-slate-800/70 ring-cyan-500/20 backdrop-blur-md" : "bg-white/80 ring-stone-200/90 backdrop-blur-sm",
            )}
            style={{ borderRadius: "var(--brand-radius-lg)" }}
            onSubmit={(e) => {
              e.preventDefault();
              setErrorMessage(null);
              setStep(6);
            }}
          >
            <div>
              <label htmlFor={idName} className={labelClass(isCrb)}>
                Name
              </label>
              <input
                id={idName}
                name="name"
                type="text"
                autoComplete="name"
                className={inputClass(isCrb)}
                placeholder="Your name"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={idPhone} className={labelClass(isCrb)}>
                Phone
              </label>
              <input
                id={idPhone}
                name="phone"
                type="tel"
                autoComplete="tel"
                className={inputClass(isCrb)}
                placeholder="(555) 000-0000"
                required
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={idNotes} className={labelClass(isCrb)}>
                Notes (optional)
              </label>
              <textarea
                id={idNotes}
                name="notes"
                rows={4}
                className={cn(inputClass(isCrb), "min-h-[120px] resize-y")}
                placeholder="Timing, delivery questions…"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                className={cn(
                  "h-12 rounded-xl px-4 text-sm font-bold underline-offset-4 hover:underline",
                  isCrb ? "text-cyan-200" : "text-rose-700",
                )}
                onClick={goBackFromCustomerToAddons}
              >
                ← Back
              </button>
              <button
                type="submit"
                className={cn(
                  "h-12 rounded-xl px-8 text-base font-black transition active:scale-[0.99]",
                  isCrb ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-rose-600 text-white shadow-lg shadow-rose-900/15 hover:bg-rose-700",
                )}
                style={{ borderRadius: "var(--brand-radius-md)" }}
              >
                Continue to review
              </button>
            </div>
          </form>
        ) : null}

        {step === 6 ? (
          <div
            className={cn(
              "mt-8 space-y-5 rounded-2xl p-5 shadow-xl ring-1 sm:p-7",
              isCrb ? "bg-slate-800/70 ring-cyan-500/20 backdrop-blur-md" : "bg-white/80 ring-stone-200/90 backdrop-blur-sm",
            )}
            style={{ borderRadius: "var(--brand-radius-lg)" }}
          >
            <h2 className={cn("text-lg font-bold", isCrb ? "text-white" : "text-stone-900")}>Review your reservation</h2>
            <dl
              className={cn(
                "space-y-3 text-sm leading-relaxed",
                isCrb ? "text-slate-200" : "text-stone-800",
              )}
            >
              <div>
                <dt className={cn("font-bold", isCrb ? "text-cyan-100/90" : "text-stone-700")}>Selected item</dt>
                <dd>
                  {selectedItem?.name ?? (productForFlow ? `Product (${productForFlow})` : "—")}
                  {productForFlow ? (
                    <span className={cn("block text-xs font-normal", isCrb ? "text-slate-400" : "text-stone-600")}>
                      Quantity: {selectedItemQuantity}
                    </span>
                  ) : null}
                  {selectedItem ? (
                    <div className="mt-3 max-h-[min(420px,55vh)] overflow-y-auto pr-1">
                      <BuildProductDetailFields item={selectedItem} isCrb={isCrb} />
                    </div>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className={cn("font-bold", isCrb ? "text-cyan-100/90" : "text-stone-700")}>Event date</dt>
                <dd>{formDate.trim() || "—"}</dd>
              </div>
              <div>
                <dt className={cn("font-bold", isCrb ? "text-cyan-100/90" : "text-stone-700")}>Event city</dt>
                <dd>{formCity.trim() || "—"}</dd>
              </div>
              <div>
                <dt className={cn("font-bold", isCrb ? "text-cyan-100/90" : "text-stone-700")}>Event start</dt>
                <dd>{windowOptionLabel(eventTime, EVENT_TIME_WINDOW_OPTIONS)}</dd>
              </div>
              <div>
                <dt className={cn("font-bold", isCrb ? "text-cyan-100/90" : "text-stone-700")}>
                  Delivery
                </dt>
                <dd
                  className={cn(
                    "mt-0.5 text-sm font-medium leading-relaxed",
                    isCrb ? "text-slate-300" : "text-stone-700",
                  )}
                >
                  {DELIVERY_EXPECTATION_HELPER}
                </dd>
              </div>
              <div>
                <dt className={cn("font-bold", isCrb ? "text-cyan-100/90" : "text-stone-700")}>Pickup window preference</dt>
                <dd>{windowOptionLabel(preferredPickupTime, PREFERRED_TIME_WINDOW_OPTIONS)}</dd>
              </div>
              {ADDON_CARD_CONFIG.some((def) => selectedAddons[def.key] > 0) ? (
                <div>
                  <dt className={cn("font-bold", isCrb ? "text-cyan-100/90" : "text-stone-700")}>Add-ons</dt>
                  <dd className="mt-1 space-y-0.5">
                    {ADDON_CARD_CONFIG.filter((def) => selectedAddons[def.key] > 0).map((def) => (
                      <p key={def.key}>
                        {def.name}: {selectedAddons[def.key]}
                      </p>
                    ))}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className={cn("font-bold", isCrb ? "text-cyan-100/90" : "text-stone-700")}>Your name</dt>
                <dd>{formName.trim() || "—"}</dd>
              </div>
              <div>
                <dt className={cn("font-bold", isCrb ? "text-cyan-100/90" : "text-stone-700")}>Phone</dt>
                <dd>{formPhone.trim() || "—"}</dd>
              </div>
              {formNotes.trim() ? (
                <div>
                  <dt className={cn("font-bold", isCrb ? "text-cyan-100/90" : "text-stone-700")}>Notes</dt>
                  <dd className="whitespace-pre-wrap">{formNotes.trim()}</dd>
                </div>
              ) : null}
            </dl>
            <div
              className={cn(
                "space-y-1 rounded-xl px-4 py-3 text-sm font-semibold",
                isCrb ? "bg-cyan-500/10 text-cyan-50 ring-1 ring-cyan-500/25" : "bg-rose-50 text-rose-950 ring-1 ring-rose-200/80",
              )}
            >
              <p>Reservation subtotal: {formatUsd(reservationPricing.subtotal)}</p>
              <p>Deposit due today: {formatUsd(reservationPricing.depositAmount)}</p>
              <p>Balance due at delivery: {formatUsd(reservationPricing.balanceDue)}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <button
                type="button"
                className={cn(
                  "h-12 rounded-xl px-4 text-sm font-bold underline-offset-4 hover:underline",
                  isCrb ? "text-cyan-200" : "text-rose-700",
                )}
                onClick={goBackFromReviewToContact}
              >
                ← Back
              </button>
              <button
                type="button"
                className={cn(
                  "h-12 rounded-xl px-8 text-base font-black transition active:scale-[0.99]",
                  isCrb ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-rose-600 text-white shadow-lg shadow-rose-900/15 hover:bg-rose-700",
                )}
                style={{ borderRadius: "var(--brand-radius-md)" }}
                onClick={() => setStep(7)}
              >
                Continue to rental rules
              </button>
            </div>
          </div>
        ) : null}

        {step === 7 ? (
          <div
            className={cn(
              "mt-8 space-y-5 rounded-2xl p-5 shadow-xl ring-1 sm:p-7",
              isCrb ? "bg-slate-800/70 ring-cyan-500/20 backdrop-blur-md" : "bg-white/80 ring-stone-200/90 backdrop-blur-sm",
            )}
            style={{ borderRadius: "var(--brand-radius-lg)" }}
          >
            <h2 className={cn("text-lg font-bold", isCrb ? "text-white" : "text-stone-900")}>
              Rental rules & responsibility
            </h2>
            <p className={cn("text-sm leading-relaxed", isCrb ? "text-slate-300" : "text-stone-600")}>
              Please read before paying your deposit.
            </p>
            <div>
              <p className={cn("mb-2 text-sm font-bold", isCrb ? "text-cyan-100/90" : "text-stone-700")}>General rules</p>
              <ul
                className={cn(
                  "list-disc space-y-2 pl-5 text-sm leading-relaxed",
                  isCrb ? "text-slate-200" : "text-stone-800",
                )}
              >
                {GENERAL_RENTAL_RULES.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <fieldset className="space-y-2">
              <legend className={cn("text-sm font-bold", isCrb ? "text-cyan-100/90" : "text-stone-700")}>
                Do you have pets at the event location?
              </legend>
              <div className="flex flex-wrap gap-4">
                <label className={cn("flex cursor-pointer items-center gap-2 text-sm", isCrb ? "text-slate-200" : "text-stone-800")}>
                  <input
                    id={idPetsYes}
                    type="radio"
                    name="pets_at_location"
                    className="size-4 shrink-0 accent-current"
                    checked={petsAtLocation === "yes"}
                    onChange={() => setPetsAtLocation("yes")}
                  />
                  Yes
                </label>
                <label className={cn("flex cursor-pointer items-center gap-2 text-sm", isCrb ? "text-slate-200" : "text-stone-800")}>
                  <input
                    id={idPetsNo}
                    type="radio"
                    name="pets_at_location"
                    className="size-4 shrink-0 accent-current"
                    checked={petsAtLocation === "no"}
                    onChange={() => setPetsAtLocation("no")}
                  />
                  No
                </label>
              </div>
            </fieldset>
            <p className={cn("text-sm leading-relaxed", isCrb ? "text-slate-400" : "text-stone-600")}>
              No additional item-specific rules.
            </p>
            <div className="flex items-start gap-3">
              <input
                id={idRentalRulesAgree}
                type="checkbox"
                className="mt-1 size-4 shrink-0 rounded border-stone-300 accent-cyan-500"
                checked={rentalRulesAgreed}
                onChange={(e) => setRentalRulesAgreed(e.target.checked)}
              />
              <label htmlFor={idRentalRulesAgree} className={cn("text-sm leading-snug", isCrb ? "text-slate-200" : "text-stone-800")}>
                I have read and agree to these rental rules.
              </label>
            </div>
            <div>
              <label htmlFor={idAgreementSignature} className={labelClass(isCrb)}>
                Type your full name to accept
              </label>
              <input
                id={idAgreementSignature}
                name="agreement_signature"
                type="text"
                autoComplete="name"
                className={inputClass(isCrb)}
                placeholder="Full legal name"
                value={agreementSignature}
                onChange={(e) => setAgreementSignature(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <button
                type="button"
                className={cn(
                  "h-12 rounded-xl px-4 text-sm font-bold underline-offset-4 hover:underline",
                  isCrb ? "text-cyan-200" : "text-rose-700",
                )}
                onClick={goBackFromAgreementToReview}
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={
                  !rentalRulesAgreed || petsAtLocation === null || !agreementSignature.trim()
                }
                className={cn(
                  "h-12 rounded-xl px-8 text-base font-black transition active:scale-[0.99]",
                  "disabled:pointer-events-none disabled:opacity-70",
                  isCrb ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-rose-600 text-white shadow-lg shadow-rose-900/15 hover:bg-rose-700",
                )}
                style={{ borderRadius: "var(--brand-radius-md)" }}
                onClick={() => setStep(8)}
              >
                Continue to payment
              </button>
            </div>
          </div>
        ) : null}

        {step === 8 ? (
          <div
            className={cn(
              "mt-8 space-y-5 rounded-2xl p-5 shadow-xl ring-1 sm:p-7",
              isCrb ? "bg-slate-800/70 ring-cyan-500/20 backdrop-blur-md" : "bg-white/80 ring-stone-200/90 backdrop-blur-sm",
            )}
            style={{ borderRadius: "var(--brand-radius-lg)" }}
          >
            <h2 className={cn("text-lg font-bold", isCrb ? "text-white" : "text-stone-900")}>Secure your reservation</h2>
            <p className={cn("text-base font-semibold leading-relaxed", isCrb ? "text-cyan-50" : "text-stone-800")}>
              Send your deposit with Zelle to reserve your item.
            </p>
            <div
              className={cn(
                "space-y-1 rounded-xl px-4 py-3 text-sm font-semibold",
                isCrb ? "bg-cyan-500/10 text-cyan-50 ring-1 ring-cyan-500/25" : "bg-rose-50 text-rose-950 ring-1 ring-rose-200/80",
              )}
            >
              <p>Reservation subtotal: {formatUsd(reservationPricing.subtotal)}</p>
              <p>Deposit due today: {formatUsd(reservationPricing.depositAmount)}</p>
              <p>Balance due at delivery: {formatUsd(reservationPricing.balanceDue)}</p>
            </div>
            <div
              className={cn(
                "space-y-3 rounded-xl px-4 py-3 text-sm",
                isCrb ? "bg-slate-900/50 text-slate-200 ring-1 ring-slate-600/40" : "bg-stone-100 text-stone-800 ring-1 ring-stone-200",
              )}
            >
              <p className={cn("font-bold", isCrb ? "text-cyan-100" : "text-stone-700")}>
                Zelle payments
              </p>
              <p>
                <span className={cn("font-semibold", isCrb ? "text-cyan-200/90" : "text-stone-600")}>
                  Send to:{" "}
                </span>
                <a
                  href={`tel:${formatPhoneTel(BRAND_CONTACT.payments.zelle)}`}
                  className={cn(
                    "font-semibold underline decoration-2 underline-offset-2",
                    isCrb ? "text-cyan-100 hover:text-white" : "text-rose-950 hover:text-rose-800",
                  )}
                >
                  {BRAND_CONTACT.payments.zelle}
                </a>
              </p>
              <div>
                <p className={cn("font-bold", isCrb ? "text-cyan-100" : "text-stone-700")}>Amount:</p>
                <p>Deposit due today: {formatUsd(reservationPricing.depositAmount)}</p>
              </div>
            </div>
            <ol
              className={cn(
                "list-decimal space-y-2 pl-5 text-sm leading-relaxed",
                isCrb ? "text-slate-200" : "text-stone-700",
              )}
            >
              <li>Send Zelle for the deposit amount above.</li>
              <li>Use your name and event date in the memo.</li>
              <li>Upload your confirmation below, then finish your reservation.</li>
            </ol>
            <div>
              <label htmlFor={idPaymentProof} className={labelClass(isCrb)}>
                Upload your Zelle payment confirmation
              </label>
              <input
                id={idPaymentProof}
                name="payment_proof"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                required
                className={cn(
                  "block w-full cursor-pointer rounded-xl border px-4 py-3 text-sm outline-none file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:px-4 file:py-2 file:text-sm file:font-bold",
                  isCrb
                    ? "border-slate-600/80 bg-slate-800/60 text-slate-200 file:bg-cyan-500 file:text-black"
                    : "border-stone-200 bg-white/90 text-stone-900 file:bg-rose-600 file:text-white",
                )}
                disabled={isSubmitting}
                onChange={handlePaymentProofChange}
              />
              {paymentProofPreviewUrl ? (
                <div className="mt-3">
                  <img
                    src={paymentProofPreviewUrl}
                    alt="Payment confirmation preview"
                    className={cn(
                      "max-h-48 w-auto max-w-full rounded-lg border object-contain",
                      isCrb ? "border-slate-600" : "border-stone-200",
                    )}
                  />
                </div>
              ) : null}
              {paymentFile &&
              !paymentProofPreviewUrl &&
              paymentFile.type.toLowerCase() === "application/pdf" ? (
                <p
                  className={cn(
                    "mt-2 break-all text-sm font-medium",
                    isCrb ? "text-slate-300" : "text-stone-700",
                  )}
                >
                  {paymentFile.name}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <button
                type="button"
                className={cn(
                  "h-12 rounded-xl px-4 text-sm font-bold underline-offset-4 hover:underline",
                  isCrb ? "text-cyan-200" : "text-rose-700",
                )}
                onClick={goBackFromPaymentToAgreement}
                disabled={isSubmitting}
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={isSubmitting || !paymentFile}
                className={cn(
                  "h-12 rounded-xl px-6 text-base font-black transition active:scale-[0.99] sm:px-8",
                  "disabled:pointer-events-none disabled:opacity-70",
                  isCrb ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-rose-600 text-white shadow-lg shadow-rose-900/15 hover:bg-rose-700",
                )}
                style={{ borderRadius: "var(--brand-radius-md)" }}
                onClick={() => {
                  void submitReservationLead();
                }}
              >
                {isSubmitting ? "Sending…" : "I sent payment / finish reservation"}
              </button>
            </div>
          </div>
        ) : null}
      </Container>
    </div>
  );
}
