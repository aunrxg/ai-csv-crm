import Groq from "groq-sdk";
import { env } from "../config/env.js";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export class GroqExtractionError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "GroqExtractionError";
  }
}

export async function callGroqExtraction(
  systemPrompt: string,
  userMessage: string,
  { maxRetries = 3 }: { maxRetries?: number } = {}
): Promise<string> {
  let lastError: unknown;

  for(let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: env.GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.1, // extraction is not creative
        response_format: { type: "json_object" }, // force json object response
        max_completion_tokens: 8000, // cap on token usage
      });

      const content = completion.choices[0]?.message.content;
      if (!content) {
        throw new GroqExtractionError("Groq returned an empty completion.");
      }
      return content;
    } catch (err) {
      lastError = err;
      const isLastAttempt = attempt === maxRetries;
      if (isLastAttempt) break;

      // exponential backoffs -> 500, 1000, 2000...
      const delayMs = 500 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new GroqExtractionError(
    `Groq extraction failed after ${maxRetries + 1} attempts: ${lastError instanceof Error ? lastError.message : "unkonwn error"}`,
    lastError
  );
}
