// services/shopeeApi.ts
import axios from "axios";

const SHOPEE_API = "https://partner.shopeemobile.com/api/v2";

interface ShopeeProduct {
  item_id: number;
  item_name: string;
  item_status: string;
  price: number;
  stock: number;
}

interface ShopeeApiResponse {
  error: string | null;
  message: string;
  response: {
    item: ShopeeProduct[];
    total_count: number;
  };
}

export async function getShopProducts(
  shopId: number,
  accessToken: string
): Promise<ShopeeApiResponse> {
  try {
    // For development/testing, return mock data
    if (
      process.env.NODE_ENV === "development" ||
      !accessToken ||
      accessToken === "test_token"
    ) {
      return {
        error: null,
        message: "Success",
        response: {
          item: [
            {
              item_id: 1,
              item_name: "Điện thoại iPhone 15 Pro Max",
              item_status: "NORMAL",
              price: 29990000,
              stock: 50,
            },
            {
              item_id: 2,
              item_name: "Laptop Dell XPS 13",
              item_status: "NORMAL",
              price: 25990000,
              stock: 25,
            },
            {
              item_id: 3,
              item_name: "Tai nghe AirPods Pro",
              item_status: "NORMAL",
              price: 5990000,
              stock: 100,
            },
          ],
          total_count: 3,
        },
      };
    }

    const res = await axios.get(`${SHOPEE_API}/product/get_item_list`, {
      params: {
        shop_id: shopId,
        offset: 0,
        page_size: 50,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching Shopee products:", error);
    throw new Error("Không thể lấy danh sách sản phẩm từ Shopee");
  }
}
