import express from "express";
import { generateCaptionFromGemini } from "../services/gemini";
import { captionRateLimiter } from "../middleware/rateLimiter";
import { authOptional } from "../middleware/auth";

const router = express.Router();

/**
 * POST /api/caption
 * body: {
 *   type: string,          // e.g., "product-description"
 *   topic: string,         // e.g., "new product"
 *   tone: string,          // e.g., "professional"
 *   length: string,        // e.g., "short"
 *   platform: string,      // e.g., "facebook"
 *   description: string    // optional description
 * }
 */
router.post("/", authOptional, captionRateLimiter, async (req, res) => {
  try {
    const { type, topic, tone, length, platform, description } = req.body;
    
    // Validate required fields
    if (!type || typeof type !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'type' field" });
    }
    if (!topic || typeof topic !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'topic' field" });
    }
    if (!tone || typeof tone !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'tone' field" });
    }
    if (!length || typeof length !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'length' field" });
    }
    if (!platform || typeof platform !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'platform' field" });
    }

    const captionConfig = {
      type,
      topic,
      tone,
      length,
      platform,
      description: description || ""
    };

    const captions = await generateCaptionFromGemini(captionConfig);
    // Optionally: save usage to DB (user, captionConfig, timestamp) for analytics/billing
    return res.json({ captions });
  } catch (err: any) {
    console.error("Caption generation error:", err?.message ?? err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
