export const CRM_STATUS_VALUES = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
];

export type CrmStatus = (typeof CRM_STATUS_VALUES)[number];

export const DATA_SOURCE_VALUES = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
];

export type DataSource = (typeof DATA_SOURCE_VALUES)[number];

// almost every field is optional, unreliable data

export interface CrmRecord {
  created_at: string | null;
  name: string | null;
  email: string | null;
  country_code: string | null;
  mobile_without_cc: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lead_owner: string | null;
  crm_status: CrmStatus | null;
  crm_note: string | null;
  data_source: DataSource | null;
  possession_time: string | null;
  description: string | null;
}

export const CRM_FIELD_ORDER: (keyof CrmRecord)[] = [
  "created_at",
  "name",
  "email",
  "country_code",
  "mobile_without_cc",
  "company",
  "city",
  "state",
  "country",
  "lead_owner",
  "crm_status",
  "crm_note",
  "data_source",
  "possession_time",
  "description",
];

export type RawCsvRow = Record<string, string>;

export interface ExtractionResult {
  status: "success" | "skipped";
  record?: CrmRecord;
  reason?: string;
  sourceRowIndex: number;
}

export interface ImportResponse {
  success: boolean;
  totalRow: number;
  totalImported: number;
  totalSkipped: number;
  records: CrmRecord[];
  skipped: { rowIndex: number; reason: string; rawData: RawCsvRow }[];
  processingTimeMs: number;
  batchesProcessed: number;
  batchesFailed: number;
}
