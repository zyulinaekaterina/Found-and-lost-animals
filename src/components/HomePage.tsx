import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import axios from 'axios';
import { ImageWithFallback } from "./figma/ImageWithFallback";

// Добавляем токен ко всем запросам
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface Animal {
  id: number;
  name: string;
  type: string;
  status: string;
  color: string;
  location: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  is_superuser?: boolean; // Добавляем поле для админа
}

interface HomePageProps {
  onNavigate: (page: string) => void;
  user: User;
}

export function HomePage({ onNavigate, user }: HomePageProps) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyAnimals = async () => {
      try {
        const response = await axios.get('/api/animals/me');
        const data = response.data;
        setAnimals(data.animals || []); 
      } catch (err: any) {
        console.error('Ошибка загрузки животных:', err);
        const errorMessage = err.response?.data?.detail || err.message || 'Ошибка сети';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAnimals();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'lost') return { variant: 'destructive', text: 'ПОТЕРЯН' };
    if (status === 'found') return { variant: 'default' as const, text: 'НАЙДЕН' };
    return { variant: 'secondary' as const, text: status };
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'только что';
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'час' : diffHours < 5 ? 'часа' : 'часов'} назад`;
    return `${diffDays} ${diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней'} назад`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Кнопка админ-панели для суперпользователя */}
          {user.is_superuser && (
            <div className="absolute top-4 right-4 lg:top-8 lg:right-8">
              <Button 
                variant="outline" 
                onClick={() => onNavigate('admin')}
                className="bg-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Управление пользователями
              </Button>
            </div>
          )}

          <div className="flex justify-center mb-6">
            <svg className="h-16 w-16 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6 text-primary">
            Добро пожаловать, {user.name}!
            {user.is_superuser && (
              <span className="ml-4 text-lg bg-purple-100 text-purple-700 px-3 py-1 rounded-full inline-block align-middle">
                👑 Администратор
              </span>
            )}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Помогите потерянным питомцам найти дорогу домой. Загружайте фотографии найденных животных, 
            и наша система найдет наиболее похожих питомцев из базы данных.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => onNavigate('upload')}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
              Загрузить найденного питомца
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-3"
              onClick={() => onNavigate('search')}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              Найти похожих
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl text-center mb-12 text-primary">
            Как работает ПетПоиск
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardContent className="space-y-4">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" x2="12" y1="15" y2="3"/>
                  </svg>
                </div>
                <h3 className="text-xl">Загрузите фото</h3>
                <p className="text-muted-foreground">
                  Загрузите фотографии и детали о найденном питомце. 
                  Наша система создает подробные профили для лучшего сопоставления.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="space-y-4">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <h3 className="text-xl">Умный поиск</h3>
                <p className="text-muted-foreground">
                  Наша интеллектуальная система анализирует фотографии и находит 
                  похожих питомцев в базе данных по внешним признакам.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="space-y-4">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
                <h3 className="text-xl">Счастливые встречи</h3>
                <p className="text-muted-foreground">
                  Свяжитесь напрямую с владельцами питомцев для организации 
                  безопасной встречи и воссоединения семей.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Activity — YOUR ANIMALS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl text-primary">Мои объявления</h2>
            <Button variant="outline" onClick={() => onNavigate('upload')}>
              + Добавить
            </Button>
          </div>
          
          {loading ? (
            <p className="text-center py-8">Загрузка...</p>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded text-center">
              {error}
            </div>
          ) : animals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              У вас пока нет объявлений. 
              <Button variant="link" onClick={() => onNavigate('upload')} className="ml-2">
                Создать первое
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {animals.map((animal) => {
                const statusBadge = getStatusBadge(animal.status);
                return (
                  <Card 
                    key={animal.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => onNavigate(`animal/${animal.id}`)}
                  >
                    <div className="relative h-40">
                      <ImageWithFallback
                        src={`/api/animals/image/${animal.id}`}
                        alt={animal.name || 'Без имени'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">
                        {animal.name || 'Без имени'} ({animal.type === 'dog' ? 'Собака' : animal.type === 'cat' ? 'Кошка' : animal.type})
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>{animal.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        <span>{formatTimeAgo(animal.created_at)}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl mb-4">
            Каждый питомец заслуживает вернуться домой
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Присоединяйтесь к сообществу любителей животных, помогающих воссоединить семьи
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-3"
            onClick={() => onNavigate('upload')}
          >
            Начать сегодня
          </Button>
        </div>
      </section>
    </div>
  );
}