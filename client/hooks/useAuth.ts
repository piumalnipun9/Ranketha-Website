import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/cart-store';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    console.log("Auth check:", { token, userData });

    if (token && userData) {
      try {
        const parsedUser: User = JSON.parse(userData);
        setIsLoggedIn(true);
        setUser(parsedUser);
        
        // Sync cart when user is authenticated
        const cartStore = useCartStore.getState();
        cartStore.setAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        
        // Set cart as not authenticated
        const cartStore = useCartStore.getState();
        cartStore.setAuthenticated(false);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
      
      // Set cart as not authenticated
      const cartStore = useCartStore.getState();
      cartStore.setAuthenticated(false);
    }
    setLoading(false); // Set loading to false after checking localStorage
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    
    // Set cart as not authenticated on logout
    const cartStore = useCartStore.getState();
    cartStore.setAuthenticated(false);
    window.location.href = '/'; // Redirect to home page after logout
  };

  return {
    isLoggedIn,
    user,
    loading,
    logout,
  };
}
