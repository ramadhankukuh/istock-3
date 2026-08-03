import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { DayOption, FlowMode } from "@/features/foreign-flow/types";

export default function Filters({
  selectedDays,
  setSelectedDays,
  flowMode,
  setFlowMode,
  onRefresh,
  loading,
}: {
  selectedDays: DayOption;
  setSelectedDays: (d: DayOption) => void;
  flowMode: FlowMode;
  setFlowMode: (m: FlowMode) => void;
  onRefresh: () => void;
  loading: boolean;
}) {
  const DAY_OPTIONS: DayOption[] = [7, 14, 30];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Kontrol tampilan</h3>
          <p className="text-sm text-muted">Pilih periode dan mode analisis.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => onRefresh()}
          disabled={loading}
        >
          Refresh data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="block text-sm font-semibold text-foreground">
            Pilih periode
          </p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {DAY_OPTIONS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDays(day)}
                className={cn(
                  "focus-ring rounded-xl px-4 py-2 text-sm font-semibold transition",
                  selectedDays === day
                    ? "bg-foreground text-background"
                    : "bg-(--surface-strong) text-foreground hover:bg-(--surface)",
                )}
              >
                {day} Hari
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="block text-sm font-semibold text-foreground">Mode</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {(["Akumulasi", "Distribusi"] as FlowMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFlowMode(mode)}
                className={cn(
                  "focus-ring rounded-xl px-4 py-2 text-sm font-semibold transition",
                  flowMode === mode
                    ? "bg-(--accent) text-white"
                    : "bg-(--surface-strong) text-foreground hover:bg-(--surface)",
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
