"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { LOCAL_PUBLIC_IMAGE_FALLBACKS } from "@/lib/catalog/local-image-fallbacks";

type CatalogImageProps = ImageProps & {
  src: ImageProps["src"];
};

export function CatalogImage({ src, onError, ...rest }: CatalogImageProps) {
  const path = typeof src === "string" ? src : "";

  if (!path) {
    return (
      <div
        className={rest.className}
        style={{ background: "#e5e7eb", width: "100%", height: "100%" }}
        aria-hidden
      />
    );
  }

  const fallback = path ? LOCAL_PUBLIC_IMAGE_FALLBACKS[path] : undefined;
  const [resolved, setResolved] = useState(src);

  if (!fallback) {
    return <Image src={src} onError={onError} {...rest} />;
  }

  return (
    <Image
      {...rest}
      src={resolved}
      onError={(e) => {
        if (typeof src === "string" && resolved === src) {
          setResolved(fallback);
        }
        onError?.(e);
      }}
    />
  );
}
