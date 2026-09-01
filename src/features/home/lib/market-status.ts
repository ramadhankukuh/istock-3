import tradHolidays from "@/lib/data/tradHoliday.json";

export function getCountdown(
  now: Date,
  targetHour: number,
  targetMinute: number,
  label: string,
) {
  const target = new Date(now);
  target.setHours(targetHour, targetMinute, 0, 0);
  const diff = target.getTime() - now.getTime();
  const h = Math.floor(diff / 1000 / 3600);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return `${label}: ${h}j ${m}m ${s}d`;
}

export function isHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;
  return tradHolidays.some((holiday) => holiday.date === dateStr);
}

export function getHolidayEvent(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;
  const holiday = tradHolidays.find((h) => h.date === dateStr);
  return holiday ? holiday.event : "Holiday";
}

export function getCountdownNextTradingDay(current: Date): string {
  let nextDay = new Date(current);

  const day = current.getDay();
  if (day >= 1 && day <= 5 && current.getHours() < 9 && !isHoliday(current)) {
    nextDay.setHours(9, 0, 0, 0);
  } else {
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(9, 0, 0, 0);

    while (
      nextDay.getDay() === 0 ||
      nextDay.getDay() === 6 ||
      isHoliday(nextDay)
    ) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
  }

  const diff = nextDay.getTime() - current.getTime();
  const h = Math.floor(diff / 1000 / 3600);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);

  return `Open In: ${h}j ${m}m ${s}d`;
}

export type MarketStatus = {
  status: string;
  countdown: string;
  holiday: string;
};

export function getMarketStatus(now: Date): MarketStatus {
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const time = hour * 60 + minute;

  let status = "";
  let countdown = "";
  let holiday = "";

  if (isHoliday(now)) {
    holiday = getHolidayEvent(now);
    status = "MARKET CLOSE - HOLIDAY";
    countdown = getCountdownNextTradingDay(now);
  } else if (day === 0 || day === 6) {
    status = "MARKET CLOSE - WEEKEND";
    countdown = getCountdownNextTradingDay(now);
  } else if (day >= 1 && day <= 4) {
    if (time >= 9 * 60 && time < 12 * 60) {
      status = "MARKET OPEN - SESI I";
      countdown = getCountdown(now, 12, 0, "Sesi I End In");
    } else if (time >= 12 * 60 && time < 13 * 60 + 30) {
      status = "MARKET BREAK - LUNCH TIME";
      countdown = getCountdown(now, 13, 30, "Break End In");
    } else if (time >= 13 * 60 + 30 && time < 16 * 60) {
      status = "MARKET OPEN - SESI II";
      countdown = getCountdown(now, 16, 0, "Sesi II End In");
    } else {
      status = "MARKET CLOSE - WAITING";
      countdown = getCountdownNextTradingDay(now);
    }
  } else if (day === 5) {
    if (time >= 9 * 60 && time < 11 * 60 + 30) {
      status = "MARKET OPEN - SESI I";
      countdown = getCountdown(now, 11, 30, "Sesi I End In");
    } else if (time >= 11 * 60 + 30 && time < 14 * 60) {
      status = "MARKET BREAK - LUNCH TIME";
      countdown = getCountdown(now, 14, 0, "Break End In");
    } else if (time >= 14 * 60 && time < 16 * 60) {
      status = "MARKET OPEN - SESI II";
      countdown = getCountdown(now, 16, 0, "Sesi II End In");
    } else {
      status = "MARKET CLOSE - WAITING";
      countdown = getCountdownNextTradingDay(now);
    }
  }

  return { status, countdown, holiday };
}
