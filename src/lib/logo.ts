/**
 * Helper URL logo.
 *
 * Logo asli disimpan di ImageKit (`ik.imagekit.io/kuh/istock/...`), tetapi
 * domain tersebut diblokir Internet Positif di Indonesia. Semua logo
 * di-proxy lewat `/api/logo` agar browser memuatnya dari domain sendiri.
 */

/** Logo perusahaan/saham: `company/{SYMBOL}.png`. */
export function companyLogoUrl(symbol: string): string {
  return `/api/logo?path=${encodeURIComponent(`company/${symbol}.png`)}`;
}

/** Logo indeks/sektor: `indeks/{SYMBOL}.png`. */
export function indexLogoUrl(symbol: string): string {
  return `/api/logo?path=${encodeURIComponent(`indeks/${symbol}.png`)}`;
}
