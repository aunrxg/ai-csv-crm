import { z } from "zod";
import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from "./index.js";

export const crmRecordSchema = z.object({
  created_at: z.string().nullable().optional().default(null),
  name: z.string().nullable().optional().default(null),
  email: z.string().nullable().optional().default(null),
  country_code: z.string().nullable().optional().default(null),
  mobile_without_cc: z.string().nullable().optional().default(null),
  company: z.string().nullable().optional().default(null),
  city: z.string().nullable().optional().default(null),
  state: z.string().nullable().optional().default(null),
  country: z.string().nullable().optional().default(null),
  lead_owner: z.string().nullable().optional().default(null),
  crm_status: z.string().nullable().optional().default(null),
  crm_note: z.string().nullable().optional().default(null),
  data_source: z.string().nullable().optional().default(null),
  possession_time: z.string().nullable().optional().default(null),
  description: z.string().nullable().optional().default(null),
});

export const extractionSchema = z.object({
  sourceRowIndex: z.number(),
  status: z.enum(["success", "skipped"]),
  reason: z.string().optional(),
  record: crmRecordSchema.optional(),
});

export const aiResponseSchema = z.object({
  results: z.array(extractionSchema),
});

export type RowExtractionResult = z.infer<typeof extractionSchema>;

export function sanitizeEnumFields(record: z.infer<typeof crmRecordSchema>) {
  const status = record.crm_status;
  const source = record.data_source;

  return {
    ...record,
    crm_status: CRM_STATUS_VALUES.includes(status as (typeof CRM_STATUS_VALUES)[number])
      ? (status as (typeof CRM_STATUS_VALUES)[number])
      : null,
    data_source: DATA_SOURCE_VALUES.includes(source as (typeof DATA_SOURCE_VALUES)[number])
      ? (source as (typeof DATA_SOURCE_VALUES)[number])
      : null,
  };
}
