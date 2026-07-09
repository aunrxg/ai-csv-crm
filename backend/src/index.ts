import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import rateLimit from "express-rate-limit";
import { importRouter } from "./routes/import.route.js";

const app = express();
app.use(cors({
  origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(","),
}));
app.use(express.json());

const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many import requests. Please try again later.", code: "RATE_LIMITED" },
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
})

app.use("/api/import", importLimiter, importRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`APP is listening to port ${env.PORT} (${env.NODE_ENV})`)
});
