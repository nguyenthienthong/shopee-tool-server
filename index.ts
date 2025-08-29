// index.ts
import express from "express";
import { getShopProducts } from "./services/shopeeApi.js";
import { generateDescription } from "./services/aiService.js";

const app = express();
app.use(express.json());

app.get("/api/products", async (req, res) => {
  const { shopId, token } = req.query;
  const products = await getShopProducts(Number(shopId), String(token));
  res.json(products);
});

app.post("/api/generate-description", async (req, res) => {
  const { name, features } = req.body;
  const text = await generateDescription(name, features);
  res.json({ description: text });
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
