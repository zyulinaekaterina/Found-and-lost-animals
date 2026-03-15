import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { AuthPage } from "./components/AuthPage";
import { Router } from "./Router";
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  is_superuser?: boolean;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Проверяем токен при загрузке приложения
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post('/api/auth/refresh', {
              refresh_token: refreshToken
            });
            localStorage.setItem('token', refreshResponse.data.access_token);
            localStorage.setItem('refresh_token', refreshResponse.data.refresh_token);
            const userResponse = await axios.get('/api/auth/me', {
              headers: { Authorization: `Bearer ${refreshResponse.data.access_token}` }
            });
            setUser(userResponse.data);
          } catch (refreshError) {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
          }
        } else {
          localStorage.removeItem('token');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: User, accessToken: string, refreshToken: string) => {
    setUser(userData);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await axios.post('/api/auth/logout', { refresh_token: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Navigation 
          user={user} 
          onLogout={handleLogout}
        />
        <main>
          <Router user={user} />
        </main>
      </div>
    </BrowserRouter>
  );
}