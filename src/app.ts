import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import captionRouter from "./routers/cation";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) =>
  res.json({ ok: true, name: "shopee-caption-backend" })
);

app.use("/api/caption", captionRouter);

export default app;
