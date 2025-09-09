# Code Generator API

API service để tạo code tự động sử dụng Gemini AI, hỗ trợ nhiều template khác nhau.

## Cài đặt

1. Cài đặt dependencies:

```bash
npm install
```

2. Cấu hình environment variables:

```bash
# Tạo file .env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

3. Chạy server:

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### 1. Lấy danh sách templates

```http
GET /api/code-generator/templates
```

**Response:**

```json
{
  "success": true,
  "templates": [
    {
      "id": "react-component",
      "language": "tsx",
      "description": "React functional component with TypeScript"
    },
    {
      "id": "react-hook",
      "language": "ts",
      "description": "Custom React hook with TypeScript"
    },
    {
      "id": "api-endpoint",
      "language": "ts",
      "description": "Next.js API route handler"
    },
    {
      "id": "database-model",
      "language": "prisma",
      "description": "Prisma database model schema"
    },
    {
      "id": "component-test",
      "language": "ts",
      "description": "Jest test for React components"
    },
    {
      "id": "utility-function",
      "language": "ts",
      "description": "TypeScript utility function"
    }
  ]
}
```

### 2. Tạo code đơn lẻ

```http
POST /api/code-generator/generate
```

**Request Body:**

```json
{
  "template": "react-component",
  "componentName": "UserProfile",
  "props": "name: string, email: string, avatar?: string",
  "additionalParams": {
    "method": "GET"
  }
}
```

**Response:**

```json
{
  "success": true,
  "code": "import React from 'react';\n\ninterface UserProfileProps {\n  name: string;\n  email: string;\n  avatar?: string;\n}\n\nconst UserProfile: React.FC<UserProfileProps> = ({ name, email, avatar }) => {\n  return (\n    <div className=\"user-profile\">\n      {avatar && <img src={avatar} alt={name} />}\n      <h2>{name}</h2>\n      <p>{email}</p>\n    </div>\n  );\n};\n\nexport default UserProfile;",
  "template": "react-component",
  "language": "tsx",
  "description": "React functional component with TypeScript",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Tạo code hàng loạt

```http
POST /api/code-generator/batch
```

**Request Body:**

```json
{
  "requests": [
    {
      "template": "react-component",
      "componentName": "Card",
      "props": "title, children"
    },
    {
      "template": "utility-function",
      "componentName": "debounce",
      "props": "debounce function calls"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "results": [
    {
      "index": 0,
      "success": true,
      "code": "...",
      "template": "react-component",
      "language": "tsx",
      "description": "React functional component with TypeScript"
    },
    {
      "index": 1,
      "success": true,
      "code": "...",
      "template": "utility-function",
      "language": "ts",
      "description": "TypeScript utility function"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Health Check

```http
GET /api/code-generator/health
```

**Response:**

```json
{
  "status": "healthy",
  "service": "code-generator",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Templates hỗ trợ

### 1. React Component (`react-component`)

- **Language:** TypeScript (TSX)
- **Mô tả:** Tạo React functional component với TypeScript
- **Tham số:**
  - `componentName`: Tên component
  - `props`: Props của component

### 2. React Hook (`react-hook`)

- **Language:** TypeScript
- **Mô tả:** Tạo custom React hook
- **Tham số:**
  - `componentName`: Tên hook (bắt đầu với `use`)
  - `props`: Chức năng của hook

### 3. API Endpoint (`api-endpoint`)

- **Language:** TypeScript
- **Mô tả:** Tạo Next.js API route handler
- **Tham số:**
  - `componentName`: Đường dẫn API
  - `props`: Mô tả chức năng
  - `additionalParams.method`: HTTP method

### 4. Database Model (`database-model`)

- **Language:** Prisma Schema
- **Mô tả:** Tạo Prisma database model
- **Tham số:**
  - `componentName`: Tên model
  - `props`: Các field của model

### 5. Component Test (`component-test`)

- **Language:** TypeScript
- **Mô tả:** Tạo Jest test cho React component
- **Tham số:**
  - `componentName`: Tên component cần test
  - `props`: Các test case

### 6. Utility Function (`utility-function`)

- **Language:** TypeScript
- **Mô tả:** Tạo utility function
- **Tham số:**
  - `componentName`: Tên function
  - `props`: Mô tả chức năng

## Testing

Chạy test để kiểm tra API:

```bash
node test-code-generator.js
```

## Rate Limiting

API có rate limiting để tránh spam:

- 100 requests per 15 minutes per IP
- Batch requests giới hạn tối đa 5 requests

## Error Handling

API trả về các mã lỗi chuẩn:

- `400`: Bad Request (thiếu hoặc sai tham số)
- `429`: Too Many Requests (vượt quá rate limit)
- `500`: Internal Server Error (lỗi server)

## Security

- Sử dụng Helmet để bảo mật headers
- CORS được cấu hình
- Rate limiting để chống spam
- Input validation cho tất cả endpoints
