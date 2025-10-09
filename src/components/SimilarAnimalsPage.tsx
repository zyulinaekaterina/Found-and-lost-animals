import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { AnimalCard } from "./AnimalCard";

interface User {
  id: number;
  name: string;
  email: string;
}

interface SimilarAnimalsPageProps {
  onNavigate: (page: string) => void;
  user: User;
}

export function SimilarAnimalsPage({ onNavigate, user }: SimilarAnimalsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");

  // Демонстрационные данные похожих животных
  const similarAnimals = [
    {
      id: "1",
      name: "Макс",
      type: "dog" as const,
      status: "lost" as const,
      breed: "Золотистый ретривер",
      color: "Рыжий",
      location: "Центральный парк, Москва",
      dateReported: "15 янв, 2025",
      description: "Дружелюбный золотистый ретривер, любит играть в мяч. На нем красный ошейник с биркой.",
      imageUrl: "https://images.unsplash.com/photo-1754499265662-a1b9367c95f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwZ29sZGVuJTIwcmV0cmlldmVyJTIwZG9nfGVufDF8fHx8MTc1ODE4MTc2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      contactInfo: "+7 (999) 123-45-67"
    },
    {
      id: "2",
      name: "Луна",
      type: "cat" as const,
      status: "found" as const,
      breed: "Полосатая",
      color: "Рыжая",
      location: "Арбат, Москва",
      dateReported: "14 янв, 2025",
      description: "Милая полосатая кошка найдена возле набережной. Очень дружелюбная и ухоженная.",
      imageUrl: "https://images.unsplash.com/photo-1625192494235-21e8821040c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWJieSUyMGNhdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc1ODE2MTY0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      contactInfo: "+7 (999) 987-65-43"
    },
    {
      id: "3",
      name: "Бадди",
      type: "dog" as const,
      status: "lost" as const,
      breed: "Лабрадор-метис",
      color: "Коричневый",
      location: "Сокольники, Москва",
      dateReported: "13 янв, 2025",
      description: "Собака среднего размера коричневого лабрадора-метиса. Очень энергичный и дружелюбный.",
      imageUrl: "https://images.unsplash.com/photo-1531263939119-4022c6cf273b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwZG9nJTIwcG9zdGVyfGVufDF8fHx8MTc1ODEzNDk0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      contactInfo: "+7 (999) 456-78-90"
    },
    {
      id: "4",
      name: "Мило",
      type: "cat" as const,
      status: "found" as const,
      breed: "Персидская",
      color: "Белый",
      location: "Измайлово, Москва",
      dateReported: "12 янв, 2025",
      description: "Красивая белая персидская кошка найдена в жилом районе. Ухоженная и ласковая.",
      imageUrl: "https://images.unsplash.com/photo-1506199595715-82342b9198a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBldHMlMjBhbmltYWxzfGVufDF8fHx8MTc1ODIxNzAwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      contactInfo: "+7 (999) 321-09-87"
    },
    {
      id: "5",
      name: "Рокки",
      type: "dog" as const,
      status: "lost" as const,
      breed: "Немецкая овчарка",
      color: "Черно-рыжий",
      location: "Марьино, Москва",
      dateReported: "11 янв, 2025",
      description: "Крупная немецкая овчарка с характерными отметинами. Очень верный и защитный.",
      imageUrl: "https://images.unsplash.com/photo-1754499265662-a1b9367c95f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwZ29sZGVuJTIwcmV0cmlldmVyJTIwZG9nfGVufDF8fHx8MTc1ODE4MTc2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      contactInfo: "+7 (999) 654-32-10"
    },
    {
      id: "6",
      name: "Усик",
      type: "cat" as const,
      status: "found" as const,
      breed: "Мейн-кун",
      color: "Рыжий",
      location: "Бутово, Москва",
      dateReported: "10 янв, 2025",
      description: "Крупный рыжий мейн-кун. Очень пушистый и дружелюбный с характерным мяуканьем.",
      imageUrl: "https://images.unsplash.com/photo-1625192494235-21e8821040c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWJieSUyMGNhdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc1ODE2MTY0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      contactInfo: "+7 (999) 789-01-23"
    }
  ];

  // Фильтрация животных по критериям поиска
  const filteredAnimals = similarAnimals.filter(animal => {
    const matchesSearch = searchTerm === "" || 
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || animal.status === statusFilter;
    const matchesType = typeFilter === "all" || animal.type === typeFilter;
    const matchesLocation = locationFilter === "" || 
      animal.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesType && matchesLocation;
  });

  const handleViewDetails = (animalId: string) => {
    console.log('Просмотр деталей для:', animalId);
    onNavigate('info');
  };

  const handleContact = (animalId: string) => {
    const animal = similarAnimals.find(a => a.id === animalId);
    if (animal) {
      alert(`Контакт для ${animal.name}: ${animal.contactInfo}`);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl text-primary mb-2">
                Похожие животные найдены
              </h1>
              <p className="text-muted-foreground">
                {filteredAnimals.length} животных соответствуют вашим критериям поиска
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => onNavigate('upload')}
            >
              Добавить питомца
            </Button>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" x2="4" y1="21" y2="14"/>
                  <line x1="4" x2="4" y1="10" y2="3"/>
                  <line x1="12" x2="12" y1="21" y2="12"/>
                  <line x1="12" x2="12" y1="8" y2="3"/>
                  <line x1="20" x2="20" y1="21" y2="16"/>
                  <line x1="20" x2="20" y1="12" y2="3"/>
                  <line x1="1" x2="7" y1="14" y2="14"/>
                  <line x1="9" x2="15" y1="8" y2="8"/>
                  <line x1="17" x2="23" y1="16" y2="16"/>
                </svg>
                Поиск и фильтры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Поиск</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <Input
                      placeholder="Кличка, порода, описание..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Статус</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="lost">Только потерянные</SelectItem>
                      <SelectItem value="found">Только найденные</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Тип питомца</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы</SelectItem>
                      <SelectItem value="dog">Собаки</SelectItem>
                      <SelectItem value="cat">Кошки</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Местоположение</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <Input
                      placeholder="Район..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {filteredAnimals.filter(a => a.status === 'lost').length} Потерянных
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {filteredAnimals.filter(a => a.status === 'found').length} Найденных
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {filteredAnimals.filter(a => a.type === 'dog').length} Собак
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {filteredAnimals.filter(a => a.type === 'cat').length} Кошек
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v4"/>
              <path d="M16 2v4"/>
              <rect width="18" height="18" x="3" y="4" rx="2"/>
              <path d="M3 10h18"/>
            </svg>
            <span>Обновляется ежедневно</span>
          </div>
        </div>

        {/* Animal Grid */}
        {filteredAnimals.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAnimals.map((animal) => (
              <AnimalCard
                key={animal.id}
                id={animal.id}
                name={animal.name}
                type={animal.type}
                status={animal.status}
                breed={animal.breed}
                color={animal.color}
                location={animal.location}
                dateReported={animal.dateReported}
                description={animal.description}
                imageUrl={animal.imageUrl}
                contactInfo={animal.contactInfo}
                onViewDetails={() => handleViewDetails(animal.id)}
                onContact={() => handleContact(animal.id)}
                size="small"
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <svg className="h-16 w-16 text-muted-foreground mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <h3 className="text-xl mb-2">Животные не найдены</h3>
              <p className="text-muted-foreground mb-6">
                Попробуйте изменить фильтры поиска или проверьте позже новые объявления.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setLocationFilter("");
                }}>
                  Очистить фильтры
                </Button>
                <Button variant="outline" onClick={() => onNavigate('upload')}>
                  Добавить питомца
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination (placeholder) */}
        {filteredAnimals.length > 0 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Предыдущая
              </Button>
              <Button variant="default" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Следующая
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}