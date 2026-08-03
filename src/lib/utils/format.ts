export function formatDecimal(value: string) {
  return value.replace(".", ",");
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatRupiah(value: number) {
  return `Rp ${formatNumber(Math.round(value))}`;
}

export function formatPercent(value: number) {
  const absolute = Math.abs(value).toFixed(2).replace(".", ",");
  return `${value >= 0 ? "+" : "-"}${absolute}%`;
}

export function formatCompactId(value: number) {
  const absolute = Math.abs(value);

  const formatValue = (divisor: number, suffix: string) => {
    const compact = new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(absolute / divisor);
    return `${value < 0 ? "-" : ""}${compact} ${suffix}`;
  };

  if (absolute >= 1_000_000_000_000) return formatValue(1_000_000_000_000, "T");
  if (absolute >= 1_000_000_000) return formatValue(1_000_000_000, "M");
  if (absolute >= 1_000_000) return formatValue(1_000_000, "Jt");
  if (absolute >= 1_000) return formatValue(1_000, "K");

  return `${value < 0 ? "-" : ""}${new Intl.NumberFormat("id-ID").format(absolute)}`;
}

export function formatCompactRupiah(value: number) {
  return `Rp ${formatCompactId(value)}`;
}

export function formatDateId(yyyymmdd: string) {
  if (!yyyymmdd || yyyymmdd.length !== 8) {
    return yyyymmdd;
  }

  const year = Number(yyyymmdd.slice(0, 4));
  const month = Number(yyyymmdd.slice(4, 6)) - 1;
  const day = Number(yyyymmdd.slice(6, 8));
  const date = new Date(year, month, day);

  if (Number.isNaN(date.getTime())) {
    return yyyymmdd;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
