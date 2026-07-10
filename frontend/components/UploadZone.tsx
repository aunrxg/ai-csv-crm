"use client";

import clsx from "clsx";
import { FileWarning, UploadCloud } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export function UploadZone({ onFileSelected, isLoading, error }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
        return;
      }

      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      validateAndSelect(e.dataTransfer.files?.[0]);
    }, 
    [validateAndSelect]
  );

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={clsx(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-all",
          isDragging
            ? "border-signal-amber bg-signal-amber/5 scale-[1.01]"
            : "border-border bg-surface hover:border-ink-dim",
          isLoading && "pointer-events-none opacity-60"
        )}
      >
        <div
          className={clsx(
            "mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-colors",
            isDragging ? "bg-signal-amber/20" : "bg-canvas"
          )}
        >
          <UploadCloud
            className={clsx("h-6 w-6", isDragging ? "text-signal-amber" : "text-ink-muted")}
            strokeWidth={1.5}
          />
        </div>
        <p className="text-base font-medium text-ink">
          {isLoading ? "Reading file…" : "Drop your CSV here, or click to browse"}
        </p>
        <p className="mt-1.5 text-sm text-ink-dim">
          Facebook exports, Google Ads, real-estate CRMs, sales sheets — any layout works
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => validateAndSelect(e.target.files?.[0])}
        />
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-signal-red/30 bg-signal-red/10 px-4 py-3">
          <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-signal-red" />
          <p className="text-sm text-signal-red">{error}</p>
        </div>
      )}
    </div>
  );
}