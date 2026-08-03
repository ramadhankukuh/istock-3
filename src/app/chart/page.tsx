import { Suspense } from "react";
import ChartPage from "@/features/chart/components/chart-page";

type ChartRouteProps = {
  searchParams: Promise<{ symbol?: string; tab?: string }>;
};

export default async function ChartRoute({ searchParams }: ChartRouteProps) {
  const params = await searchParams;
  const symbol = (params.symbol ?? "BBRI").toUpperCase();
  const tab = params.tab ?? "keystats";

  return (
    <Suspense
      fallback={<p className="py-8 text-center text-sm text-muted">Memuat…</p>}
    >
      <ChartPage initialSymbol={symbol} initialTab={tab} />
    </Suspense>
  );
}
