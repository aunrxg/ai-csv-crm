import { AppStep } from "@/types";
import clsx from "clsx";

const STEPS: { key: AppStep; label: string; hint: string; }[] = [
  { key: "upload", label: "Upload", hint: "Drop a CSV, any layout" },
  { key: "preview", label: "Preview", hint: "Raw rows, No AI" },
  { key: "processing", label: "Extract", hint: "AI maps field to CRM" },
  { key: "result", label: "Result", hint: "Imported + Skipped" },
];

export function PipelineStepper({ currentStep }: { currentStep: AppStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <nav aria-label="Import pipeline progress" className="w-full">
      <ol className="flex items-stretch gap-0">
        {STEPS.map((step, i) => {
          const isActive = i === currentIndex;
          const isDone = i < currentIndex;
          return (
            <li key={step.key} className="flex flex-1 items-center">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={clsx(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-medium transition-colors",
                    isDone && "bg-signal-green/20 text-signal-green ring-1 ring-signal-green/40",
                    isActive && "bg-signal-amber/20 text-signal-amber ring-1 ring-signal-amber/50",
                    !isDone && !isActive && "bg-surface text-ink-dim ring-1 ring-border"
                  )}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p
                    className={clsx(
                      "truncate text-sm font-medium",
                      isActive ? "text-ink" : isDone ? "text-ink-muted" : "text-ink-dim"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="truncate text-xs text-ink-dim">{step.hint}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={clsx(
                    "mx-3 h-px flex-1 transition-colors",
                    isDone ? "bg-signal-green/40" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
