import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("4000"),
  GROQ_API_KEY: z.string().min(1, "GROQ API KEY is required"),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
  NODE_ENV: z.enum(["dev", "prod", "test"]),
  CORS_ORIGIN: z.string().default("*"),
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
};
