import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import axios from 'axios';
import { AnimalCard } from "./AnimalCard";

interface Animal {
  id: number;
  name: string;
  type: 'dog' | 'cat' | 'other';
  status: 'lost' | 'found';
  color: string;
  location: string;
  description: string;
  created_at: string;
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
  user: User;
}

interface PaginationData {
  total: number;
  page: number;
  size: number;
  pages: number;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
};

export function SimilarAnimalsPage({ user }: SimilarAnimalsPageProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Состояние для загрузки файла
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  // Состояние для результатов поиска
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Состояние для пагинации
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    size: 10,
    pages: 1
  });

  // Состояние для фильтров (инициализируем из URL)
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    type: searchParams.get('type') || 'all',
    location: searchParams.get('location') || '',
    sort_order: searchParams.get('sort_order') || 'desc', // desc = новые сначала, asc = старые сначала
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 10
  });

  // Загрузка данных при изменении фильтров
  useEffect(() => {
    // Обновляем URL при изменении фильтров
    const params = new URLSearchParams();
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.type !== 'all') params.set('type', filters.type);
    if (filters.location) params.set('location', filters.location);
    if (filters.sort_order !== 'desc') params.set('sort_order', filters.sort_order);
    if (filters.page > 1) params.set('page', filters.page.toString());
    if (filters.limit !== 10) params.set('limit', filters.limit.toString());
    
    setSearchParams(params, { replace: true });
    
    // Загружаем данные с сервера
    fetchAnimals();
  }, [filters.status, filters.type, filters.location, filters.sort_order, filters.page, filters.limit]);

  // Загрузка данных с сервера с пагинацией, фильтрацией и сортировкой
  const fetchAnimals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.set('skip', ((filters.page - 1) * filters.limit).toString());
      params.set('limit', filters.limit.toString());
      params.set('sort_order', filters.sort_order); // <-- параметр сортировки
      
      if (filters.status !== 'all') params.set('status', filters.status);
      if (filters.type !== 'all') params.set('type', filters.type);
      if (filters.location) params.set('location', filters.location);
      
      const response = await axios.get(`/api/animals/?${params.toString()}`);
      
      setAnimals(response.data.animals || []);
      setPagination({
        total: response.data.total,
        page: filters.page,
        size: filters.limit,
        pages: Math.ceil(response.data.total / filters.limit)
      });
    } catch (err: any) {
      console.error('Error fetching animals:', err);
      setError(err.response?.data?.detail || 'Ошибка загрузки данных');
      setAnimals([]);
    } finally {
      setLoading(false);
    }
  };

  // Поиск по изображению
  const handleImageSearch = async () => {
    if (!uploadedFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await axios.post('/api/animals/search_similar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnimals(response.data.animals || []);
      setPagination({
        total: response.data.animals?.length || 0,
        page: 1,
        size: response.data.animals?.length || 0,
        pages: 1
      });
    } catch (err: any) {
      console.error('Image Search error:', err);
      setError(`Ошибка поиска по изображению: ${err.response?.data?.detail || err.message}`);
      setAnimals([]);
    } finally {
      setLoading(false);
    }
  };

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

  // Обработчик поиска
  const handleSearch = async () => {
    if (uploadedFile) {
      await handleImageSearch();
    } else {
      setFilters(prev => ({ ...prev, page: 1 }));
    }
  };

  // Обработчики изменения фильтров
  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value, page: 1 }));
  };

  const handleTypeChange = (value: string) => {
    setFilters(prev => ({ ...prev, type: value, page: 1 }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, location: e.target.value, page: 1 }));
  };

  const handleSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, sort_order: value, page: 1 }));
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }));
  };

  // Навигация по страницам
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const showImageSearchResults = !!uploadedFile;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Поиск животных {showImageSearchResults ? 'по фото' : 'в каталоге'}
        </h1>

        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          {/* Секция Загрузки */}
          <Card className="lg:col-span-1 h-fit sticky top-4">
            <CardHeader>
              <CardTitle>Поиск по изображению</CardTitle>
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
                onClick={handleSearch}
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Поиск...
                  </>
                ) : uploadedFile ? 'Найти похожих питомцев' : 'Применить фильтры'}
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
            {/* Фильтры (не показываем при поиске по фото) */}
            {!showImageSearchResults && (
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Статус</label>
                    <Select value={filters.status} onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все статусы</SelectItem>
                        <SelectItem value="lost">Потерян</SelectItem>
                        <SelectItem value="found">Найден</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Тип</label>
                    <Select value={filters.type} onValueChange={handleTypeChange}>
                      <SelectTrigger>
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
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Местоположение</label>
                    <Input
                      type="text"
                      placeholder="Город или район"
                      value={filters.location}
                      onChange={handleLocationChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Сортировка</label>
                    <Select value={filters.sort_order} onValueChange={handleSortChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Сортировка" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Сначала новые</SelectItem>
                        <SelectItem value="asc">Сначала старые</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">На странице</label>
                    <select
                      value={filters.limit}
                      onChange={handleLimitChange}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Заголовок и количество результатов */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {showImageSearchResults 
                  ? `Результаты поиска по фото (${animals.length})`
                  : `Найдено объявлений: ${pagination.total}`
                }
              </h2>
            </div>

            {/* Результаты */}
            {loading && <p className="text-center py-8">Загрузка...</p>}

            {!loading && animals.length === 0 && !error && (
              <Card className="text-center p-10">
                <CardContent className="space-y-4">
                  <h3 className="text-lg font-medium">Ничего не найдено</h3>
                  <p className="text-muted-foreground">
                    {showImageSearchResults
                      ? 'Попробуйте загрузить другое изображение'
                      : 'Попробуйте изменить параметры фильтрации'
                    }
                  </p>
                </CardContent>
              </Card>
            )}

            {!loading && animals.length > 0 && (
              <>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  {animals.map((animal) => (
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
                      onViewDetails={() => navigate(`/animal/${animal.id}`)}
                    />
                  ))}
                </div>

                {/* Пагинация (только для обычного поиска) */}
                {!showImageSearchResults && pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => goToPage(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      ← Назад
                    </Button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={pagination.page === pageNum ? 'default' : 'outline'}
                            onClick={() => goToPage(pageNum)}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => goToPage(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Вперед →
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}