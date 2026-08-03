import type {
  MacroHistoryPayload,
  MacroIndicator,
  MacroKey,
} from "@/features/explore/types";

export async function fetchMacroApi(signal?: AbortSignal) {
  const res = await fetch("/api/macro", { signal, cache: "no-store" });

  if (!res.ok) {
    throw new Error("Gagal mengambil data makro.");
  }

  const data = (await res.json()) as MacroIndicator[];
  return data;
}

export async function fetchMacroHistoryApi(
  key: MacroKey,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({ history: key });
  const res = await fetch(`/api/macro?${params.toString()}`, {
    signal,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil histori data makro.");
  }

  const data = (await res.json()) as MacroHistoryPayload;
  return data;
}
