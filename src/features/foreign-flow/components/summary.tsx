import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCompactRupiah } from "@/lib/utils/format";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { NetForeignPayload } from "@/features/foreign-flow/types";
import type { FlowMode } from "@/features/foreign-flow/types";

export default function Summary({
  topStock,
  payload,
  dateRange,
  loading,
  flowMode,
}: {
  topStock: { stockCode: string; totalForeignNet: number } | null;
  payload?: NetForeignPayload | null;
  dateRange: string;
  loading: boolean;
  flowMode: FlowMode;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="border-(--border) bg-(--surface)">
        <CardHeader className="pb-3">
          <p className="text-sm">Top stock</p>
          <h3
            className={`text-2xl ${topStock && topStock.totalForeignNet >= 0 ? "text-emerald-500" : "text-red-500"}`}
          >
            {topStock ? formatCompactRupiah(topStock.totalForeignNet) : "-"}
          </h3>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted">
          <p>
            {topStock ? (
              <>
                Saham terbesar:{" "}
                <span className="font-semibold text-foreground">
                  {topStock.stockCode}
                </span>
              </>
            ) : (
              "Data net foreign belum tersedia untuk periode ini."
            )}
          </p>
          <div className="flex items-center gap-2 text-xs">
            {flowMode === "Akumulasi" ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span>{flowMode}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-(--border) bg-(--surface)">
        <CardHeader className="pb-3">
          <p className="text-sm">Total data hari</p>
          <h3 className="text-2xl">{payload?.totalDays ?? 0}</h3>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted">
          <p>Rentang yang aktif: {dateRange}</p>
          <p>Request awal: {payload?.requestedDays ?? "-"} hari</p>
        </CardContent>
      </Card>

      <Card className="border-(--border) bg-(--surface)">
        <CardHeader className="pb-3">
          <p className="text-sm">Status refresh</p>
          <h3 className="text-2xl">{loading ? "Memuat" : "Siap"}</h3>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted">
          <p>{payload?.lastUpdateFormatted ?? "-"}</p>
          <p>Update terakhir: {payload?.lastUpdateFormatted ?? "-"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
