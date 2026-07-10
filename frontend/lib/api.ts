import { ApiErrorResponse, ImportResponse, PreviewResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:4000";

export class ApiError extends Error {
  constructor(message: string, public readonly code: string) {
      super(message);
      this.name = "ApiError";
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok || body.success === false) {
    const err = body as ApiErrorResponse;
    throw new ApiError(err.error ?? "Request failed", err.code ?? "UNKOWN_ERROR");
  }
  return body as T;
}

export async function previesCsv(file: File): Promise<PreviewResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/import/preview`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<PreviewResponse>(res);
}

export async function confirmImport(file: File): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/import/confirm`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<ImportResponse>(res);
}