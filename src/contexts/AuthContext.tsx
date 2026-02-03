import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const AUTH_TOKEN_KEY = 'auth_token';

// Mock credentials for local development (JSON Server doesn't support auth)
const MOCK_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'forge2024',
};

// Detect if running in local dev mode (JSON Server)
const isLocalDev = API_BASE.includes('localhost:3001');

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    setIsAuthenticated(!!token);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Mock authentication for local development
      if (isLocalDev) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
          const mockToken = 'mock-jwt-token-' + Date.now();
          localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
          setIsAuthenticated(true);
          return true;
        }

        return false;
      }

      // Real authentication with AWS Lambda (production)
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error('Login failed:', response.status);
        return false;
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
