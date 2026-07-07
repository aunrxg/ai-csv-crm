import express from "express";

const app = express();

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
})

app.listen(4000, () => {
  console.log("APP is listening to port 4000")
})