export type BoardType = "main" | "acceleration";

export const SETTINGS = {
  main: {
    rules: [
      { min: 0, max: 200, araPercent: 35, arbPercent: 15, tick: 1 },
      { min: 200, max: 500, araPercent: 25, arbPercent: 15, tick: 2 },
      { min: 500, max: 2000, araPercent: 25, arbPercent: 15, tick: 5 },
      { min: 2000, max: 5000, araPercent: 25, arbPercent: 15, tick: 10 },
      { min: 5000, max: Infinity, araPercent: 20, arbPercent: 15, tick: 25 },
    ],
    floor: 50,
  },
  acceleration: {
    rules: [{ min: 0, max: Infinity, araPercent: 10, arbPercent: 10, tick: 1 }],
    floor: 1,
  },
};

export function getARAPercentage(price: number, boardType: BoardType = "main") {
  const cfg = SETTINGS[boardType].rules.find((rule) => price >= rule.min && price < rule.max);
  return cfg ? cfg.araPercent : 0;
}

export function getARBPercentage(price: number, boardType: BoardType = "main") {
  const cfg = SETTINGS[boardType].rules.find((rule) => price >= rule.min && price < rule.max);
  return cfg ? cfg.arbPercent : 0;
}

export function getTick(price: number, boardType: BoardType = "main") {
  const cfg = SETTINGS[boardType].rules.find((rule) => price >= rule.min && price < rule.max);
  return cfg ? cfg.tick : 1;
}

export function getFloorPrice(boardType: BoardType = "main") {
  return SETTINGS[boardType].floor;
}

export function roundDownTick(price: number, boardType: BoardType = "main") {
  const tick = getTick(price, boardType);
  return Math.floor(price / tick) * tick;
}

export function roundUpTick(price: number, boardType: BoardType = "main") {
  const tick = getTick(price, boardType);
  return Math.ceil(price / tick) * tick;
}

export function applyPriceFraction(price: number, isARA = true, boardType: BoardType = "main") {
  return isARA ? roundDownTick(price, boardType) : roundUpTick(price, boardType);
}
