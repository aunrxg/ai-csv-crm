export const CRM_STATUS_VALUES = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
] as const;

export type CrmStatus = (typeof CRM_STATUS_VALUES)[number];

export const DATA_SOURCE_VALUES = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
] as const;

export type DataSource = (typeof DATA_SOURCE_VALUES)[number];

export interface CrmRecord {
  created_at: string | null;
  name: string | null;
  email: string | null;
  country_code: string | null;
  mobile_without_country_code: string | null;
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
  "mobile_without_country_code",
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

export interface PreviewResponse {
  success: boolean;
  headers: string[];
  rows: RawCsvRow[];
  totalRows: number;
}

export interface SkippedRecord {
  rowIndex: number;
  reason: string;
  rawData: RawCsvRow;
}

export interface ImportResponse {
  success: boolean;
  totalRows: number;
  totalImported: number;
  totalSkipped: number;
  records: CrmRecord[];
  skipped: SkippedRecord[];
  processingTimeMs: number;
  batchesProcessed: number;
  batchesFailed: number;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
}

export type AppStep = "upload" | "preview" | "processing" | "result";
