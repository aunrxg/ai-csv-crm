import { parse } from "csv-parse/sync";
import type { RawCsvRow } from "../types/index.js";

export class CsvParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CSVParseError";
  }
}

export function parseCsvBuffer(buffer: Buffer): RawCsvRow[] {
  let text = buffer.toString("utf-8");

  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  if (!text.trim()) {
    throw new CsvParseError("The uploaded file is empty");
  }

  let records: RawCsvRow[];
  try {
    records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      bom: true,
    });
  } catch (err) {
    throw new CsvParseError(`Failed to parse CSV: ${err instanceof Error ? err.message : "unkown error"}`);
  }

  if (records.length === 0) {
    throw new CsvParseError("No data rows found in the CSV");
  }

  const nonEmptyRows = records.filter((row) => 
    Object.values(row).some((val) => val && val.trim().length > 0)
  );

  if (nonEmptyRows.length === 0) throw new CsvParseError("All rows in the CSV are empty.");

  return nonEmptyRows;
}

export function chunkRows<T>(rows: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < rows.length; i+= batchSize) {
    batches.push(rows.slice(i, i+batchSize));
  }

  return batches;
}