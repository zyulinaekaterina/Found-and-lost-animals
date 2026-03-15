import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // <-- добавляем
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import axios from 'axios';

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
    type: 'dog' | 'cat' | 'other';
    status: 'lost' | 'found';
    color: string;
    size: 'small' | 'medium' | 'large';
    breed?: string;
    location: string;
    description: string;
    created_at: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    image_url: string;
    owner_id: number;
    is_active?: boolean;
    updated_at?: string;
    embedding?: number[];
}

interface User {
  id: number;
  name: string;
  email: string;
  is_superuser?: boolean;
}

interface AnimalInfoPageProps {
  user: User; // больше никаких onNavigate и animalId
}

const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return dateString;
    }
};

export function AnimalInfoPage({ user }: AnimalInfoPageProps) {
  const { id } = useParams(); // <-- получаем id из URL
  const navigate = useNavigate(); // <-- для навигации

  const [animalData, setAnimalData] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [editForm, setEditForm] = useState<Partial<Animal>>({});
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchAnimal = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/animals/${id}`);
        setAnimalData(response.data);
        setEditForm({
          name: response.data.name,
          type: response.data.type,
          status: response.data.status,
          color: response.data.color,
          size: response.data.size,
          breed: response.data.breed,
          location: response.data.location,
          description: response.data.description,
          contact_name: response.data.contact_name,
          contact_phone: response.data.contact_phone,
          contact_email: response.data.contact_email,
        });
      } catch (err: any) {
        console.error('Error fetching animal details:', err);
        setError(err.response?.data?.detail || 'Не удалось загрузить информацию.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnimal();
  }, [id]);

  const handleUpdateAnimal = async () => {
    if (!animalData || editing) return;
    
    const hasChanges = Object.keys(editForm).some(key => 
      editForm[key as keyof Animal] !== animalData[key as keyof Animal]
    );
    
    if (!hasChanges) {
      alert('Нет изменений для сохранения');
      setIsEditMode(false);
      return;
    }
    
    setEditing(true);
    try {
      const response = await axios.put(`/api/animals/${id}`, editForm);
      setAnimalData(response.data);
      setIsEditMode(false);
      alert('Объявление успешно обновлено!');
      setEditForm({
        name: response.data.name,
        type: response.data.type,
        status: response.data.status,
        color: response.data.color,
        size: response.data.size,
        breed: response.data.breed,
        location: response.data.location,
        description: response.data.description,
        contact_name: response.data.contact_name,
        contact_phone: response.data.contact_phone,
        contact_email: response.data.contact_email,
      });
    } catch (err: any) {
      let errorMessage = 'Не удалось обновить объявление';
      if (err.response?.status === 403) errorMessage = 'Нет прав';
      else if (err.response?.status === 404) errorMessage = 'Объявление не найдено';
      else if (err.response?.data?.detail) errorMessage = err.response.data.detail;
      alert(`Ошибка: ${errorMessage}`);
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteAnimal = async () => {
    if (!animalData || deleting) return;
    if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) return;

    setDeleting(true);
    try {
      await axios.delete(`/api/animals/${id}`);
      alert('Объявление успешно удалено!');
      navigate('/'); // <-- используем navigate
    } catch (err: any) {
      let errorMessage = 'Не удалось удалить объявление';
      if (err.response?.status === 403) errorMessage = 'Нет прав';
      else if (err.response?.status === 404) errorMessage = 'Объявление не найдено';
      else if (err.response?.data?.detail) errorMessage = err.response.data.detail;
      alert(`Ошибка: ${errorMessage}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (field: keyof Animal, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  if (animalData?.is_active === false) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Объявление удалено</h1>
          <p className="mb-6 text-muted-foreground">Это объявление было удалено владельцем.</p>
          <Button onClick={() => navigate('/')}>Вернуться на главную</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p>Загрузка информации...</p>
        </div>
      </div>
    );
  }

  if (error || !animalData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-xl font-bold text-red-600 mb-4">{error || "Животное не найдено."}</h1>
          <Button onClick={() => navigate('/')}>Вернуться на главную</Button>
        </div>
      </div>
    );
  }
  
  const statusBadge = animalData.status === 'lost' 
    ? { variant: 'destructive', text: 'Потерян' } 
    : { variant: 'default', text: 'Найден' };
  
  const isOwner = animalData.owner_id === user.id;
  const isSuperuser = user.is_superuser === true;
  const canModify = isOwner || isSuperuser;
  
  const imageUrl = `/api/animals/image/${animalData.id}`;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Назад к списку
          </Button>
          
          {canModify && (
            <div className="flex gap-2">
              {isEditMode ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditMode(false)} disabled={editing}>
                    Отмена
                  </Button>
                  <Button onClick={handleUpdateAnimal} disabled={editing}>
                    {editing ? 'Сохранение...' : 'Сохранить изменения'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditMode(true)}>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Редактировать
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteAnimal} disabled={deleting}>
                    {deleting ? 'Удаление...' : 'Удалить'}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Левая колонка с фото и деталями */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden">
              <div className="relative">
                <ImageWithFallback
                  src={imageUrl}
                  alt={`Фото ${animalData.name}`}
                  className="w-full h-96 object-cover"
                />
                <Badge variant={statusBadge.variant} className="absolute top-4 left-4 text-lg p-2">
                  {statusBadge.text}
                </Badge>
                {isSuperuser && !isOwner && (
                  <Badge variant="secondary" className="absolute top-4 right-4 text-lg p-2">
                    👑 Админ
                  </Badge>
                )}
              </div>

              <CardContent className="p-6">
                {isEditMode ? (
                  // Форма редактирования (оставляем как есть)
                  <div className="space-y-4">
                    {/* ... форма редактирования (без изменений) ... */}
                  </div>
                ) : (
                  // Режим просмотра
                  <>
                    <h1 className="text-3xl font-bold mb-4">
                        {animalData.name || 'Неизвестно'} ({animalData.type})
                    </h1>
                    <div className="grid grid-cols-2 gap-y-3 mb-6 text-sm">
                      <div className="font-medium">Порода:</div> <div>{animalData.breed || 'Не указана'}</div>
                      <div className="font-medium">Цвет:</div> <div>{animalData.color}</div>
                      <div className="font-medium">Размер:</div> <div>{animalData.size}</div>
                      <div className="font-medium">Последнее место:</div> <div>{animalData.location}</div>
                      <div className="font-medium">Дата сообщения:</div> <div>{formatDate(animalData.created_at)}</div>
                      {animalData.updated_at && animalData.updated_at !== animalData.created_at && (
                        <>
                          <div className="font-medium">Обновлено:</div> <div>{formatDate(animalData.updated_at)}</div>
                        </>
                      )}
                    </div>
                    <Separator className="my-4" />
                    <h2 className="text-xl font-semibold mb-3">Подробности и описание</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {animalData.description || 'Описание не предоставлено.'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Правая колонка с контактами и статистикой */}
          <div className="lg:col-span-1 space-y-8">
            {!isEditMode && (
              <Card>
                <CardHeader>
                  <CardTitle>Контактная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <p className="font-medium">{animalData.contact_name}</p>
                    <p className="text-sm text-muted-foreground">{animalData.contact_email}</p>
                    {animalData.contact_phone && (
                      <p className="text-sm text-muted-foreground">{animalData.contact_phone}</p>
                    )}
                  </div>
                  <Button className="w-full">Связаться с владельцем</Button>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Статистика объявления</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">120 просмотров</p>
                    <p className="text-sm text-muted-foreground">Помогаем распространить информацию</p>
                  </div>
                  <div>
                    <p className="font-medium">3 потенциальных совпадения</p>
                    <p className="text-sm text-muted-foreground">Найдено в нашей базе данных</p>
                  </div>
                  {canModify && (
                    <div className="pt-3 border-t">
                      {isSuperuser && !isOwner && (
                        <p className="text-sm font-medium text-purple-600">👑 Вы администратор</p>
                      )}
                      {isOwner && (
                        <p className="text-sm font-medium text-green-600">Вы владелец этого объявления</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {isEditMode ? 'Режим редактирования активен' : 'Можете редактировать или удалить это объявление'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}