import { env } from "../config/env.js";
import {
  aiResponseSchema,
  sanitizeEnumFields,
} from "../types/extractionSchema.js";
import type { CrmRecord, ExtractionResult, ImportResponse, RawCsvRow } from "../types/index.js";
import { chunkRows } from "../utils/csvParser.js";
import { callGroqExtraction, GroqExtractionError } from "./groq.service.js";
import { buildBatchUserMessage, buildSystemPrompt } from "./promptBuilder.js";

const SYSTEM_PROMPT = buildSystemPrompt();

function stripJsonFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

async function processBatch(
  rows: RawCsvRow[],
  startIndex: number,
): Promise<{ results: ExtractionResult[]; failed: boolean }> {
  const userMessage = buildBatchUserMessage(rows, startIndex);

  try {
    const raw = await callGroqExtraction(SYSTEM_PROMPT, userMessage);
    const cleaned = stripJsonFences(raw);

    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(cleaned);
    } catch {
      throw new GroqExtractionError("AI Response was not JSON.");
    }

    const validation = aiResponseSchema.safeParse(parsedJson);

    if (!validation.success) {
      throw new GroqExtractionError(
        `AI Response did not match the expected schema: ${validation.error.message}`,
      );
    }

    const results: ExtractionResult[] = validation.data.results.map((r) => {
      if (r.status === "skipped" || !r.record) {
        return {
          status: "skipped" as const,
          reason: r.reason ?? "AI marked this row as skipped without a reason.",
          sourceRowIndex: r.sourceRowIndex,
        };
      }

      // Enforce: must have email OR mobile even if AI said "success"
      const hasEmail = !!r.record.email?.trim();
      const hasMobile = !!r.record.mobile_without_cc?.trim();
      if (!hasEmail && !hasMobile) {
        return {
          status: "skipped" as const,
          reason: "No email or mobile number present after extraction.",
          sourceRowIndex: r.sourceRowIndex,
        };
      }

      const sanitized = sanitizeEnumFields(r.record);
      return {
        status: "success",
        record: sanitized as CrmRecord,
        sourceRowIndex: r.sourceRowIndex,
      };
    });

    const returnedIndices = new Set(results.map((r) => r.sourceRowIndex));
    for (let i = 0; i < rows.length; i++) {
      const idx = startIndex + i;
      if (!returnedIndices.has(idx)) {
        results.push({
          status: "skipped",
          reason: "AI did not returned a result for this row",
          sourceRowIndex: idx,
        });
      }
    }

    return { results, failed: false };
  } catch (err) {
    const reason =
      err instanceof Error
        ? `Batch processing failed: ${err.message}`
        : "Batch processing failed";
    return {
      failed: true,
      results: rows.map((_, i) => ({
        status: "skipped",
        reason,
        sourceRowIndex: startIndex + i,
      })),
    };
  }
}

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const currentIndex = nextIndex++;
      if (currentIndex >= tasks.length) break;
      const task = tasks[currentIndex]!;
      results[currentIndex] = await task();
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}


export async function extractCrmRecords(rows: RawCsvRow[]): Promise<ImportResponse> { 
  const startTime = Date.now();
  const batches = chunkRows(rows, env.BATCH_SIZE);

  const tasks = batches.map((batch, batchIdx) => {
    const startIndex = batchIdx * env.BATCH_SIZE;

    return () => processBatch(batch, startIndex);
  });

  const batchResults = await runWithConcurrency(tasks, env.BATCH_CONCURRENCY);

  const allResults: ExtractionResult[] = batchResults.flatMap((b) => b.results);
  const batchesFailed = batchResults.filter((b) => b.failed).length;

  allResults.sort((a, b) => a.sourceRowIndex - b.sourceRowIndex);

  const records: CrmRecord[] = [];
  const skipped: ImportResponse["skipped"] = [];

  for(const result of allResults) {
    if (result.status === "success" && result.record) {
      records.push(result.record);
    } else {
      skipped.push({
        rowIndex: result.sourceRowIndex,
        reason: result.reason ?? "Unkown error",
        rawData: rows[result.sourceRowIndex] ?? {},
      });
    }
  }

  return {
    success: true,
    totalRow: rows.length,
    totalImported: records.length,
    totalSkipped: skipped.length,
    records,
    skipped,
    processingTimeMs: Date.now() - startTime,
    batchesProcessed: batches.length,
    batchesFailed,
  };
}
