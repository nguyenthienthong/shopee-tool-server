import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
