import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  message: ChatMessage;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  conversationId?: string;
}

export interface CodeChatRequest extends ChatRequest {
  codeContext?: {
    language: string;
    framework?: string;
    projectType?: string;
  };
}

export interface CodeChatResponse extends ChatResponse {
  suggestions?: {
    code?: string;
    explanation?: string;
    improvements?: string[];
  };
}

// Chat AI service for general conversations
export async function chatWithAI(request: ChatRequest): Promise<ChatResponse> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.maxTokens || 1000,
      }
    });

    // Convert messages to Gemini format
    const prompt = buildChatPrompt(request.messages, request.context);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: text,
      timestamp: new Date().toISOString()
    };

    return {
      message: assistantMessage,
      conversationId: generateConversationId()
    };
  } catch (error) {
    console.error("Error in chatWithAI:", error);
    throw new Error("Không thể xử lý tin nhắn chat");
  }
}

// Specialized chat for code-related conversations
export async function chatWithCodeAI(request: CodeChatRequest): Promise<CodeChatResponse> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: request.temperature || 0.3, // Lower temperature for code
        maxOutputTokens: request.maxTokens || 1500,
      }
    });

    // Build specialized prompt for code conversations
    const prompt = buildCodeChatPrompt(request);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: text,
      timestamp: new Date().toISOString()
    };

    // Try to extract code suggestions from response
    const suggestions = extractCodeSuggestions(text, request.codeContext?.language);

    return {
      message: assistantMessage,
      suggestions,
      conversationId: generateConversationId()
    };
  } catch (error) {
    console.error("Error in chatWithCodeAI:", error);
    throw new Error("Không thể xử lý tin nhắn code chat");
  }
}

// Generate code explanation
export async function explainCode(code: string, language: string, question?: string): Promise<ChatResponse> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      }
    });

    const prompt = `Bạn là một chuyên gia lập trình viên. Hãy giải thích đoạn code ${language} sau:

\`\`\`${language}
${code}
\`\`\`

${question ? `Câu hỏi cụ thể: ${question}` : 'Hãy giải thích chi tiết cách hoạt động của code này.'}

Yêu cầu:
- Giải thích từng phần của code
- Nêu ra các điểm quan trọng
- Đưa ra các gợi ý cải thiện nếu có
- Sử dụng tiếng Việt`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: text,
      timestamp: new Date().toISOString()
    };

    return {
      message: assistantMessage,
      conversationId: generateConversationId()
    };
  } catch (error) {
    console.error("Error explaining code:", error);
    throw new Error("Không thể giải thích code");
  }
}

// Generate code review
export async function reviewCode(code: string, language: string): Promise<ChatResponse> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1200,
      }
    });

    const prompt = `Bạn là một senior developer. Hãy review đoạn code ${language} sau:

\`\`\`${language}
${code}
\`\`\`

Hãy đánh giá theo các tiêu chí:
1. **Cú pháp và logic**: Code có chạy đúng không?
2. **Best practices**: Có tuân thủ coding standards không?
3. **Performance**: Có vấn đề về hiệu suất không?
4. **Security**: Có lỗ hổng bảo mật nào không?
5. **Maintainability**: Code có dễ bảo trì không?
6. **Gợi ý cải thiện**: Đưa ra các đề xuất cụ thể

Sử dụng tiếng Việt và format rõ ràng.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: text,
      timestamp: new Date().toISOString()
    };

    return {
      message: assistantMessage,
      conversationId: generateConversationId()
    };
  } catch (error) {
    console.error("Error reviewing code:", error);
    throw new Error("Không thể review code");
  }
}

// Helper functions
function buildChatPrompt(messages: ChatMessage[], context?: string): string {
  let prompt = "Bạn là một AI assistant thông minh và hữu ích. ";
  
  if (context) {
    prompt += `Context: ${context}\n\n`;
  }
  
  prompt += "Hãy trả lời câu hỏi của người dùng một cách chính xác và hữu ích. Sử dụng tiếng Việt.\n\n";
  
  // Add conversation history
  messages.forEach(msg => {
    if (msg.role === 'user') {
      prompt += `Người dùng: ${msg.content}\n`;
    } else if (msg.role === 'assistant') {
      prompt += `Assistant: ${msg.content}\n`;
    } else if (msg.role === 'system') {
      prompt += `System: ${msg.content}\n`;
    }
  });
  
  prompt += "Assistant: ";
  return prompt;
}

function buildCodeChatPrompt(request: CodeChatRequest): string {
  let prompt = "Bạn là một chuyên gia lập trình viên với nhiều năm kinh nghiệm. ";
  
  if (request.codeContext) {
    const { language, framework, projectType } = request.codeContext;
    prompt += `Bạn chuyên về ${language}`;
    if (framework) prompt += ` và ${framework}`;
    if (projectType) prompt += ` cho ${projectType}`;
    prompt += ".\n\n";
  }
  
  prompt += "Hãy giúp người dùng với các vấn đề lập trình. Trả lời chính xác, đưa ra code examples khi cần thiết.\n\n";
  
  // Add conversation history
  request.messages.forEach(msg => {
    if (msg.role === 'user') {
      prompt += `Người dùng: ${msg.content}\n`;
    } else if (msg.role === 'assistant') {
      prompt += `Assistant: ${msg.content}\n`;
    }
  });
  
  prompt += "Assistant: ";
  return prompt;
}

function extractCodeSuggestions(response: string, language?: string): any {
  const suggestions: any = {};
  
  // Try to extract code blocks
  const codeBlockRegex = new RegExp(
    `\`\`\`${language || '\\w+'}\\s*([\\s\\S]*?)\\s*\`\`\``,
    "i"
  );
  const codeMatch = response.match(codeBlockRegex);
  
  if (codeMatch && codeMatch[1]) {
    suggestions.code = codeMatch[1].trim();
  }
  
  // Extract explanation (text before code blocks)
  const explanationMatch = response.split('```')[0];
  if (explanationMatch && explanationMatch.trim()) {
    suggestions.explanation = explanationMatch.trim();
  }
  
  return Object.keys(suggestions).length > 0 ? suggestions : undefined;
}

function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
