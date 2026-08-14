import {
  getMacroHistory,
  getMacroIndicators,
} from "@/features/macro-indicators/services/macro.service";
import { getLatestInflationData } from "@/features/macro-indicators/services/inflation.service";
import type { MacroKey } from "@/features/macro-indicators/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const raw = url.searchParams.get("rawInflation");
    const historyKey = url.searchParams.get("history");

    if (historyKey) {
      if (
        historyKey !== "bi-rate" &&
        historyKey !== "gdp" &&
        historyKey !== "inflation" &&
        historyKey !== "tpt" &&
        historyKey !== "debt-to-pdp"
      ) {
        return Response.json(
          { error: "Invalid macro history key" },
          { status: 400 },
        );
      }

      const history = await getMacroHistory(historyKey as MacroKey);
      return Response.json(history);
    }

    if (raw === "1" || raw === "true") {
      const inflation = await getLatestInflationData();
      return Response.json(inflation);
    }

    const macro = await getMacroIndicators();
    return Response.json(macro);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch macro data" },
      { status: 500 },
    );
  }
}
