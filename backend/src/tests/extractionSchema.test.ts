import { describe, it, expect } from "vitest";
import { crmRecordSchema, sanitizeEnumFields } from "../types/extractionSchema.js";

describe("sanitizeEnumFields", () => {
  const baseRecord = crmRecordSchema.parse({});

  it("keeps a valid crm_status value", () => {
    const result = sanitizeEnumFields({ ...baseRecord, crm_status: "SALE_DONE" });
    expect(result.crm_status).toBe("SALE_DONE");
  });

  it("nullifies an invalid/hallucinated crm_status value", () => {
    const result = sanitizeEnumFields({ ...baseRecord, crm_status: "SUPER_HOT_LEAD" });
    expect(result.crm_status).toBeNull();
  });

  it("keeps a valid data_source value", () => {
    const result = sanitizeEnumFields({ ...baseRecord, data_source: "eden_park" });
    expect(result.data_source).toBe("eden_park");
  });

  it("nullifies an invalid data_source value", () => {
    const result = sanitizeEnumFields({ ...baseRecord, data_source: "some_random_project" });
    expect(result.data_source).toBeNull();
  });

  it("nullifies a null crm_status without throwing", () => {
    const result = sanitizeEnumFields({ ...baseRecord, crm_status: null });
    expect(result.crm_status).toBeNull();
  });
});
