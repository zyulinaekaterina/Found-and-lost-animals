import { useState, useEffect } from "react"; // Добавлен useEffect для потенциальной инициализации
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import axios from 'axios';
import { AnimalCard } from "./AnimalCard";

// Добавляем токен ко всем запросам
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Типы данных, возвращаемые с бэкенда (AnimalModel)
interface Animal {
  id: number;
  name: string;
  type: 'dog' | 'cat' | 'other';
  status: 'lost' | 'found';
  color: string;
  location: string;
  description: string;
  created_at: string; // ISO-строка даты
  breed?: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  image_url: string; 
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface SimilarAnimalsPageProps {
  onNavigate: (page: string) => void;
  user: User;
}

// Вспомогательная функция для форматирования даты
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
};

export function SimilarAnimalsPage({ onNavigate, user }: SimilarAnimalsPageProps) {
  // Состояние для загрузки файла
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  // Состояние для результатов поиска
  const [similarAnimals, setSimilarAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Состояние для фильтров
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Инициализация при монтировании: сразу загружаем общий список
  useEffect(() => {
    handleSearch(true); // Вызываем поиск при загрузке страницы, чтобы показать все объявления
  }, []);

  // Обновление превью при выборе файла
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadedFile(file);
    if (file) {
      setUploadedImagePreview(URL.createObjectURL(file));
    } else {
      setUploadedImagePreview(null);
    }
    setError(null);
  };

  // 1. Поиск по изображению
  const handleImageSearch = async () => {
    if (!uploadedFile) return; // Проверка на всякий случай

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      // POST запрос для поиска по изображению
      const response = await axios.post('/api/animals/search_similar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSimilarAnimals(response.data.animals || []);

    } catch (err: any) {
      console.error('Image Search error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Ошибка сети или сервера';
      setError(`Ошибка поиска по изображению: ${errorMessage}`);
      setSimilarAnimals([]);
    } finally {
      setLoading(false);
    }
  }

  // 2. Общий поиск (по умолчанию)
  const handleGeneralSearch = async () => {
    setLoading(true);
    setError(null);
    try {
        // GET запрос для получения всего списка (который мы будем фильтровать локально)
        const response = await axios.get('/api/animals/'); 
        setSimilarAnimals(response.data.animals || []);
    } catch (err: any) {
        console.error('General search error:', err);
        const errorMessage = err.response?.data?.detail || err.message || 'Ошибка сети или сервера';
        setError(`Ошибка загрузки списка животных: ${errorMessage}`);
        setSimilarAnimals([]);
    } finally {
        setLoading(false);
    }
  }

  // 3. Единый обработчик поиска
  const handleSearch = async (isInitialLoad = false) => {
    if (uploadedFile) {
        await handleImageSearch();
    } else {
        // Если нет файла, выполняем общий поиск.
        // Это также происходит при первой загрузке страницы.
        await handleGeneralSearch();
    }
  };

  // Локальная фильтрация результатов
  const filteredAnimals = similarAnimals.filter(animal => {
    if (statusFilter !== 'all' && animal.status !== statusFilter) return false;
    if (typeFilter !== 'all' && animal.type !== typeFilter) return false;
    return true;
  });


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Поиск животных (по фото или по каталогу)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          {/* Секция Загрузки */}
          <Card className="lg:col-span-1 h-fit sticky top-4">
            <CardHeader>
              <CardTitle>Поиск по изображению (опционально)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              {uploadedImagePreview ? (
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-2">
                  <img 
                    src={uploadedImagePreview} 
                    alt="Предпросмотр" 
                    className="w-full h-auto max-h-60 object-contain rounded-md"
                  />
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">
                  Нет выбранного изображения
                </div>
              )}

              <Button 
                onClick={() => handleSearch(false)} // Кнопка вызывает общий поиск, даже если нет фото
                className="w-full" 
                disabled={loading} // Теперь кнопка всегда активна, если нет загрузки
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Поиск...
                  </>
                ) : uploadedFile ? 'Найти похожих питомцев' : 'Обновить список / Искать'}
              </Button>
              
              {error && (
                <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Секция Результатов */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    {uploadedFile ? 'Результаты поиска по фото' : 'Объявления в каталоге'} ({filteredAnimals.length})
                </h2>
                <div className="flex gap-2">
                    {/* При изменении фильтров нужно обновить список, но сейчас мы фильтруем локально */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Статус" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все статусы</SelectItem>
                            <SelectItem value="lost">Потерян</SelectItem>
                            <SelectItem value="found">Найден</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Тип" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все типы</SelectItem>
                            <SelectItem value="dog">Собака</SelectItem>
                            <SelectItem value="cat">Кошка</SelectItem>
                            <SelectItem value="other">Другое</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading && <p className="text-center py-8">Идет загрузка объявлений...</p>}

            {!loading && similarAnimals.length === 0 && !error && (
              <Card className="text-center p-10">
                <CardContent className="space-y-4">
                  <h3 className="text-lg font-medium">Нет результатов</h3>
                  <p className="text-muted-foreground">
                    Пожалуйста, загрузите изображение для поиска или нажмите кнопку "Обновить список" для просмотра всего каталога.
                  </p>
                </CardContent>
              </Card>
            )}

            {!loading && filteredAnimals.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Использование AnimalCard для каждого результата */}
                {filteredAnimals.map((animal) => (
                  <AnimalCard 
                    key={animal.id}
                    id={String(animal.id)} 
                    name={animal.name || 'Не указано'}
                    type={animal.type}
                    status={animal.status}
                    breed={animal.breed || 'Не указана'}
                    color={animal.color}
                    location={animal.location}
                    dateReported={formatDate(animal.created_at)}
                    description={animal.description || 'Нет описания'}
                    imageUrl={`/api/animals/image/${animal.id}`} 
                    contactInfo={`Имя: ${animal.contact_name}, Email: ${animal.contact_email}`}
                    onViewDetails={() => onNavigate(`animal/${animal.id}`)}
                  />
                ))}
              </div>
            )}
            
            {!loading && similarAnimals.length > 0 && filteredAnimals.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Нет результатов, соответствующих выбранным фильтрам.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}