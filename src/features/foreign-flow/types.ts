import type { NetForeignPayload } from "@/features/foreign-flow/services/net-foreign.service";

export type { NetForeignPayload };

export type DayOption = 7 | 14 | 30;
export type FlowMode = "Akumulasi" | "Distribusi";

export type AggregateRow = {
  stockCode: string;
  totalForeignNet: number;
};

export type StockHistoryPoint = {
  date: string;
  close: number;
  totalForeignNet: number;
};

export type DailyTopRank = {
  date: string;
  buyRankMap: Map<string, number>;
  sellRankMap: Map<string, number>;
};
