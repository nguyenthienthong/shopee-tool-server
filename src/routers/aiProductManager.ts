import express from "express";
import { generateProductContent, generateAllProductContent } from "../services/aiProductManager";
import { authOptional } from "../middleware/auth";
import { captionRateLimiter } from "../middleware/rateLimiter";

const router = express.Router();

/**
 * POST /api/ai-product-manager/content
 * Generate specific product content (description, shortDescription, or features)
 * body: {
 *   productName: string,
 *   category: string,
 *   keywords?: string[],
 *   type: 'description' | 'shortDescription' | 'features'
 * }
 */
router.post("/content", authOptional, captionRateLimiter, async (req, res) => {
  try {
    const { productName, category, keywords, type } = req.body;
    
    // Validate required fields
    if (!productName || typeof productName !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'productName' field" });
    }
    if (!category || typeof category !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'category' field" });
    }
    if (!type || !['description', 'shortDescription', 'features'].includes(type)) {
      return res.status(400).json({ 
        error: "Missing or invalid 'type' field. Must be one of: description, shortDescription, features" 
      });
    }

    // Process keywords
    const kwArray: string[] = Array.isArray(keywords)
      ? keywords.map(String).filter(Boolean)
      : typeof keywords === "string" && keywords.length
      ? keywords.split(",").map((s) => s.trim())
      : [];

    const content = await generateProductContent({
      productName,
      category,
      keywords: kwArray,
      type
    });

    return res.json({ 
      productName,
      category,
      type,
      content 
    });
  } catch (err: any) {
    console.error("AI Product Manager content generation error:", err?.message ?? err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * POST /api/ai-product-manager/all
 * Generate all product content (description, shortDescription, and features)
 * body: {
 *   productName: string,
 *   category: string,
 *   keywords?: string[]
 * }
 */
router.post("/all", authOptional, captionRateLimiter, async (req, res) => {
  try {
    const { productName, category, keywords } = req.body;
    
    // Validate required fields
    if (!productName || typeof productName !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'productName' field" });
    }
    if (!category || typeof category !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'category' field" });
    }

    // Process keywords
    const kwArray: string[] = Array.isArray(keywords)
      ? keywords.map(String).filter(Boolean)
      : typeof keywords === "string" && keywords.length
      ? keywords.split(",").map((s) => s.trim())
      : [];

    const allContent = await generateAllProductContent(productName, category, kwArray);

    return res.json({ 
      productName,
      category,
      ...allContent
    });
  } catch (err: any) {
    console.error("AI Product Manager all content generation error:", err?.message ?? err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
