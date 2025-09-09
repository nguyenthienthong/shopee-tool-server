import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface CodeGenerationRequest {
  template:
    | "react-component"
    | "react-hook"
    | "api-endpoint"
    | "database-model"
    | "component-test"
    | "utility-function";
  componentName?: string;
  props?: string;
  additionalParams?: Record<string, any>;
}

export interface CodeGenerationResponse {
  code: string;
  template: string;
  language: string;
  description: string;
}

// Template configurations
const TEMPLATE_CONFIGS = {
  "react-component": {
    language: "tsx",
    description: "React functional component with TypeScript",
  },
  "react-hook": {
    language: "ts",
    description: "Custom React hook with TypeScript",
  },
  "api-endpoint": {
    language: "ts",
    description: "Next.js API route handler",
  },
  "database-model": {
    language: "prisma",
    description: "Prisma database model schema",
  },
  "component-test": {
    language: "ts",
    description: "Jest test for React components",
  },
  "utility-function": {
    language: "ts",
    description: "TypeScript utility function",
  },
};

export async function generateCode(
  request: CodeGenerationRequest
): Promise<CodeGenerationResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const config = TEMPLATE_CONFIGS[request.template];
    const prompt = buildPrompt(request, config);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    // Extract code from the response
    const code = extractCodeFromResponse(generatedText, config.language);

    return {
      code,
      template: request.template,
      language: config.language,
      description: config.description,
    };
  } catch (error) {
    console.error("Error generating code with Gemini:", error);
    throw new Error("Không thể tạo code");
  }
}

function buildPrompt(request: CodeGenerationRequest, config: any): string {
  const { template, componentName, props, additionalParams } = request;

  let prompt = `Bạn là một chuyên gia lập trình viên. Hãy tạo code ${config.description}.\n\n`;

  switch (template) {
    case "react-component":
      prompt += `Tạo một React functional component với TypeScript:
- Tên component: ${componentName || "MyComponent"}
- Props: ${props || "Không có props cụ thể"}
- Yêu cầu: Sử dụng TypeScript, có interface cho props, có JSDoc comments
- Styling: Sử dụng CSS modules hoặc styled-components
- Export default component

Chỉ trả về code, không giải thích thêm.`;
      break;

    case "react-hook":
      prompt += `Tạo một custom React hook với TypeScript:
- Tên hook: ${componentName || "useCustomHook"}
- Chức năng: ${props || "Hook tùy chỉnh"}
- Yêu cầu: Sử dụng TypeScript, có return type rõ ràng, có JSDoc comments
- State management: Sử dụng useState, useEffect phù hợp

Chỉ trả về code, không giải thích thêm.`;
      break;

    case "api-endpoint":
      prompt += `Tạo một Next.js API route handler với TypeScript:
- Endpoint: ${componentName || "/api/example"}
- Method: ${additionalParams?.method || "GET"}
- Chức năng: ${props || "API endpoint cơ bản"}
- Yêu cầu: Sử dụng TypeScript, có error handling, có response types
- Validation: Validate input data

Chỉ trả về code, không giải thích thêm.`;
      break;

    case "database-model":
      prompt += `Tạo một Prisma database model:
- Model name: ${componentName || "Example"}
- Fields: ${props || "id, name, createdAt"}
- Yêu cầu: Có các field cơ bản (id, timestamps), có relationships nếu cần
- Constraints: Primary key, indexes phù hợp

Chỉ trả về Prisma schema, không giải thích thêm.`;
      break;

    case "component-test":
      prompt += `Tạo một Jest test cho React component:
- Component: ${componentName || "MyComponent"}
- Test cases: ${props || "Render, props handling, user interactions"}
- Yêu cầu: Sử dụng React Testing Library, có test cases cơ bản
- Coverage: Test rendering, props, events

Chỉ trả về test code, không giải thích thêm.`;
      break;

    case "utility-function":
      prompt += `Tạo một TypeScript utility function:
- Function name: ${componentName || "utilityFunction"}
- Chức năng: ${props || "Utility function cơ bản"}
- Yêu cầu: Sử dụng TypeScript, có type definitions, có JSDoc comments
- Error handling: Có xử lý lỗi phù hợp

Chỉ trả về code, không giải thích thêm.`;
      break;
  }

  return prompt;
}

function extractCodeFromResponse(response: string, language: string): string {
  // Remove markdown code blocks
  let code = response
    .replace(/```[\w]*\s*/, "")
    .replace(/\s*```$/, "")
    .trim();

  // If no code blocks found, return the entire response
  if (!response.includes("```")) {
    return response.trim();
  }

  // Extract code between code blocks
  const codeBlockRegex = new RegExp(
    `\`\`\`${language}\\s*([\\s\\S]*?)\\s*\`\`\``,
    "i"
  );
  const match = response.match(codeBlockRegex);

  if (match && match[1]) {
    return match[1].trim();
  }

  // Fallback: try to extract any code block
  const anyCodeBlockRegex = /```[\w]*\s*([\s\S]*?)\s*```/;
  const anyMatch = response.match(anyCodeBlockRegex);

  if (anyMatch && anyMatch[1]) {
    return anyMatch[1].trim();
  }

  return code;
}

// Helper function to get available templates
export function getAvailableTemplates() {
  return Object.keys(TEMPLATE_CONFIGS).map((key) => ({
    id: key,
    ...TEMPLATE_CONFIGS[key as keyof typeof TEMPLATE_CONFIGS],
  }));
}

// Helper function to validate template
export function isValidTemplate(
  template: string
): template is keyof typeof TEMPLATE_CONFIGS {
  return template in TEMPLATE_CONFIGS;
}
