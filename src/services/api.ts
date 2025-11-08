import axios from 'axios';
import {
  Category,
  Product,
  Order,
  Content,
  CategoryCreate,
  ProductCreate,
  OrderCreate,
  LoginRequest,
  LoginResponse,
  ContentUpdate,
  OrderAnalytics
} from '../types';

const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/admin/login', credentials);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('admin_token');
  }
};

// Categories API
export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  create: async (category: CategoryCreate): Promise<Category> => {
    const response = await api.post('/admin/categories', category);
    return response.data;
  },
  
  update: async (id: string, category: Partial<CategoryCreate>): Promise<Category> => {
    const response = await api.put(`/admin/categories/${id}`, category);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/categories/${id}`);
  },
  
  uploadImage: async (id: string, file: File): Promise<{url: string}> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/admin/categories/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Products API
export const productsAPI = {
  getAll: async (categoryId?: string): Promise<Product[]> => {
    const url = categoryId ? `/products?category_id=${categoryId}` : '/products';
    const response = await api.get(url);
    return response.data;
  },
  
  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (product: ProductCreate): Promise<Product> => {
    const response = await api.post('/admin/products', product);
    return response.data;
  },
  
  update: async (id: string, product: Partial<ProductCreate>): Promise<Product> => {
    const response = await api.put(`/admin/products/${id}`, product);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/products/${id}`);
  },
  
  uploadImage: async (id: string, file: File): Promise<{url: string}> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/admin/products/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Orders API
export const ordersAPI = {
  create: async (order: OrderCreate): Promise<Order> => {
    const response = await api.post('/orders', order);
    return response.data;
  },
  
  getUserOrders: async (email: string, password: string): Promise<Order[]> => {
    const response = await api.post('/orders/user', { email, password });
    return response.data;
  },
  
  getAll: async (): Promise<Order[]> => {
    const response = await api.get('/admin/orders');
    return response.data;
  },
  
  updateStatus: async (id: string, status: string): Promise<Order> => {
    const response = await api.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/orders/${id}`);
  },
  
  getAnalytics: async (): Promise<OrderAnalytics[]> => {
    const response = await api.get('/admin/orders/analytics');
    return response.data;
  }
};

// Content API
export const contentAPI = {
  get: async (page: string): Promise<Content> => {
    const response = await api.get(`/content/${page}`);
    return response.data;
  },
  
  getAll: async (): Promise<Content[]> => {
    const response = await api.get('/content');
    return response.data;
  },
  
  getSection: async (page: string, section: string): Promise<Content> => {
    const response = await api.get(`/content/${page}/${section}`);
    return response.data;
  },
  
  create: async (content: {
    page: string;
    section: string;
    title: string;
    content: string;
    order?: number;
  }): Promise<Content> => {
    const response = await api.post('/admin/content', content);
    return response.data;
  },
  
  update: async (page: string, content: ContentUpdate): Promise<Content> => {
    const response = await api.put(`/admin/content/${page}`, content);
    return response.data;
  },
  
  updateById: async (id: string, content: ContentUpdate): Promise<Content> => {
    const response = await api.put(`/admin/content/${id}`, content);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/content/${id}`);
  },
  
  uploadLogo: async (page: string, file: File): Promise<{url: string}> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/admin/content/${page}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Contact Info API
export const contactAPI = {
  get: async (): Promise<{
    _id?: string;
    company_name: string;
    company_description: string;
    email: string;
    phone: string;
    address: string;
    updated_at?: string;
  }> => {
    const response = await api.get('/contact-info');
    return response.data;
  },
  
  update: async (contactInfo: {
    company_name?: string;
    company_description?: string;
    email?: string;
    phone?: string;
    address?: string;
  }): Promise<{
    _id?: string;
    company_name: string;
    company_description: string;
    email: string;
    phone: string;
    address: string;
    updated_at?: string;
  }> => {
    const response = await api.put('/admin/contact-info', contactInfo);
    return response.data;
  }
};

// File Upload API
export const uploadAPI = {
  uploadFile: async (file: File): Promise<{filename: string, url: string}> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default api;
