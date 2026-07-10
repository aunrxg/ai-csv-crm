# GrowEasy AI CSV Importer

An AI-powered CSV importer that maps **any** CRM/lead-export layout — Facebook Lead Ads, Google Ads, real-estate CRMs, sales reports, or hand-built spreadsheets — into GrowEasy's canonical CRM format, without assuming fixed column names.

**Position applied for:** Software Developer Intern

---

## How it works

```
Upload CSV → Parse & Preview (no AI) → Confirm → AI Extraction (batched) → Imported / Skipped results
```

1. **Upload** — drag & drop or file picker, any valid CSV.
2. **Preview** — the file is parsed and shown in a table exactly as uploaded. No AI call happens at this stage.
3. **Confirm** — user explicitly triggers the AI extraction step.
4. **Result** — backend returns structured GrowEasy CRM records, plus any skipped rows with reasons, and summary stats.

## Tech stack

| Layer     | Choice                                                      |
| --------- | ------------------------------------------------------------ |
| Frontend  | Next.js 15 (App Router), TypeScript, Tailwind CSS            |
| Backend   | Node.js, Express, TypeScript                                 |
| AI        | Groq (`llama-3.3-70b-versatile`) via the Groq SDK             |
| Validation| Zod (env config + AI response schema validation/sanitization)|
| CSV       | `csv-parse` (backend), `papaparse` (available on frontend)   |
| Testing   | Vitest                                                        |

The app is intentionally **stateless** — nothing is persisted server-side. The confirm step re-sends the file so the backend never needs a database or session store.

---

## Project structure

```
groweasy-csv-importer/
├── backend/
│   ├── src/
│   │   ├── config/env.ts            # Zod-validated environment config
│   │   ├── middleware/               # multer upload config + centralized error handler
│   │   ├── routes/importRoutes.ts    # /api/import/preview and /api/import/confirm
│   │   ├── services/
│   │   │   ├── promptBuilder.ts      # System prompt encoding all extraction rules
│   │   │   ├── extractionSchema.ts   # Zod validation + enum sanitization of AI output
│   │   │   ├── groqClient.ts         # Groq API wrapper with retry/backoff
│   │   │   └── extractionService.ts  # Batching, bounded concurrency, orchestration
│   │   ├── types/crm.ts              # Canonical CRM types
│   │   └── utils/csvParser.ts        # BOM-safe, ragged-row-tolerant CSV parsing
│   └── Dockerfile
├── frontend/
│   ├── app/page.tsx                  # Main pipeline UI (upload/preview/processing/result)
│   ├── components/                   # UploadZone, DataTable, PipelineStepper, etc.
│   ├── lib/api.ts                    # Typed API client
│   ├── types/crm.ts                  # Mirrors backend contract
│   └── Dockerfile
└── docker-compose.yml
```

---

## Setup instructions

### Prerequisites
- Node.js 20+
- A free [Groq API key](https://console.groq.com/keys)

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env and paste your GROQ_API_KEY
npm install
npm run dev
```

Backend runs on `http://localhost:4000`. Health check: `GET /api/health`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL should point at your backend, defaults to http://localhost:4000
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

### 3. Run tests (backend)

```bash
cd backend
npm test
```

### 4. Docker (full stack)

```bash
# from the project root
export GROQ_API_KEY=your_key_here
docker compose up --build
```

Frontend → `http://localhost:3000`, backend → `http://localhost:4000`.

---

## API reference

### `POST /api/import/preview`
Multipart form, field name `file`. Parses the CSV and returns raw rows — **no AI call**.

```json
{ "success": true, "headers": ["Name", "Email"], "rows": [...], "totalRows": 42 }
```

### `POST /api/import/confirm`
Multipart form, field name `file`. Parses + runs AI extraction in batches, returns GrowEasy CRM records.

```json
{
  "success": true,
  "totalRows": 42,
  "totalImported": 39,
  "totalSkipped": 3,
  "records": [ /* CrmRecord[] */ ],
  "skipped": [ { "rowIndex": 4, "reason": "No email or mobile number present in row", "rawData": {...} } ],
  "processingTimeMs": 4210,
  "batchesProcessed": 3,
  "batchesFailed": 0
}
```

---

## Design decisions & engineering notes

- **Prompt engineering**: the system prompt (`services/promptBuilder.ts`) encodes every rule from the spec explicitly — allowed enum values, the multi-email/multi-phone consolidation rule, the date-format constraint (`new Date(created_at)` must parse), and the skip rule. Low temperature (0.1) is used since this is extraction, not creative generation.
- **Never trust the model blindly**: all AI output is re-validated against a Zod schema, and `crm_status`/`data_source` enum values are **sanitized server-side** — if the model hallucinates a value outside the allowed list, it's nulled out rather than passed through.
- **Batch resilience**: rows are processed in bounded-concurrency batches (default: batch size 15, concurrency 3). If a batch fails after retries, only *that batch's* rows are marked skipped with the failure reason — one bad batch never fails the whole import.
- **Retry with backoff**: the Groq client retries transient failures (rate limits, malformed JSON) with exponential backoff before giving up.
- **1:1 row coverage guarantee**: if the AI ever returns fewer results than rows sent, missing rows are backfilled as skipped rather than silently dropped — the total count always reconciles.
- **CSV robustness**: handles UTF-8 BOM (common from Excel), ragged/malformed rows, quoted fields with embedded commas, and fully blank rows.

## Bonus features implemented

- ✅ Drag & drop upload
- ✅ Retry mechanism for failed AI batches (exponential backoff)
- ✅ Unit tests (Vitest, backend)
- ✅ Docker setup (both services + compose)
- ✅ Dark mode (default theme; the design is dark-first by intent)
- ✅ Sticky headers + horizontal/vertical scroll in both preview and result tables
- ✅ Downloadable CRM-formatted CSV from the result screen

## Environment variables

**Backend** (`backend/.env`):
| Variable | Default | Description |
|---|---|---|
| `GROQ_API_KEY` | — | required, get one free at console.groq.com |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | model used for extraction |
| `BATCH_SIZE` | `15` | rows sent per AI call |
| `BATCH_CONCURRENCY` | `3` | parallel batches in flight |
| `MAX_FILE_SIZE_MB` | `10` | upload size limit |
| `CORS_ORIGIN` | `*` | comma-separated allowed origins |

**Frontend** (`frontend/.env.local`):
| Variable | Default |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` |

## Deployment

- **Backend** → Render.
- **Frontend** → Vercel .
