import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  email: null,
  login: () => false,
  logout: () => {},
});

const STORAGE_KEY = 'zt-auth-session';

export function getStoredCredentials(): { email: string; password: string } {
  const stored = localStorage.getItem('zt-admin-creds');
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  return { email: 'zubkastechnology@gmail.com', password: 'Zubkas@2036' };
}

export function saveCredentials(email: string, password: string) {
  localStorage.setItem('zt-admin-creds', JSON.stringify({ email, password }));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem(STORAGE_KEY);
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setIsAuthenticated(true);
        setEmail(parsed.email);
      } catch { /* ignore */ }
    }
  }, []);

  const login = (inputEmail: string, inputPassword: string): boolean => {
    const creds = getStoredCredentials();
    if (inputEmail === creds.email && inputPassword === creds.password) {
      setIsAuthenticated(true);
      setEmail(inputEmail);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: inputEmail, ts: Date.now() }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setEmail(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, email, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
