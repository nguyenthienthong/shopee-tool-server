// services/aiService.ts
import OpenAI from "openai";

// Check if API key exists, if not use a dummy client for development
const apiKey = process.env.OPENAI_API_KEY;
let client: OpenAI;

if (apiKey && apiKey !== "test_key_for_development") {
  client = new OpenAI({ apiKey });
} else {
  // Dummy client for development/testing
  client = {} as OpenAI;
}

export async function generateDescription(
  productName: string,
  features: string[]
): Promise<string> {
  try {
    // If no real API key, return mock response for development
    if (!apiKey || apiKey === "test_key_for_development") {
      return `[MOCK] Mô tả sản phẩm ${productName} với các tính năng: ${features.join(
        ", "
      )}. Đây là mô tả mẫu được tạo trong môi trường development.`;
    }

    const prompt = `Viết mô tả sản phẩm Shopee chuẩn SEO, tone chuyên nghiệp.
  Tên sản phẩm: ${productName}
  Tính năng: ${features.join(", ")}
  `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return (
      completion.choices[0].message.content || "Không thể tạo mô tả sản phẩm"
    );
  } catch (error) {
    console.error("Error generating description:", error);
    throw new Error("Không thể tạo mô tả sản phẩm");
  }
}
