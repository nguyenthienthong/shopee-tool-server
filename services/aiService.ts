// services/aiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyB7twsGDw6oKGQoD1lj1SQaG4bFn3r4o6U");

export async function generateDescription(
  productName: string,
  features: string[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Viết mô tả sản phẩm Shopee chuẩn SEO, tone chuyên nghiệp.
Tên sản phẩm: ${productName}
Tính năng: ${features.join(", ")}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || "Không thể tạo mô tả sản phẩm";
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    throw new Error("Không thể tạo mô tả sản phẩm");
  }
}
