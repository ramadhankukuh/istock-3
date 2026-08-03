import type { SeasonalitySummary, SeasonalityTable } from "@/features/chart/types";

type DailyClose = {
  date: Date;
  close: number | null | undefined;
};

type MonthEnd = {
  year: number;
  month: number; // 0-11
  close: number;
  date: Date;
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const QUARTER_LABELS = ["Q1", "Q2", "Q3", "Q4"];

/**
 * Collect the last available close of every (year, month) present in the
 * historical daily series, sorted chronologically.
 */
function buildMonthEnds(history: DailyClose[]): MonthEnd[] {
  const map = new Map<string, MonthEnd>();

  for (const point of history) {
    if (
      point.close === null ||
      point.close === undefined ||
      !Number.isFinite(point.close)
    ) {
      continue;
    }

    const date = new Date(point.date);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const key = `${year}-${month}`;
    const existing = map.get(key);

    if (!existing || date.getTime() > existing.date.getTime()) {
      map.set(key, { year, month, close: Number(point.close), date });
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
}

function monthlyReturns(monthEnds: MonthEnd[]) {
  const out: { year: number; month: number; returnPct: number }[] = [];

  for (let i = 1; i < monthEnds.length; i += 1) {
    const prev = monthEnds[i - 1];
    const cur = monthEnds[i];
    const returnPct = ((cur.close - prev.close) / prev.close) * 100;
    out.push({ year: cur.year, month: cur.month, returnPct });
  }

  return out;
}

function quarterlyReturns(monthEnds: MonthEnd[]) {
  const quarterEnds = monthEnds.filter((m) => m.month % 3 === 2); // Mar, Jun, Sep, Dec
  const out: { year: number; quarter: number; returnPct: number }[] = [];

  for (let i = 1; i < quarterEnds.length; i += 1) {
    const prev = quarterEnds[i - 1];
    const cur = quarterEnds[i];
    const returnPct = ((cur.close - prev.close) / prev.close) * 100;
    out.push({ year: cur.year, quarter: Math.floor(cur.month / 3), returnPct });
  }

  return out;
}

function average(values: (number | null)[]): number | null {
  const finite = values.filter(
    (v): v is number => v !== null && Number.isFinite(v),
  );
  if (finite.length === 0) return null;
  return finite.reduce((a, b) => a + b, 0) / finite.length;
}

function winRatePercent(values: (number | null)[]): number | null {
  const finite = values.filter(
    (v): v is number => v !== null && Number.isFinite(v),
  );
  if (finite.length === 0) return null;
  const positive = finite.filter((v) => v > 0).length;
  return Math.round((positive / finite.length) * 100);
}

function buildTable(
  labels: string[],
  years: number[],
  cellsByYear: Map<number, (number | null)[]>,
  totalsByYear: Map<number, number | null>,
): SeasonalityTable {
  const columns = totalsByYear.size > 0 ? [...labels, "Total"] : labels;

  const rows: Record<number, (number | null)[]> = {};
  for (const year of years) {
    const base = cellsByYear.get(year) ?? labels.map(() => null);
    const total = totalsByYear.get(year) ?? null;
    rows[year] = totalsByYear.size > 0 ? [...base, total] : base;
  }

  const avg = columns.map((_, colIndex) =>
    average(years.map((year) => rows[year][colIndex])),
  );
  const prob = columns.map((_, colIndex) =>
    winRatePercent(years.map((year) => rows[year][colIndex])),
  );

  return { labels: columns, years, rows, avg, prob };
}

function buildSummary(
  table: SeasonalityTable,
  periodLabels: string[],
): SeasonalitySummary {
  let bestIndex = -1;
  let worstIndex = -1;

  periodLabels.forEach((_, index) => {
    const value = table.avg[index];
    if (value === null) return;
    if (bestIndex === -1 || value > (table.avg[bestIndex] ?? -Infinity)) {
      bestIndex = index;
    }
    if (worstIndex === -1 || value < (table.avg[worstIndex] ?? Infinity)) {
      worstIndex = index;
    }
  });

  const positiveCount = periodLabels.filter(
    (_, index) => (table.avg[index] ?? 0) > 0,
  ).length;

  return {
    bestLabel: bestIndex >= 0 ? table.labels[bestIndex] : null,
    bestValue: bestIndex >= 0 ? table.avg[bestIndex] : null,
    worstLabel: worstIndex >= 0 ? table.labels[worstIndex] : null,
    worstValue: worstIndex >= 0 ? table.avg[worstIndex] : null,
    winRatePercent: periodLabels.length
      ? Math.round((positiveCount / periodLabels.length) * 100)
      : null,
    winRateFraction: periodLabels.length
      ? `${positiveCount}/${periodLabels.length} pos`
      : null,
  };
}

export function computeSeasonality(history: DailyClose[]) {
  const monthEnds = buildMonthEnds(history);
  const monthRet = monthlyReturns(monthEnds);
  const quarterRet = quarterlyReturns(monthEnds);

  const years = Array.from(
    new Set(monthEnds.map((m) => m.year)),
  ).sort((a, b) => b - a);

  // ── Monthly table ────────────────────────────────────────────────
  const monthlyCells = new Map<number, (number | null)[]>();
  for (const year of years) {
    monthlyCells.set(year, MONTH_LABELS.map(() => null));
  }
  for (const point of monthRet) {
    const row = monthlyCells.get(point.year);
    if (row) row[point.month] = point.returnPct;
  }
  const monthlyTable = buildTable(
    MONTH_LABELS,
    years,
    monthlyCells,
    new Map(),
  );

  // ── Quarterly table + annual total ──────────────────────────────
  const quarterlyCells = new Map<number, (number | null)[]>();
  for (const year of years) {
    quarterlyCells.set(year, QUARTER_LABELS.map(() => null));
  }
  for (const point of quarterRet) {
    const row = quarterlyCells.get(point.year);
    if (row) row[point.quarter] = point.returnPct;
  }

  const totalsByYear = new Map<number, number | null>();
  for (const year of years) {
    const cells = quarterlyCells.get(year) ?? [];
    const present = cells.filter(
      (v): v is number => v !== null && Number.isFinite(v),
    );
    if (present.length === 0) {
      totalsByYear.set(year, null);
      continue;
    }
    const compounded =
      present.reduce((acc, v) => acc * (1 + v / 100), 1) - 1;
    totalsByYear.set(year, compounded * 100);
  }

  const quarterlyTable = buildTable(
    QUARTER_LABELS,
    years,
    quarterlyCells,
    totalsByYear,
  );

  return {
    quarterly: quarterlyTable,
    monthly: monthlyTable,
    quarterlySummary: buildSummary(quarterlyTable, QUARTER_LABELS),
    monthlySummary: buildSummary(monthlyTable, MONTH_LABELS),
  };
}
