import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict";

export async function generateCaptionFromGemini(
  productName: string,
  keywords: string[],
  style?: string
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const styleText = style ? `Phong cách: ${style}.` : "";
    const prompt = `Bạn là chuyên gia marketing cho sàn thương mại điện tử Việt Nam.
Viết 3 biến thể caption ngắn (mỗi caption < 140 ký tự) cho sản phẩm, phù hợp để đăng trên Shopee hoặc Lazada.
Yêu cầu: chèn tự nhiên các từ khóa: ${keywords.join(
      ", "
    )} (nếu có). ${styleText}
Tên sản phẩm: ${productName}
Trả về output ở định dạng JSON: { "captions": ["...", "...", "..."] }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Cố gắng parse JSON nếu Gemini trả JSON
    try {
      // Remove any markdown formatting
      const cleanText = text
        .replace(/```json\s*/, "")
        .replace(/\s*```/, "")
        .trim();
      const parsed = JSON.parse(cleanText);
      if (parsed && Array.isArray(parsed.captions)) return parsed.captions;
    } catch (err) {
      // fallback: tách newline và tìm các dòng có nội dung caption
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(
          (l) =>
            l.length > 0 &&
            !l.startsWith("{") &&
            !l.startsWith("}") &&
            !l.startsWith('"captions"')
        )
        .filter(Boolean);
      // lấy tối đa 3 dòng
      return lines.slice(0, 3);
    }

    return [text];
  } catch (error) {
    console.error("Error generating caption with Gemini:", error);
    throw new Error("Không thể tạo caption sản phẩm");
  }
}

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

export async function generateProductImage(
  productName: string,
  description: string,
  style?: string
): Promise<string> {
  try {
    // Note: Gemini 1.5 Flash doesn't support image generation
    // This is a placeholder for future implementation
    // You might want to use a different service like DALL-E, Midjourney API, or Stable Diffusion

    const styleText = style ? `Phong cách: ${style}.` : "";
    const prompt = `Tạo hình ảnh sản phẩm cho e-commerce với các yêu cầu sau:
- Tên sản phẩm: ${productName}
- Mô tả: ${description}
- Phong cách: ${styleText || "Chuyên nghiệp, hiện đại"}
- Yêu cầu: Hình ảnh sản phẩm chất lượng cao, phù hợp để đăng trên Shopee/Lazada
- Kích thước: 1024x1024 pixels
- Background: Trắng hoặc gradient nhẹ
- Lighting: Chuyên nghiệp, làm nổi bật sản phẩm`;

    // For now, return a placeholder image URL
    // In production, you would integrate with an actual image generation service
    const payload = {
      instances: {
        prompt: prompt,
      },
      parameters: {
        sampleCount: 1,
      },
    };

    const response = await fetch(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      return errorData;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating product image with Gemini:", error);
    throw new Error("Không thể tạo hình ảnh sản phẩm");
  }
}

export async function generateProductImages(
  productName: string,
  description: string,
  count: number = 3,
  style?: string
): Promise<string[]> {
  try {
    const images: string[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const image = await generateProductImage(
          productName,
          description,
          style
        );
        images.push(image);
      } catch (error) {
        console.error(`Error generating image ${i + 1}:`, error);
      }
    }

    return images;
  } catch (error) {
    console.error("Error generating product images:", error);
    throw new Error("Không thể tạo hình ảnh sản phẩm");
  }
}
