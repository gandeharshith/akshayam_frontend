import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { systemSettingsAPI } from '../services/api';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  minOrderValue: number;
  notification: {
    open: boolean;
    message: string;
  };
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SHOW_NOTIFICATION'; payload: string }
  | { type: 'HIDE_NOTIFICATION' }
  | { type: 'SET_MIN_ORDER_VALUE'; payload: number };

interface CartContextType extends CartState {
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  hideNotification: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.product._id === action.payload._id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product._id === action.payload._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          ...calculateCartState(updatedItems, state.minOrderValue),
          notification: {
            open: true,
            message: `${action.payload.name} added to cart successfully!`
          }
        };
      } else {
        const newItem: CartItem = {
          product: action.payload,
          quantity: 1
        };
        return {
          ...calculateCartState([...state.items, newItem], state.minOrderValue),
          notification: {
            open: true,
            message: `${action.payload.name} added to cart successfully!`
          }
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(item => item.product._id !== action.payload);
      return {
        ...calculateCartState(filteredItems, state.minOrderValue),
        notification: state.notification
      };
    }
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        const filteredItems = state.items.filter(item => item.product._id !== action.payload.productId);
        return {
          ...calculateCartState(filteredItems, state.minOrderValue),
          notification: state.notification
        };
      }
      
      const updatedItems = state.items.map(item =>
        item.product._id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...calculateCartState(updatedItems, state.minOrderValue),
        notification: state.notification
      };
    }
    
    case 'CLEAR_CART':
      return { 
        items: [], 
        total: 0, 
        itemCount: 0,
        minOrderValue: state.minOrderValue,
        notification: { open: false, message: '' }
      };
    
    case 'SHOW_NOTIFICATION':
      return {
        ...state,
        notification: {
          open: true,
          message: action.payload
        }
      };
    
    case 'HIDE_NOTIFICATION':
      return {
        ...state,
        notification: {
          open: false,
          message: ''
        }
      };
    
    case 'SET_MIN_ORDER_VALUE':
      return {
        ...state,
        minOrderValue: action.payload
      };
    
    default:
      return state;
  }
};

const calculateCartState = (items: CartItem[], minOrderValue: number) => {
  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { items, total, itemCount, minOrderValue };
};

// Helper functions for localStorage
const CART_STORAGE_KEY = 'akshayam_cart';

const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
  }
  return [];
};

const getInitialState = (): CartState => {
  const storedItems = loadCartFromStorage();
  return {
    ...calculateCartState(storedItems, 500), // Default minimum order value
    notification: { open: false, message: '' }
  };
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, getInitialState());

  // Fetch minimum order value from backend on mount
  useEffect(() => {
    const fetchMinOrderValue = async () => {
      try {
        const minOrderSetting = await systemSettingsAPI.get('minimum_order_value');
        dispatch({ type: 'SET_MIN_ORDER_VALUE', payload: minOrderSetting.value || 500 });
      } catch (err) {
        console.error('Error fetching minimum order value:', err);
        // Keep default value of 500 if fetch fails
        dispatch({ type: 'SET_MIN_ORDER_VALUE', payload: 500 });
      }
    };

    fetchMinOrderValue();
  }, []);

  // Save to localStorage whenever cart state changes
  useEffect(() => {
    saveCartToStorage(state.items);
  }, [state.items]);

  // Auto-hide notification after 2 seconds
  useEffect(() => {
    if (state.notification.open) {
      const timer = setTimeout(() => {
        dispatch({ type: 'HIDE_NOTIFICATION' });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [state.notification.open]);

  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const hideNotification = () => {
    dispatch({ type: 'HIDE_NOTIFICATION' });
  };

  const contextValue: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    hideNotification
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
