import { describe, it, expect } from "vitest";
import { chunkRows, CsvParseError, parseCsvBuffer } from "../utils/csvParser.js";

describe("parseCsvBuffer", () => {
  it("parses a simple CSV with headers", () => {
    const csv = "name,email\nJohn,john@example.com\nJane,jane@example.com";
    const rows = parseCsvBuffer(Buffer.from(csv));
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: "John", email: "john@example.com" });
  });

  it("strips UTF-8 BOM", () => {
    const bom = Buffer.from([0xef, 0xbb, 0xbf]);
    const csv = Buffer.concat([bom, Buffer.from("name,email\nJohn,john@example.com")]);
    const rows = parseCsvBuffer(csv);
    expect(rows[0]!.name).toBe("John");
  });

  it("handles quoted fields with embedded commas", () => {
    const csv = 'name,note\nJohn,"Busy, call later"';
    const rows = parseCsvBuffer(Buffer.from(csv));
    expect(rows[0]!.note).toBe("Busy, call later");
  });

  it("throws CsvParseError on empty file", () => {
    expect(() => parseCsvBuffer(Buffer.from(""))).toThrow(CsvParseError);
  });

  it("drops fully empty rows", () => {
    const csv = "name,email\nJohn,john@example.com\n,\n";
    const rows = parseCsvBuffer(Buffer.from(csv));
    expect(rows).toHaveLength(1);
  });

  it("tolerates ragged rows with relax_column_count", () => {
    const csv = "a,b,c\n1,2,3\n1,2";
    expect(() => parseCsvBuffer(Buffer.from(csv))).not.toThrow();
  });
});

describe("chunkRows", () => {
  it("splits rows into batches of the given size", () => {
    const rows = Array.from({ length: 10 }, (_, i) => i);
    const batches = chunkRows(rows, 3);
    expect(batches).toHaveLength(4);
    expect(batches[0]).toEqual([0, 1, 2]);
    expect(batches[3]).toEqual([9]);
  });

  it("returns a single batch if batchSize >= rows.length", () => {
    const rows = [1, 2, 3];
    const batches = chunkRows(rows, 10);
    expect(batches).toHaveLength(1);
  });
});
