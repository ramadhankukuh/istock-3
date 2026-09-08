import {
  getMacroHistory,
  getMacroIndicators,
} from "@/features/explore/services/macro.service";
import { getLatestInflationData } from "@/features/explore/services/inflation.service";
import type { MacroKey } from "@/features/explore/types";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { redis } from "@/lib/redis/redis";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const raw = url.searchParams.get("rawInflation");
    const historyKey = url.searchParams.get("history");

    const { ok, retryAfter } = await rateLimit(request, {
      limit: 60,
      windowSec: 60,
      prefix: "rl:macro",
    });
    if (!ok) {
      return rateLimitedResponse(retryAfter);
    }

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

      const cacheKey = `macroHistory:${historyKey}`;
      const cachedHistory = await redis.get(cacheKey);
      if (cachedHistory) {
        return Response.json(cachedHistory);
      }

      const history = await getMacroHistory(historyKey as MacroKey);
      await redis.set(cacheKey, history, { exSeconds: 900 });
      return Response.json(history);
    }

    if (raw === "1" || raw === "true") {
      const cachedInflation = await redis.get("macroInflation");
      if (cachedInflation) {
        return Response.json(cachedInflation);
      }

      const inflation = await getLatestInflationData();
      await redis.set("macroInflation", inflation, { exSeconds: 900 });
      return Response.json(inflation);
    }

    const cachedMacro = await redis.get("macroIndicators");
    if (cachedMacro) {
      return Response.json(cachedMacro);
    }

    const macro = await getMacroIndicators();
    await redis.set("macroIndicators", macro, { exSeconds: 900 });
    return Response.json(macro);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch macro data" },
      { status: 500 },
    );
  }
}
