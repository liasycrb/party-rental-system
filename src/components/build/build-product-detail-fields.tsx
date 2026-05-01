"use client";

import type { ReactNode } from "react";
import type { BuildInventoryOption } from "@/lib/inventory/get-build-inventory-options";
import {
  customerSafeProductNote,
  effectiveListingPrice,
  formatDeliverySummary,
  formatFromPriceUsd,
  formatSurfacesList,
  formatUseTypeLabel,
  splitRulesToLines,
} from "@/lib/catalog/product-display-helpers";
import { cn } from "@/lib/utils/cn";

function SpecRow({
  label,
  children,
  isCrb,
}: {
  label: string;
  children: ReactNode;
  isCrb: boolean;
}) {
  return (
    <div>
      <dt className={cn("font-bold", isCrb ? "text-cyan-100/90" : "text-stone-700")}>
        {label}
      </dt>
      <dd className={cn("mt-0.5", isCrb ? "text-slate-200" : "text-stone-800")}>
        {children}
      </dd>
    </div>
  );
}

/** Customer-facing specs for /build (selection + review). */
export function BuildProductDetailFields({
  item,
  isCrb,
}: {
  item: BuildInventoryOption;
  isCrb: boolean;
}) {
  const listPrice = effectiveListingPrice(item);
  const surfaces = formatSurfacesList(item.allowed_surfaces);
  const useType = formatUseTypeLabel(item.use_type);
  const rules = splitRulesToLines(item.item_rules);
  const note = customerSafeProductNote(item.notes ?? null);
  const delivery = formatDeliverySummary({
    delivery_included: item.delivery_included,
    delivery_fee: item.delivery_fee,
  });

  return (
    <dl className={cn("space-y-3 text-sm leading-relaxed", isCrb ? "text-slate-200" : "text-stone-800")}>
      <SpecRow label="Price" isCrb={isCrb}>
        {formatFromPriceUsd(listPrice)}
      </SpecRow>
      <SpecRow label="Quantity available" isCrb={isCrb}>
        {item.quantity_active}
      </SpecRow>
      {(item.dimensions ?? "").trim() ? (
        <SpecRow label="Dimensions" isCrb={isCrb}>
          {(item.dimensions ?? "").trim()}
        </SpecRow>
      ) : null}
      {(item.required_space ?? "").trim() ? (
        <SpecRow label="Setup space" isCrb={isCrb}>
          {(item.required_space ?? "").trim()}
        </SpecRow>
      ) : null}
      {useType ? (
        <SpecRow label="Use" isCrb={isCrb}>
          {useType}
        </SpecRow>
      ) : null}
      {surfaces ? (
        <SpecRow label="Surfaces" isCrb={isCrb}>
          {surfaces}
        </SpecRow>
      ) : null}
      {delivery ? (
        <SpecRow label="Delivery" isCrb={isCrb}>
          {delivery}
        </SpecRow>
      ) : null}
      {rules.length > 0 ? (
        <SpecRow label="Rules" isCrb={isCrb}>
          <ul className="mt-1 list-inside list-disc space-y-1">
            {rules.slice(0, 12).map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        </SpecRow>
      ) : null}
      {note ? (
        <SpecRow label="Notes" isCrb={isCrb}>
          <span className="whitespace-pre-wrap">{note}</span>
        </SpecRow>
      ) : null}
    </dl>
  );
}
