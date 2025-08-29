// test-api.js - Script test full tính năng API
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testAPI() {
  console.log('🚀 Bắt đầu test API...\n');

  try {
    // Test 1: GET /api/products
    console.log('📋 Test 1: GET /api/products');
    console.log('URL:', `${BASE_URL}/api/products?shopId=123&token=test_token`);
    
    const productsResponse = await axios.get(`${BASE_URL}/api/products`, {
      params: {
        shopId: 123,
        token: 'test_token'
      }
    });
    
    console.log('✅ Status:', productsResponse.status);
    console.log('📊 Response:', JSON.stringify(productsResponse.data, null, 2));
    console.log('');

    // Test 2: POST /api/generate-description
    console.log('🤖 Test 2: POST /api/generate-description');
    console.log('URL:', `${BASE_URL}/api/generate-description`);
    
    const descriptionResponse = await axios.post(`${BASE_URL}/api/generate-description`, {
      name: "Điện thoại iPhone 15 Pro Max",
      features: ["Màn hình 6.7 inch", "Chip A17 Pro", "Camera 48MP", "5G"]
    });
    
    console.log('✅ Status:', descriptionResponse.status);
    console.log('📝 Response:', JSON.stringify(descriptionResponse.data, null, 2));
    console.log('');

    // Test 3: Test với dữ liệu thực tế
    console.log('🔄 Test 3: Test với dữ liệu thực tế');
    
    const realDataResponse = await axios.post(`${BASE_URL}/api/generate-description`, {
      name: "Laptop Gaming ASUS ROG",
      features: ["RTX 4060", "Intel i7-12700H", "16GB RAM", "512GB SSD", "15.6 inch 144Hz"]
    });
    
    console.log('✅ Status:', realDataResponse.status);
    console.log('📝 Response:', JSON.stringify(realDataResponse.data, null, 2));
    console.log('');

    console.log('🎉 Tất cả test đều thành công!');
    
  } catch (error) {
    console.error('❌ Lỗi test API:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Chạy test
testAPI();
