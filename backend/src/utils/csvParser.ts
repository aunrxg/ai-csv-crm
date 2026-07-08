
export class CsvParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CSVParseError";
  }
}