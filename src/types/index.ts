export interface Category {
  _id: string;
  name: string;
  description: string;
  image_url?: string;
  created_at: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category_id: string;
  price: number;
  quantity: number;
  image_url?: string;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  _id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_address: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Content {
  _id: string;
  page: string;
  title: string;
  content: string;
  logo_url?: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AdminUser {
  username: string;
  email: string;
  token: string;
}

// API Request/Response types
export interface CategoryCreate {
  name: string;
  description?: string;
}

export interface ProductCreate {
  name: string;
  description?: string;
  category_id: string;
  price: number;
  quantity: number;
}

export interface OrderCreate {
  user_info: User;
  items: OrderItem[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ContentUpdate {
  title?: string;
  content?: string;
}

export interface OrderAnalytics {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}
