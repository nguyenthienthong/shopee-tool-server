# Shopee AI Tool Server

Server cung cấp API để tạo mô tả sản phẩm Shopee tự động sử dụng AI.

## Cài đặt

1. Cài đặt dependencies:

```bash
npm install
```

2. Tạo file `.env` và cấu hình:

```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=4000
```

## Sử dụng

### Development mode:

```bash
npm run dev
```

### Build và run production:

```bash
npm run build
npm start
```

### Type checking:

```bash
npm run type-check
```

## API Endpoints

### GET /api/products

Lấy danh sách sản phẩm từ Shopee

- Query params: `shopId`, `token`

### POST /api/generate-description

Tạo mô tả sản phẩm bằng AI

- Body: `{ "name": "Tên sản phẩm", "features": ["tính năng 1", "tính năng 2"] }`

## Cấu trúc Project

```
├── index.ts                 # Main server file
├── services/
│   ├── aiService.ts        # OpenAI integration
│   └── shopeeApi.ts        # Shopee API integration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```
