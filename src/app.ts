import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import captionRouter from "./routers/cation";
import imageRouter from "./routers/image";
import aiProductManagerRouter from "./routers/aiProductManager";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) =>
  res.json({ ok: true, name: "shopee-caption-backend" })
);

app.use("/api/caption", captionRouter);
app.use("/api/image", imageRouter);
app.use("/api/ai-product-manager", aiProductManagerRouter);

export default app;
