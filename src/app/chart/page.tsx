import { Suspense } from "react";
import ChartPage from "@/features/chart/components/chart-page";
import { ChartPageSkeleton } from "@/features/chart/components/chart-page-skeleton";

type ChartRouteProps = {
  searchParams: Promise<{ symbol?: string; tab?: string }>;
};

export default async function ChartRoute({ searchParams }: ChartRouteProps) {
  const params = await searchParams;
  const symbol = (params.symbol ?? "BBRI").toUpperCase();
  const tab = params.tab ?? "keystats";

  return (
    <Suspense fallback={<ChartPageSkeleton />}>
      <ChartPage initialSymbol={symbol} initialTab={tab} />
    </Suspense>
  );
}
