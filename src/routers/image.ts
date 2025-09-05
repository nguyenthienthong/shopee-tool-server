import express from "express";
import {
  generateProductImage,
  generateProductImages,
} from "../services/gemini";
import { captionRateLimiter } from "../middleware/rateLimiter";
import { authOptional } from "../middleware/auth";

const router = express.Router();

/**
 * POST /api/image
 * body: {
 *   name: string,
 *   description: string,
 *   style?: string,         // optional: "vui nhộn", "chuyên nghiệp", etc.
 *   count?: number          // optional: number of images to generate (default: 1)
 * }
 */
router.post("/", authOptional, captionRateLimiter, async (req, res) => {
  try {
    const { name, description, style, count = 1 } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Missing product name" });
    }

    if (!description || typeof description !== "string") {
      return res.status(400).json({ error: "Missing product description" });
    }

    const imageCount = Math.min(Math.max(parseInt(count) || 1, 1), 5); // Limit to 1-5 images

    let images: string[];
    if (imageCount === 1) {
      const image = await generateProductImage(name, description, style);
      images = [image];
    } else {
      images = await generateProductImages(
        name,
        description,
        imageCount,
        style
      );
    }

    return res.json({
      images,
      count: images.length,
      productName: name,
    });
  } catch (err: any) {
    console.error("Image generation error:", err?.message ?? err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * POST /api/image/single
 * body: {
 *   name: string,
 *   description: string,
 *   style?: string
 * }
 */
router.post("/single", authOptional, captionRateLimiter, async (req, res) => {
  try {
    const { name, description, style } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Missing product name" });
    }

    if (!description || typeof description !== "string") {
      return res.status(400).json({ error: "Missing product description" });
    }

    const image = await generateProductImage(name, description, style);

    return res.json({
      image,
      productName: name,
    });
  } catch (err: any) {
    console.error("Single image generation error:", err?.message ?? err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
