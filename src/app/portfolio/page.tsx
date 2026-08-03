import { Briefcase } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DummyAsset =
  | { type: "Saham ID"; ticker: string; name: string; lots: number; avgPrice: number; currentPrice: number }
  | { type: "Saham US"; ticker: string; name: string; shares: number; avgPrice: number; currentPrice: number }
  | { type: "Kripto"; ticker: string; name: string; units: number; avgPrice: number; currentPrice: number };

const dummyAssets: DummyAsset[] = [
  { type: "Saham ID", ticker: "BBCA", name: "Bank Central Asia", lots: 5, avgPrice: 10250, currentPrice: 10400 },
  { type: "Saham ID", ticker: "BBRI", name: "Bank Rakyat Indonesia", lots: 10, avgPrice: 4850, currentPrice: 4920 },
  { type: "Saham US", ticker: "AAPL", name: "Apple Inc.", shares: 20, avgPrice: 178, currentPrice: 185 },
  { type: "Saham US", ticker: "NVDA", name: "NVIDIA Corporation", shares: 10, avgPrice: 820, currentPrice: 795 },
  { type: "Kripto", ticker: "BTC", name: "Bitcoin", units: 0.5, avgPrice: 62000, currentPrice: 64500 },
  { type: "Kripto", ticker: "ETH", name: "Ethereum", units: 5, avgPrice: 3200, currentPrice: 3450 },
];

function getQty(asset: DummyAsset): number {
  if (asset.type === "Saham ID") return asset.lots * 100;
  if (asset.type === "Saham US") return asset.shares;
  return asset.units;
}

export default function PortfolioPage() {
  const totalValue = dummyAssets.reduce((sum, a) => sum + getQty(a) * a.currentPrice, 0);
  const totalCost = dummyAssets.reduce((sum, a) => sum + getQty(a) * a.avgPrice, 0);

  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-4xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow) sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-(--surface-strong)">
            <Briefcase className="h-5 w-5 text-(--accent)" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Portfolio
            </h1>
            <p className="text-sm text-muted">
              Pantau aset saham ID, saham US, dan kripto dalam satu tempat.
            </p>
          </div>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-(--border) bg-(--surface)">
          <CardHeader className="pb-2">
            <CardDescription>Total Nilai</CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl">
              Rp {totalValue.toLocaleString("id-ID")}
            </CardTitle>
          </CardContent>
        </Card>
        <Card className="border-(--border) bg-(--surface)">
          <CardHeader className="pb-2">
            <CardDescription>Total Biaya</CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl">
              Rp {totalCost.toLocaleString("id-ID")}
            </CardTitle>
          </CardContent>
        </Card>
        <Card className="border-(--border) bg-(--surface)">
          <CardHeader className="pb-2">
            <CardDescription>Total P&L</CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle
              className={`text-2xl ${totalPnl >= 0 ? "text-emerald-500" : "text-red-500"}`}
            >
              {totalPnl >= 0 ? "+" : ""}
              Rp {totalPnl.toLocaleString("id-ID")}{" "}
              <span className="text-base">
                ({totalPnlPercent >= 0 ? "+" : ""}
                {totalPnlPercent.toFixed(2)}%)
              </span>
            </CardTitle>
          </CardContent>
        </Card>
      </div>

      {/* Daftar aset */}
      <Card className="border-(--border) bg-(--surface)">
        <CardHeader>
          <CardTitle>Daftar Aset</CardTitle>
          <CardDescription>
            Data dummy — tampilan awal untuk monitoring portofolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-(--border)">
            {dummyAssets.map((asset) => {
              const qty = getQty(asset);
              const cost = qty * asset.avgPrice;
              const value = qty * asset.currentPrice;
              const pnl = value - cost;
              const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

              const qtyLabel =
                asset.type === "Saham ID"
                  ? `${asset.lots} lot`
                  : asset.type === "Saham US"
                    ? `${asset.shares} share`
                    : `${asset.units} unit`;

              return (
                <div
                  key={`${asset.type}-${asset.ticker}`}
                  className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                          asset.type === "Saham ID"
                            ? "bg-blue-500"
                            : asset.type === "Saham US"
                              ? "bg-purple-500"
                              : "bg-orange-500"
                        }`}
                      />
                      <p className="truncate text-sm font-semibold">
                        {asset.ticker}
                      </p>
                      <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted">
                        {asset.type}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted">{asset.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {qtyLabel} @ {asset.avgPrice.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      Rp {value.toLocaleString("id-ID")}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        pnl >= 0 ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {pnl >= 0 ? "+" : ""}
                      Rp {pnl.toLocaleString("id-ID")} (
                      {pnlPercent >= 0 ? "+" : ""}
                      {pnlPercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted">
        Data bersifat dummy — integrasi dengan portofolio riil menyusul.
      </p>
    </section>
  );
}
