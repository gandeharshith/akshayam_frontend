export interface Category {
  _id: string;
  name: string;
  description: string;
  image_url?: string;
  order?: number;
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
  order?: number;
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
  _id?: string;
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

export interface OrderEditRequest {
  items: OrderItem[];
  user_info?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    password: string;
  };
}

export interface UserLogin {
  email: string;
  password: string;
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
  section?: string;
  title: string;
  content: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  _id: string;
  name: string;
  description: string;
  image_url?: string;
  pdf_url?: string;
  created_at: string;
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

export interface RecipeCreate {
  name: string;
  description: string;
}

export interface RecipeUpdate {
  name?: string;
  description?: string;
}

export interface OrderAnalytics {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
  period?: string; // For weekly/monthly grouping
  order_count?: number; // For time-based analytics
}

// Stock validation types
export interface StockValidationItem {
  product_id: string;
  quantity: number;
}

export interface StockValidationRequest {
  items: StockValidationItem[];
}

export interface StockValidationResponse {
  valid: boolean;
  message: string;
  invalid_items: StockValidationError[];
}

export interface StockValidationError {
  product_id: string;
  product_name?: string;
  requested_quantity: number;
  available_quantity: number;
  error: string;
}

// Enhanced order create response with error details
export interface OrderCreateError {
  message: string;
  errors: string[];
  invalid_items: StockValidationError[];
}
