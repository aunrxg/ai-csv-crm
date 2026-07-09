import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("4000"),
  GROQ_API_KEY: z.string().min(1, "GROQ API KEY is required"),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
  NODE_ENV: z.enum(["dev", "prod", "test"]),
  CORS_ORIGIN: z.string().default("*"),
  MAX_FILE_SIZE_MB: z.string().default("10"),
  BATCH_SIZE: z.string().default("15"),
  BATCH_CONCURRENCY: z.string().default("3"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid env configs: ");
  console.error(parsed.error.issues);
  process.exit(1);
}

export const env = {
  PORT: Number(parsed.data.CORS_ORIGIN),
  GROQ_API_KEY: parsed.data.GROQ_API_KEY,
  GROQ_MODEL: parsed.data.GROQ_MODEL,
  NODE_ENV: parsed.data.NODE_ENV,
  CORS_ORIGIN: parsed.data.CORS_ORIGIN,
  MAX_FILE_SIZE_MB: Number(parsed.data.MAX_FILE_SIZE_MB),
  BATCH_SIZE: Number(parsed.data.BATCH_SIZE),
  BATCH_CONCURRENCY: Number(parsed.data.BATCH_CONCURRENCY),
};
