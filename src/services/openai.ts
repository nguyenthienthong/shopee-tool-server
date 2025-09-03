import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCaptionFromOpenAI(
  productName: string,
  keywords: string[],
  style?: string
) {
  const styleText = style ? `Phong cách: ${style}.` : "";
  const prompt = `Bạn là chuyên gia marketing cho sàn thương mại điện tử Việt Nam.
Viết 3 biến thể caption ngắn (mỗi caption < 140 ký tự) cho sản phẩm, phù hợp để đăng trên Shopee hoặc Lazada.
Yêu cầu: chèn tự nhiên các từ khóa: ${keywords.join(
    ", "
  )} (nếu có). ${styleText}
Tên sản phẩm: ${productName}
Trả về output ở định dạng JSON: { "captions": ["...", "...", "..."] }`;

  // Tùy model bạn có thể chọn gpt-4o-mini hoặc gpt-4o hoặc gpt-4o-realtime
  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Bạn là trợ lý tạo nội dung ngắn cho seller Việt Nam.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 300,
  });

  const text = resp.choices?.[0]?.message?.content ?? "";
  // Cố gắng parse JSON nếu OpenAI trả JSON
  try {
    const parsed = JSON.parse(text);
    if (parsed && Array.isArray(parsed.captions)) return parsed.captions;
  } catch (err) {
    // fallback: tách newline
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    // lấy tối đa 3 dòng
    return lines.slice(0, 3);
  }

  return [text];
}
