import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ordersAPI } from '../services/api';
import { Order } from '../types';

const SESSION_KEY = 'akshayam_user_session';
// 3 months in milliseconds
const SESSION_DURATION_MS = 3 * 30 * 24 * 60 * 60 * 1000;

interface UserSession {
  email: string;
  password: string; // stored to re-fetch orders; hashed on server side
  expiresAt: number; // timestamp
}

interface UserAuthContextType {
  isLoggedIn: boolean;
  userEmail: string | null;
  userPassword: string | null;  // exposed so other pages can reuse session credentials
  orders: Order[];
  ordersLoading: boolean;
  ordersError: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshOrders: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed: UserSession = JSON.parse(raw);
        if (parsed.expiresAt > Date.now()) {
          setSession(parsed);
        } else {
          // Session expired — clear it
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  // Auto-fetch orders whenever session is set
  const fetchOrders = useCallback(async (email: string, password: string) => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const data = await ordersAPI.getUserOrders(email, password);
      setOrders(data);
    } catch {
      setOrdersError('Failed to load orders. Please try again.');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchOrders(session.email, session.password);
    } else {
      setOrders([]);
    }
  }, [session, fetchOrders]);

  const login = async (email: string, password: string) => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const data = await ordersAPI.getUserOrders(email, password);
      const newSession: UserSession = {
        email,
        password,
        expiresAt: Date.now() + SESSION_DURATION_MS,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      setSession(newSession);
      setOrders(data);
    } catch {
      throw new Error('Invalid credentials or no orders found.');
    } finally {
      setOrdersLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setOrders([]);
    setOrdersError('');
  };

  const refreshOrders = async () => {
    if (session) {
      await fetchOrders(session.email, session.password);
    }
  };

  return (
    <UserAuthContext.Provider
      value={{
        isLoggedIn: !!session,
        userEmail: session?.email ?? null,
        userPassword: session?.password ?? null,
        orders,
        ordersLoading,
        ordersError,
        login,
        logout,
        refreshOrders,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = (): UserAuthContextType => {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider');
  return ctx;
};
