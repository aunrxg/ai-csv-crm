import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { csvUpload } from "../middleware/upload.js";
import { CsvParseError, parseCsvBuffer } from "../utils/csvParser.js";
import { extractCrmRecords } from "../services/extraction.service.js";

export const importRouter = Router();

importRouter.post(
  "/preview",
  csvUpload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new CsvParseError(
          "No file was uploaded. Field name must be 'file'.",
        );
      }

      const rows = parseCsvBuffer(req.file.buffer);
      if (rows.length === 0) {
        throw new CsvParseError("CSV contains no rows.");
      }

      const headers = Object.keys(rows[0]!);

      res.json({
        success: true,
        headers,
        rows,
        totalRows: rows.length,
      });
    } catch (err) {
      next(err);
    }
  },
);

importRouter.post(
  "/confirm",
  csvUpload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new CsvParseError(
          "No file was uploaded. Field name must be 'file'.",
        );
      }

      const rows = parseCsvBuffer(req.file.buffer);
      const result = await extractCrmRecords(rows);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);
