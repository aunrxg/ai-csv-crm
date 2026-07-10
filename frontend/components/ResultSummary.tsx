import { ImportResponse } from "@/types";
import { CheckCircle2, Clock, Layers, XCircle } from "lucide-react";

function StatCard({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warn";
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5">
      <div
        className={
          tone === "success"
            ? "text-signal-green"
            : tone === "warn"
              ? "text-signal-amber"
              : "text-ink-muted"
        }
      >
        {icon}
      </div>
      <div>
        <p className="font-mono text-lg font-semibold leading-none text-ink">{value}</p>
        <p className="mt-1 text-xs text-ink-dim">{label}</p>
      </div>
    </div>
  );
}

export function ResultSummary({ result }: { result: ImportResponse }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        icon={<CheckCircle2 className="h-5 w-5" />}
        label="Imported"
        value={result.totalImported}
        tone="success"
      />
      <StatCard
        icon={<XCircle className="h-5 w-5" />}
        label="Skipped"
        value={result.totalSkipped}
        tone={result.totalSkipped > 0 ? "warn" : "default"}
      />
      <StatCard
        icon={<Layers className="h-5 w-5" />}
        label="Batches processed"
        value={result.batchesProcessed}
      />
      <StatCard
        icon={<Clock className="h-5 w-5" />}
        label="Processing time"
        value={`${(result.processingTimeMs / 1000).toFixed(1)}s`}
      />
    </div>
  );
}
