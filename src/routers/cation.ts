import express from "express";
import { generateCaptionFromGemini } from "../services/gemini";
import { captionRateLimiter } from "../middleware/rateLimiter";
import { authOptional } from "../middleware/auth";

const router = express.Router();

/**
 * POST /api/caption
 * body: {
 *   name: string,
 *   keywords?: string[],   // optional array of keyword strings
 *   style?: string         // optional: "vui nhộn", "chuyên nghiệp", etc.
 * }
 */
router.post("/", authOptional, captionRateLimiter, async (req, res) => {
  try {
    const { name, keywords, style } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Missing product name" });
    }
    const kwArray: string[] = Array.isArray(keywords)
      ? keywords.map(String).filter(Boolean)
      : typeof keywords === "string" && keywords.length
      ? keywords.split(",").map((s) => s.trim())
      : [];

    const captions = await generateCaptionFromGemini(name, kwArray, style);
    // Optionally: save usage to DB (user, productName, timestamp) for analytics/billing
    return res.json({ captions });
  } catch (err: any) {
    console.error("Caption generation error:", err?.message ?? err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
