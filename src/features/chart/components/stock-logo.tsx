"use client";

import { useState } from "react";

/** Base URL logo saham dari ImageKit (pola sama seperti /explore). */
const IMAGEKIT_BASE = "https://ik.imagekit.io/kuh/istock/company";

type Props = {
  symbol: string;
  /** Diameter avatar dalam piksel. Default 40. */
  size?: number;
};

/** Hash sederhana → hue stabil per symbol untuk warna avatar inisial. */
function hashHue(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 360;
}

/**
 * Logo saham dari ImageKit (`ik.imagekit.io/kuh/istock/company/{symbol}.png`),
 * fallback ke avatar inisial bila gambar gagal dimuat.
 */
export function StockLogo({ symbol, size = 40 }: Props) {
  const [failed, setFailed] = useState(false);

  const initials = symbol.slice(0, 2).toUpperCase();

  const fallback = (
    <span
      className="flex shrink-0 select-none items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(12, Math.round(size * 0.4)),
        backgroundColor: `hsl(${hashHue(symbol)} 62% 46%)`,
      }}
      aria-label={`Logo ${symbol}`}
    >
      {initials}
    </span>
  );

  if (!symbol || failed) {
    return fallback;
  }

  return (
    <img
      src={`${IMAGEKIT_BASE}/${encodeURIComponent(symbol)}.png?tr=f-auto`}
      alt={`Logo ${symbol}`}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full bg-(--surface-strong) object-contain"
      style={{ width: size, height: size }}
    />
  );
}
