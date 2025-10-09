import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AnimalInfoPageProps {
  onNavigate: (page: string) => void;
  user: User;
}

export function AnimalInfoPage({ onNavigate, user }: AnimalInfoPageProps) {
  // Демонстрационные данные
  const animalData = {
    id: "pet-001",
    name: "Макс",
    type: "собака",
    breed: "Золотистый ретривер",
    color: "Рыжий",
    size: "Крупный",
    status: "lost",
    location: "Центральный парк, Москва",
    dateReported: "15 января 2025",
    lastSeen: "15 января 2025 в 15:00",
    description: "Макс - дружелюбный и энергичный золотистый ретривер, который любит играть в мяч. Когда пропал, на нем был красный ошейник с биркой. Он очень общительный с другими собаками и людьми. Макс откликается на свое имя и знает основные команды, такие как 'сидеть' и 'стоять'. У него есть небольшой шрам на левом ухе с детства.",
    imageUrl: "https://images.unsplash.com/photo-1754499265662-a1b9367c95f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwZ29sZGVuJTIwcmV0cmlldmVyJTIwZG9nfGVufDF8fHx8MTc1ODE4MTc2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    contact: {
      name: "Сара Иванова",
      phone: "+7 (999) 666 66 66",
      email: "sara.ivanova@email.com"
    },
    characteristics: [
      "Дружелюбен с детьми",
      "Ладит с другими собаками",
      "Откликается на имя",
      "Знает основные команды",
      "Есть микрочип"
    ],
    reward: "50000 руб"
  };

  const handleContact = () => {
    // В реальном приложении это откроет форму контакта или прямые сообщения
    alert(`Связаться с ${animalData.contact.name} по телефону ${animalData.contact.phone}`);
  };

  const handleShare = () => {
    // В реальном приложении это поделится ссылкой на объявление
    navigator.clipboard.writeText(window.location.href);
    alert('Ссылка на объявление скопирована в буфер обмена!');
  };

  return (
    <div className="min-h-screen bg-secondary/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => onNavigate('search')}
        >
          ← Назад к поиску
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <ImageWithFallback
                    src={animalData.imageUrl}
                    alt={`${animalData.status === 'lost' ? 'Потерянный' : 'Найденный'} ${animalData.type} по кличке ${animalData.name}`}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge 
                      variant={animalData.status === 'lost' ? 'destructive' : 'default'}
                      className="text-sm"
                    >
                      {animalData.status === 'lost' ? 'ПОТЕРЯН' : 'НАЙДЕН'}
                    </Badge>
                    <Badge variant="secondary" className="text-sm">
                      {animalData.type.charAt(0).toUpperCase() + animalData.type.slice(1)}
                    </Badge>
                  </div>
                  {animalData.reward && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="default" className="bg-green-600 text-sm">
                        Вознаграждение: {animalData.reward}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl mb-2">{animalData.name}</h1>
                      <p className="text-lg text-muted-foreground">
                        {animalData.breed} • {animalData.color} • {animalData.size}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleShare}>
                        <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                          <polyline points="16,6 12,2 8,6"/>
                          <line x1="12" x2="12" y1="2" y2="15"/>
                        </svg>
                        Поделиться
                      </Button>
                      <Button variant="outline" size="sm">
                        <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        Сохранить
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>{animalData.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 2v4"/>
                        <path d="M16 2v4"/>
                        <rect width="18" height="18" x="3" y="4" rx="2"/>
                        <path d="M3 10h18"/>
                      </svg>
                      <span>Сообщено: {animalData.dateReported}</span>
                    </div>
                  </div>

                  {animalData.status === 'lost' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 text-red-800 mb-2">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" x2="12" y1="8" y2="12"/>
                          <line x1="12" x2="12.01" y1="16" y2="16"/>
                        </svg>
                        <span className="font-medium">Последний раз видели</span>
                      </div>
                      <p className="text-red-700">{animalData.lastSeen}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="4" r="2"/>
                    <circle cx="18" cy="8" r="2"/>
                    <circle cx="13" cy="19" r="2"/>
                    <circle cx="6" cy="19" r="2"/>
                    <circle cx="20" cy="16" r="2"/>
                    <path d="m9 10 3 3 3-3"/>
                  </svg>
                  Описание
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {animalData.description}
                </p>
              </CardContent>
            </Card>

            {/* Characteristics */}
            <Card>
              <CardHeader>
                <CardTitle>Характеристики</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {animalData.characteristics.map((characteristic, index) => (
                    <Badge key={index} variant="secondary">
                      {characteristic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Контактная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium mb-2">{animalData.contact.name}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <span>{animalData.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                        <path d="m22 7-10 5L2 7"/>
                      </svg>
                      <span>{animalData.contact.email}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <Button className="w-full" onClick={handleContact}>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Связаться с владельцем
                </Button>
                
                <Button variant="outline" className="w-full">
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-10 5L2 7"/>
                  </svg>
                  Отправить сообщение
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" x2="12" y1="8" y2="12"/>
                    <line x1="12" x2="12.01" y1="16" y2="16"/>
                  </svg>
                  Советы по безопасности
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <p>• Встречайтесь в общественном, безопасном месте</p>
                  <p>• Приводите с собой друга на встречу</p>
                  <p>• Тщательно проверьте личность питомца</p>
                  <p>• Попросите документы подтверждающие владение</p>
                  <p>• Доверяйте своей интуиции</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  Последние активности
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="border-l-2 border-primary/20 pl-4 space-y-2">
                  <div>
                    <p className="font-medium">Объявление размещено</p>
                    <p className="text-muted-foreground">{animalData.dateReported}</p>
                  </div>
                  <div>
                    <p className="font-medium">Поделились 15 раз</p>
                    <p className="text-muted-foreground">Помогаем распространить информацию</p>
                  </div>
                  <div>
                    <p className="font-medium">3 потенциальных совпадения</p>
                    <p className="text-muted-foreground">Найдено в нашей базе данных</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Pets */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">Похожие питомцы в районе</h2>
            <Button 
              variant="outline"
              onClick={() => onNavigate('similar')}
            >
              Посмотреть все совпадения
            </Button>
          </div>
          
          <div className="text-center py-8 text-muted-foreground">
            <svg className="h-12 w-12 mx-auto mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="4" r="2"/>
              <circle cx="18" cy="8" r="2"/>
              <circle cx="13" cy="19" r="2"/>
              <circle cx="6" cy="19" r="2"/>
              <circle cx="20" cy="16" r="2"/>
              <path d="m9 10 3 3 3-3"/>
            </svg>
            <p>Здесь будут показаны похожие питомцы на основе местоположения и характеристик.</p>
          </div>
        </div>
      </div>
    </div>
  );
}