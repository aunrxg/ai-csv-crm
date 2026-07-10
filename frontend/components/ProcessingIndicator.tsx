"use client";

interface ProcessingIndicatorProps {
  totalRows: number;
  estimatedBatches: number;
}

export function ProcessingIndicator({ estimatedBatches, totalRows }: ProcessingIndicatorProps) {
  const slots = Array.from({ length: Math.min(estimatedBatches, 24) });

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-border bg-surface px-8 py-16">
      <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md">
        {slots.map((_, i) => (
          <div
            key={i}
            className="h-3 w-3 rounded-sm bg-signal-amber animate-pulse-slot"
            style={{ animationDelay: `${(i % 8) * 0.12}s` }}
          />
        ))}
      </div>
      <div className="text-center">
        <p className="text-base font-medium text-ink">
          Extracting {totalRows.toLocaleString()} rows into GrowEasy CRM format
        </p>
        <p className="mt-1.5 text-sm text-ink-dim">
          Running in {estimatedBatches} batch{estimatedBatches !== 1 ? "es" : ""} — mapping
          fields, validating statuses, consolidating notes
        </p>
      </div>
    </div>
  );
}
