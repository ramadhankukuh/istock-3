"use client";

import dynamic from "next/dynamic";

export { PriceChartBase as PriceChart } from "./price-chart-base";

const PriceChartClient = dynamic(
  () => import("./price-chart-base").then((module) => module.PriceChartBase),
  {
    ssr: false,
  },
);

export default PriceChartClient;
