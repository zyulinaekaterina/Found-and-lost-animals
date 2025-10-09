import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./components/HomePage";
import { UploadPage } from "./components/UploadPage";
import { AnimalInfoPage } from "./components/AnimalInfoPage";
import { SimilarAnimalsPage } from "./components/SimilarAnimalsPage";
import { AuthPage } from "./components/AuthPage";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [user, setUser] = useState<User | null>(null);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} user={user} />;
      case 'upload':
        return <UploadPage onNavigate={handleNavigate} user={user} />;
      case 'info':
        return <AnimalInfoPage onNavigate={handleNavigate} user={user} />;
      case 'similar':
      case 'search':
        return <SimilarAnimalsPage onNavigate={handleNavigate} user={user} />;
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
      {renderCurrentPage()}
    </div>
  );
}