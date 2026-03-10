import { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./components/HomePage";
import { UploadPage } from "./components/UploadPage";
import { AnimalInfoPage } from "./components/AnimalInfoPage";
import { SimilarAnimalsPage } from "./components/SimilarAnimalsPage";
import { AuthPage } from "./components/AuthPage";
import { AdminPanel } from "./components/AdminPanel";
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  is_superuser?: boolean;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
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
        // Пытаемся получить данные текущего пользователя
        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUser(response.data);
      } catch (error) {
        // Если токен невалидный - пробуем обновить
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post('/api/auth/refresh', {
              refresh_token: refreshToken
            });
            
            // Сохраняем новые токены
            localStorage.setItem('token', refreshResponse.data.access_token);
            localStorage.setItem('refresh_token', refreshResponse.data.refresh_token);
            
            // Получаем данные пользователя с новым токеном
            const userResponse = await axios.get('/api/auth/me', {
              headers: { Authorization: `Bearer ${refreshResponse.data.access_token}` }
            });
            
            setUser(userResponse.data);
          } catch (refreshError) {
            // Не удалось обновить - очищаем токены
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
          }
        } else {
          // Нет refresh токена - очищаем access token
          localStorage.removeItem('token');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleLogin = (userData: User, accessToken: string, refreshToken: string) => {
    console.log("handleLogin called with:", userData);
    setUser(userData);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        // Сообщаем серверу о выходе (опционально)
        await axios.post('/api/auth/logout', { refresh_token: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setCurrentPage('home');
    }
  };

  // Показываем загрузку, пока проверяем аутентификацию
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

  const renderCurrentPage = () => {
    if (currentPage.startsWith('animal/')) {
        const pathParts = currentPage.split('/');
        const animalId = pathParts[1];
        if (animalId) {
             return <AnimalInfoPage 
                        onNavigate={handleNavigate} 
                        user={user} 
                        animalId={animalId}
                     />;
        }
    }
    
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} user={user} />;
      case 'upload':
        return <UploadPage onNavigate={handleNavigate} user={user} />;
      case 'similar':
      case 'search':
        return <SimilarAnimalsPage onNavigate={handleNavigate} user={user} />;
      case 'admin':
        return <AdminPanel onNavigate={handleNavigate} user={user} />;
      default:
        return <HomePage onNavigate={handleNavigate} user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        user={user} 
        onLogout={handleLogout}
      />
      <main>
        {renderCurrentPage()}
      </main>
    </div>
  );
}