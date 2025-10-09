import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface User {
  id: number;
  name: string;
  email: string;
}

interface HomePageProps {
  onNavigate: (page: string) => void;
  user: User;
}

export function HomePage({ onNavigate, user }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <svg className="h-16 w-16 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6 text-primary">
            Добро пожаловать, {user.name}!
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
              Просмотреть питомцев
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

      {/* Recent Activity */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl text-center mb-12 text-primary">
            Последние объявления
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample Recent Posts */}
            <Card className="overflow-hidden">
              <div className="relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1754499265662-a1b9367c95f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwZ29sZGVuJTIwcmV0cmlldmVyJTIwZG9nfGVufDF8fHx8MTc1ODE4MTc2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Потерянный золотистый ретривер"
                  className="w-full h-40 object-cover"
                />
                <Badge className="absolute top-2 left-2" variant="destructive">
                  ПОТЕРЯН
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Золотистый ретривер - Макс</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>Центральный парк, Москва</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  <span>2 часа назад</span>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1625192494235-21e8821040c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWJieSUyMGNhdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc1ODE2MTY0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Найденная полосатая кошка"
                  className="w-full h-40 object-cover"
                />
                <Badge className="absolute top-2 left-2" variant="default">
                  НАЙДЕН
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Полосатая кошка</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>Арбат, Москва</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  <span>5 часов назад</span>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1506199595715-82342b9198a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBldHMlMjBhbmltYWxzfGVufDF8fHx8MTc1ODIxNzAwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Счастливое воссоединение"
                  className="w-full h-40 object-cover"
                />
                <Badge className="absolute top-2 left-2" variant="secondary">
                  ВОССОЕДИНЕНЫ
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">История успеха</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="m22 21-3-3"/>
                    <circle cx="19" cy="11" r="2"/>
                  </svg>
                  <span>Счастливая семья</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  <span>1 день назад</span>
                </div>
              </CardContent>
            </Card>
          </div>
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