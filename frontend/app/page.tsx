"use client";

import { DataTable } from "@/components/DataTable";
import { PipelineStepper } from "@/components/PipelineStepper";
import { ProcessingIndicator } from "@/components/ProcessingIndicator";
import { ResultSummary } from "@/components/ResultSummary";
import { UploadZone } from "@/components/UploadZone";
import { ApiError, confirmImport, previesCsv } from "@/lib/api";
import { AppStep, CRM_FIELD_ORDER, ImportResponse, PreviewResponse } from "@/types";
import { ArrowRight, Download, RotateCcw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const ESTIMATED_BATCH_SIZE = 15;

export default function Home() {
  const [step, setStep] = useState<AppStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const handleFileSelected = useCallback(async (selectedFile: File) => {
    setError(null);
    setIsUploading(true);
    setFile(selectedFile);

    try {
      const previewData = await previesCsv(selectedFile);
      setPreview(previewData);
      setStep("preview");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to read this csv. Please check the file and try again"
      );

      setFile(null);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!file) return;

    setError(null);
    setIsConfirming(true);
    setStep("processing");

    try {
      const importResult = await confirmImport(file);
      setResult(importResult);
      setStep("result");
    } catch (err) {
      setError(
        err instanceof ApiError 
          ? err.message
          : "AI extraction failed. Please try again, or try a smaller file."
      );
      setStep("preview");
    } finally {
      setIsConfirming(false);
    }
  }, [file]);

  const handleReset = useCallback(() => {
    setStep("upload");
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  }, []);

  const handleDownloadCsv = useCallback(() => {
    if (!result) return;
    const header = CRM_FIELD_ORDER.join(",");
    const rows = result.records.map((record) => 
      CRM_FIELD_ORDER.map((field) => {
        const value = record[field] ?? "";
        const escaped = String(value).replace(/"/g, '""');
        return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
      }).join(",")
    );

    const csvContent = [header, ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "groweasy_crm_import.csv";
    link.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const estimatedBatches = useMemo(() => {
    if (!preview) return 1;
    return Math.ceil(preview.totalRows / ESTIMATED_BATCH_SIZE);
  }, [preview]);

  const crmTableRows = useMemo(() => {
    if (!result) return [];
    return result.records.map((record) => {
      const row: Record<string, string> = {};
      for(const field of CRM_FIELD_ORDER) {
        row[field] = record[field] ?? "";
      }
      return row;
    });
  }, [result]);

  const skippedTableRows = useMemo(() => {
    if (!result) return [];
    return result.skipped.map((s) => ({
      row: String(s.rowIndex + 1),
      reason: s.reason,
    }));
  }, [result]);

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-signal-amber">
            GrowEasy CRM
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            AI CSV Importer
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            Upload any lead export — Facebook, Google Ads, a real-estate CRM, or a hand-built
            spreadsheet — and the AI maps it into GrowEasy&apos;s CRM format automatically.
          </p>
        </header>

        <div className="mb-10 rounded-2xl border border-border bg-surface px-5 py-5 sm:px-8">
          <PipelineStepper currentStep={step} />
        </div>

        <div className="animate-fade-up">
          {step === "upload" && (
            <UploadZone onFileSelected={handleFileSelected} isLoading={isUploading} error={error} />
          )}

          {step === "preview" && preview && (
            <div className="space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-medium text-ink">
                    Preview — {preview.totalRows.toLocaleString()} rows detected
                  </h2>
                  <p className="text-sm text-ink-dim">
                    Raw data as uploaded. Nothing has been sent to the AI yet.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm text-ink-muted transition-colors hover:bg-canvas"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Start over
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-signal-amber px-4 py-2 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    Confirm import
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-signal-red/30 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">
                  {error}
                </div>
              )}

              <DataTable columns={preview.headers} rows={preview.rows} />
            </div>
          )}

          {step === "processing" && (
            <ProcessingIndicator totalRows={preview?.totalRows ?? 0} estimatedBatches={estimatedBatches} />
          )}

          {step === "result" && result && (
            <div className="space-y-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-medium text-ink">Import complete</h2>
                  <p className="text-sm text-ink-dim">
                    Mapped into GrowEasy CRM format across {result.batchesProcessed} batch
                    {result.batchesProcessed !== 1 ? "es" : ""}
                    {result.batchesFailed > 0 &&
                      ` (${result.batchesFailed} batch${result.batchesFailed !== 1 ? "es" : ""} failed and were skipped)`}
                    .
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm text-ink-muted transition-colors hover:bg-canvas"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    New import
                  </button>
                  <button
                    onClick={handleDownloadCsv}
                    disabled={result.records.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-signal-green px-4 py-2 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download CRM CSV
                  </button>
                </div>
              </div>

              <ResultSummary result={result} />

              <div>
                <h3 className="mb-3 text-sm font-medium text-ink-muted">
                  Imported records ({result.records.length})
                </h3>
                <DataTable
                  columns={CRM_FIELD_ORDER}
                  rows={crmTableRows}
                  emptyMessage="No records were successfully imported."
                />
              </div>

              {result.skipped.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-medium text-ink-muted">
                    Skipped records ({result.skipped.length})
                  </h3>
                  <DataTable columns={["row", "reason"]} rows={skippedTableRows} maxHeight="16rem" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}