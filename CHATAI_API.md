# ChatAI API Documentation

## Tổng quan

ChatAI API được tích hợp vào phần code-generator để cung cấp các tính năng chat với AI assistant, đặc biệt tập trung vào các cuộc trò chuyện liên quan đến lập trình.

## Endpoints

### 1. Chat với AI Assistant

**POST** `/api/code-generator/chat`

Chat tổng quát với AI assistant.

#### Request Body:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Xin chào, bạn có thể giúp tôi không?"
    }
  ],
  "context": "Tôi đang học lập trình",
  "maxTokens": 1000,
  "temperature": 0.7
}
```

#### Response:

```json
{
  "success": true,
  "message": {
    "role": "assistant",
    "content": "Xin chào! Tôi rất vui được giúp bạn học lập trình...",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "conversationId": "conv_1704067200000_abc123def",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Chat với AI cho Code

**POST** `/api/code-generator/code-chat`

Chat chuyên biệt cho các vấn đề lập trình.

#### Request Body:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Làm thế nào để tạo một React component?"
    }
  ],
  "codeContext": {
    "language": "typescript",
    "framework": "react",
    "projectType": "web-app"
  },
  "maxTokens": 1500,
  "temperature": 0.3
}
```

#### Response:

```json
{
  "success": true,
  "message": {
    "role": "assistant",
    "content": "Để tạo một React component với TypeScript...",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "suggestions": {
    "code": "import React from 'react';\n\ninterface Props {\n  // ...\n}\n\nconst MyComponent: React.FC<Props> = ({ ... }) => {\n  return (\n    <div>\n      {/* ... */}\n    </div>\n  );\n};\n\nexport default MyComponent;",
    "explanation": "Đây là cách tạo một React component cơ bản..."
  },
  "conversationId": "conv_1704067200000_abc123def",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 3. Giải thích Code

**POST** `/api/code-generator/explain-code`

Nhận giải thích chi tiết về một đoạn code.

#### Request Body:

```json
{
  "code": "const add = (a: number, b: number): number => {\n  return a + b;\n};",
  "language": "typescript",
  "question": "Hàm này làm gì?"
}
```

#### Response:

```json
{
  "success": true,
  "message": {
    "role": "assistant",
    "content": "Hàm này là một arrow function trong TypeScript...",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "conversationId": "conv_1704067200000_abc123def",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 4. Review Code

**POST** `/api/code-generator/review-code`

Nhận đánh giá và gợi ý cải thiện cho code.

#### Request Body:

```json
{
  "code": "function calculateTotal(items) {\n  let total = 0;\n  for (let i = 0; i < items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}",
  "language": "javascript"
}
```

#### Response:

```json
{
  "success": true,
  "message": {
    "role": "assistant",
    "content": "## Code Review\n\n### Điểm tích cực:\n- Logic đúng đắn...\n\n### Gợi ý cải thiện:\n1. Sử dụng reduce() thay vì for loop...",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "conversationId": "conv_1704067200000_abc123def",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Các tham số

### Message Format

```typescript
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}
```

### Code Context

```typescript
interface CodeContext {
  language: string; // Ví dụ: "typescript", "javascript", "python"
  framework?: string; // Ví dụ: "react", "vue", "angular"
  projectType?: string; // Ví dụ: "web-app", "mobile-app", "api"
}
```

### Generation Config

- `maxTokens`: Số token tối đa cho response (mặc định: 1000 cho chat, 1500 cho code-chat)
- `temperature`: Độ sáng tạo của AI (0.0 - 1.0, mặc định: 0.7 cho chat, 0.3 cho code-chat)

## Rate Limiting

Tất cả endpoints đều sử dụng `captionRateLimiter` middleware để giới hạn số lượng request.

## Authentication

Tất cả endpoints đều sử dụng `authOptional` middleware, có nghĩa là:

- Không bắt buộc phải có authentication
- Nếu có token hợp lệ, sẽ được ghi nhận để tracking

## Error Handling

Tất cả endpoints đều có error handling với các mã lỗi:

- `400`: Bad Request (thiếu hoặc sai format dữ liệu)
- `500`: Internal Server Error (lỗi server hoặc AI service)

## Ví dụ sử dụng

### JavaScript/TypeScript

```javascript
// Chat đơn giản
const chatResponse = await fetch("/api/code-generator/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Giải thích về React hooks" }],
  }),
});

// Code chat với context
const codeChatResponse = await fetch("/api/code-generator/code-chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Tạo một custom hook để fetch data" }],
    codeContext: {
      language: "typescript",
      framework: "react",
    },
  }),
});
```

### cURL

```bash
# Chat đơn giản
curl -X POST http://localhost:3000/api/code-generator/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Xin chào!"}
    ]
  }'

# Giải thích code
curl -X POST http://localhost:3000/api/code-generator/explain-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const sum = (a, b) => a + b;",
    "language": "javascript"
  }'
```

## Lưu ý

1. **Temperature**: Sử dụng temperature thấp (0.1-0.3) cho code generation để có kết quả chính xác hơn
2. **Max Tokens**: Điều chỉnh maxTokens dựa trên độ dài response mong muốn
3. **Context**: Cung cấp context để AI hiểu rõ hơn về ngữ cảnh cuộc trò chuyện
4. **Code Context**: Sử dụng codeContext cho các cuộc trò chuyện liên quan đến lập trình để có kết quả tốt hơn
