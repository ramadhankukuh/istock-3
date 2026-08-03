"use client";

import dynamic from "next/dynamic";

export { MiniSparklineBase as MiniSparklineChart } from "./mini-sparkline-base";

const MiniSparklineChartClient = dynamic(
  () =>
    import("./mini-sparkline-base").then((module) => module.MiniSparklineBase),
  {
    ssr: false,
  },
);

export default MiniSparklineChartClient;
