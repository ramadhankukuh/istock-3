import tradHolidays from "@/lib/data/tradHoliday.json";

/**
 * Helper hari bursa IDX (WIB).
 *
 * Dipakai oleh cron swing screener supaya:
 *   - Sabtu/Minggu tidak request ke IDX.
 *   - Hari libur nasional / cuti bersama / libur bursa (dari tradHoliday.json)
 *     tidak request ke IDX.
 *
 * Semua perhitungan tanggal memakai zona waktu Asia/Jakarta supaya konsisten
 * dengan jadwal cron Vercel (UTC) dan jam bursa WIB.
 */

const HOLIDAY_SET = new Set(tradHolidays.map((h) => h.date));

const WIB_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Ambil komponen tanggal WIB (YYYY-MM-DD) dari sebuah Date. */
export function toWIBDateString(date: Date = new Date()): string {
  // en-CA menghasilkan format YYYY-MM-DD.
  return WIB_DATE_FORMATTER.format(date);
}

/** Hari dalam seminggu (0=Minggu, 6=Sabtu) untuk tanggal WIB. */
export function getWIBWeekday(date: Date = new Date()): number {
  const [year, month, day] = toWIBDateString(date).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** Apakah tanggal (YYYY-MM-DD) termasuk libur bursa. */
export function isHolidayDate(dateStr: string): boolean {
  return HOLIDAY_SET.has(dateStr);
}

/** Event libur untuk tanggal (YYYY-MM-DD), atau null kalau bukan libur. */
export function getHolidayEvent(dateStr: string): string | null {
  return tradHolidays.find((h) => h.date === dateStr)?.event ?? null;
}

/** Apakah tanggal (YYYY-MM-DD) adalah hari bursa (Sen-Jum & bukan libur). */
export function isTradingDay(dateStr: string): boolean {
  const [year, month, day] = dateStr.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  if (weekday === 0 || weekday === 6) return false;
  return !isHolidayDate(dateStr);
}

/** Tambah/kurangi hari kalender pada string YYYY-MM-DD. */
export function addDays(dateStr: string, delta: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

/** Hari bursa sebelumnya (strictly before `dateStr`). */
export function previousTradingDay(dateStr: string): string {
  let cursor = addDays(dateStr, -1);
  while (!isTradingDay(cursor)) {
    cursor = addDays(cursor, -1);
  }
  return cursor;
}

/** Hari bursa berikutnya (strictly after `dateStr`). */
export function nextTradingDay(dateStr: string): string {
  let cursor = addDays(dateStr, 1);
  while (!isTradingDay(cursor)) {
    cursor = addDays(cursor, 1);
  }
  return cursor;
}

/**
 * Daftar hari bursa dari `startStr` s/d `endStr` (inklusif), ascending.
 * Berguna untuk backfill: hanya hari bursa yang di-request ke IDX.
 */
export function getTradingDaysBetween(
  startStr: string,
  endStr: string,
): string[] {
  const days: string[] = [];
  let cursor = startStr;

  while (cursor <= endStr) {
    if (isTradingDay(cursor)) days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return days;
}
