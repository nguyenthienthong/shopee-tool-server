import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const aiPrompts = {
  description: (productName: string, category: string, keywords: string[]) =>
    `Generate a compelling product description for "${productName}" in the ${category} category. 
    Include these keywords: ${keywords.join(", ")}. 
    Make it engaging, highlight key benefits, and include a call-to-action. 
    Keep it between 150-200 words.`,

  shortDescription: (productName: string, category: string) =>
    `Create a short, punchy product tagline for "${productName}" in the ${category} category. 
    Maximum 20 words, focus on the main benefit.`,

  features: (productName: string, category: string) =>
    `Generate 5 key features for "${productName}" in the ${category} category. 
    Each feature should be one short sentence highlighting a benefit.`,
};

export interface ProductManagerRequest {
  productName: string;
  category: string;
  keywords?: string[];
  type: 'description' | 'shortDescription' | 'features';
}

export async function generateProductContent(request: ProductManagerRequest): Promise<string | string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    let prompt: string;
    
    switch (request.type) {
      case 'description':
        prompt = aiPrompts.description(
          request.productName, 
          request.category, 
          request.keywords || []
        );
        break;
      case 'shortDescription':
        prompt = aiPrompts.shortDescription(request.productName, request.category);
        break;
      case 'features':
        prompt = aiPrompts.features(request.productName, request.category);
        break;
      default:
        throw new Error('Invalid content type');
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // For features, try to parse as array
    if (request.type === 'features') {
      try {
        // Try to parse as JSON array first
        const cleanText = text
          .replace(/```json\s*/, "")
          .replace(/\s*```/, "")
          .trim();
        const parsed = JSON.parse(cleanText);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        // Fallback: split by newlines and clean up
        const features = text
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .filter(line => !line.match(/^\d+\./)) // Remove numbered lists
          .slice(0, 5); // Take max 5 features
        return features;
      }
    }

    return text || "Không thể tạo nội dung sản phẩm";
  } catch (error) {
    console.error("Error generating product content with Gemini:", error);
    throw new Error("Không thể tạo nội dung sản phẩm");
  }
}

export async function generateAllProductContent(
  productName: string, 
  category: string, 
  keywords: string[] = []
): Promise<{
  description: string;
  shortDescription: string;
  features: string[];
}> {
  try {
    const [description, shortDescription, features] = await Promise.all([
      generateProductContent({ productName, category, keywords, type: 'description' }),
      generateProductContent({ productName, category, keywords, type: 'shortDescription' }),
      generateProductContent({ productName, category, keywords, type: 'features' })
    ]);

    return {
      description: description as string,
      shortDescription: shortDescription as string,
      features: features as string[]
    };
  } catch (error) {
    console.error("Error generating all product content:", error);
    throw new Error("Không thể tạo nội dung sản phẩm");
  }
}
