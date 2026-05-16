"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

/**
 * Lazy-loaded Google Places Autocomplete on a plain <input>. Wraps the legacy
 * `google.maps.places.Autocomplete` widget — simpler React integration than the
 * web component, and it auto-manages session tokens internally so billing is
 * the same Per Session SKU.
 *
 * Resilient:
 * - If NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY is unset, renders a plain input.
 * - If the Maps JS script fails to load (ad blocker, network, bad key,
 *   referrer-restriction reject), renders a plain input and logs the error.
 * - The element is always a real text input, so the parent form's submit /
 *   onChange behavior is unaffected by autocomplete state.
 */

export type DeliveryAddressSelection = {
  formattedAddress: string;
  placeId: string;
};

type Props = {
  id: string;
  value: string;
  inputClassName: string;
  placeholder?: string;
  onTextChange: (value: string) => void;
  /** Fires when the customer picks a Google suggestion. */
  onSelect: (selection: DeliveryAddressSelection) => void;
};

type MinimalAutocomplete = {
  addListener: (
    event: string,
    handler: () => void,
  ) => { remove: () => void };
  getPlace: () => {
    place_id?: string;
    formatted_address?: string;
  };
};

type MinimalGoogleMaps = {
  places: {
    Autocomplete: new (
      input: HTMLInputElement,
      options: {
        types?: string[];
        componentRestrictions?: { country: string | string[] };
        fields?: string[];
      },
    ) => MinimalAutocomplete;
  };
};

declare global {
  interface Window {
    google?: {
      maps?: MinimalGoogleMaps;
    };
  }
}

let loaderPromise: Promise<MinimalGoogleMaps> | null = null;

function loadGoogleMaps(apiKey: string): Promise<MinimalGoogleMaps> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadGoogleMaps called on server"));
  }
  if (window.google?.maps?.places) {
    return Promise.resolve(window.google.maps);
  }
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<MinimalGoogleMaps>((resolve, reject) => {
    const settle = () => {
      const maps = window.google?.maps;
      if (maps?.places) {
        resolve(maps);
      } else {
        loaderPromise = null;
        reject(new Error("Google Maps script loaded but places library missing"));
      }
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-gmaps-loader="1"]`,
    );
    if (existing) {
      existing.addEventListener("load", settle, { once: true });
      existing.addEventListener(
        "error",
        () => {
          loaderPromise = null;
          reject(new Error("Existing Google Maps script failed to load"));
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.dataset.gmapsLoader = "1";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}&libraries=places&v=weekly&loading=async`;
    script.addEventListener("load", settle, { once: true });
    script.addEventListener(
      "error",
      () => {
        loaderPromise = null;
        reject(new Error("Google Maps script failed to load"));
      },
      { once: true },
    );
    document.head.appendChild(script);
  });

  return loaderPromise;
}

export function DeliveryAddressAutocomplete({
  id,
  value,
  inputClassName,
  placeholder,
  onTextChange,
  onSelect,
}: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;
  const inputRef = useRef<HTMLInputElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Tracks whether the autocomplete widget actually attached. When false the
  // input still works — it's just a regular text input. We don't surface this
  // to the user except to omit telemetry-style hints.
  const [_attached, setAttached] = useState(false);

  useEffect(() => {
    if (!apiKey || !inputRef.current) return;
    let cancelled = false;
    let listener: { remove: () => void } | null = null;

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !inputRef.current) return;
        const autocomplete = new maps.places.Autocomplete(inputRef.current, {
          types: ["address"],
          componentRestrictions: { country: "us" },
          fields: ["place_id", "formatted_address"],
        });

        listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const placeId = place.place_id ?? "";
          const formattedAddress = place.formatted_address ?? "";
          if (placeId && formattedAddress) {
            onSelectRef.current({ formattedAddress, placeId });
          }
        });
        setAttached(true);
      })
      .catch((err: unknown) => {
        console.error("[DeliveryAutocomplete] failed to load", err);
      });

    return () => {
      cancelled = true;
      listener?.remove();
    };
  }, [apiKey]);

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    onTextChange(e.target.value);
  }

  return (
    <input
      id={id}
      ref={inputRef}
      type="text"
      autoComplete="off"
      className={inputClassName}
      placeholder={
        placeholder ?? "Start typing your delivery address…"
      }
      value={value}
      onChange={handleInputChange}
    />
  );
}
