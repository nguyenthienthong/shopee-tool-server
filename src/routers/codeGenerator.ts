import express from "express";
import {
  generateCode,
  getAvailableTemplates,
  isValidTemplate,
  CodeGenerationRequest,
} from "../services/codeGenerator";
import { authOptional } from "../middleware/auth";
import { captionRateLimiter } from "../middleware/rateLimiter";

const router = express.Router();

/**
 * GET /api/code-generator/templates
 * Get available code generation templates
 */
router.get("/templates", authOptional, async (req, res) => {
  try {
    const templates = getAvailableTemplates();
    return res.json({
      success: true,
      templates,
    });
  } catch (err: any) {
    console.error("Error getting templates:", err?.message ?? err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * POST /api/code-generator/generate
 * Generate code based on template and parameters
 * body: {
 *   template: 'react-component' | 'react-hook' | 'api-endpoint' | 'database-model' | 'component-test' | 'utility-function',
 *   componentName?: string,
 *   props?: string,
 *   additionalParams?: Record<string, any>
 * }
 */
router.post("/generate", authOptional, captionRateLimiter, async (req, res) => {
  try {
    const { template, componentName, props, additionalParams } = req.body;

    // Validate required fields
    if (!template || !isValidTemplate(template)) {
      return res.status(400).json({
        error:
          "Missing or invalid 'template' field. Must be one of: react-component, react-hook, api-endpoint, database-model, component-test, utility-function",
        availableTemplates: getAvailableTemplates().map((t) => t.id),
      });
    }

    // Validate optional fields
    if (componentName && typeof componentName !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid 'componentName' field. Must be a string" });
    }

    if (props && typeof props !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid 'props' field. Must be a string" });
    }

    const request: CodeGenerationRequest = {
      template,
      componentName: componentName || undefined,
      props: props || undefined,
      additionalParams: additionalParams || {},
    };

    const result = await generateCode(request);

    return res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Code generation error:", err?.message ?? err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err?.message || "Không thể tạo code",
    });
  }
});

/**
 * POST /api/code-generator/batch
 * Generate multiple code snippets in one request
 * body: {
 *   requests: CodeGenerationRequest[]
 * }
 */
router.post("/batch", authOptional, captionRateLimiter, async (req, res) => {
  try {
    const { requests } = req.body;

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        error: "Missing or invalid 'requests' field. Must be a non-empty array",
      });
    }

    if (requests.length > 5) {
      return res.status(400).json({
        error: "Too many requests. Maximum 5 requests per batch",
      });
    }

    // Validate each request
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      if (!request.template || !isValidTemplate(request.template)) {
        return res.status(400).json({
          error: `Invalid template in request ${
            i + 1
          }. Must be one of: react-component, react-hook, api-endpoint, database-model, component-test, utility-function`,
        });
      }
    }

    // Generate all codes in parallel
    const results = await Promise.all(
      requests.map(async (request, index) => {
        try {
          const result = await generateCode(request);
          return { index, success: true, ...result };
        } catch (error: any) {
          return {
            index,
            success: false,
            error: error.message || "Generation failed",
            template: request.template,
          };
        }
      })
    );

    return res.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Batch code generation error:", err?.message ?? err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err?.message || "Không thể tạo code",
    });
  }
});

/**
 * GET /api/code-generator/health
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "code-generator",
    timestamp: new Date().toISOString(),
  });
});

export default router;
