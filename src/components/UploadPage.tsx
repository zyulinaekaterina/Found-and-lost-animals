import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // <-- добавлен импорт
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import axios from 'axios';

// Добавляем токен ко всем запросам
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface User {
  id: number;
  name: string;
  email: string;
}

interface UploadPageProps {
  user: User; // onNavigate удалён
}

interface FormDataState {
  petName: string;
  petType: 'dog' | 'cat' | 'other' | '';
  breed: string;
  color: string;
  size: 'small' | 'medium' | 'large' | '';
  status: 'lost' | 'found';
  location: string;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

export function UploadPage({ user }: UploadPageProps) {
  const navigate = useNavigate(); // <-- хук для навигации

  // Инициализация данных с использованием данных пользователя по умолчанию
  const [formData, setFormData] = useState<FormDataState>({
    petName: '',
    petType: '',
    breed: '',
    color: '',
    size: '',
    status: 'found',
    location: '',
    description: '',
    contactName: user.name,
    contactPhone: '',
    contactEmail: user.email
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Универсальный обработчик для текстовых полей
  const handleInputChange = useCallback((name: keyof FormDataState, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Обработчик для выбора файла
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadedFile(file);
    if (file) {
      setUploadedImagePreview(URL.createObjectURL(file));
    } else {
      setUploadedImagePreview(null);
    }
  };

  // --- КЛЮЧЕВАЯ ФУНКЦИЯ: Отправка данных с файлом ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedFile) {
      setError("Пожалуйста, загрузите фотографию питомца.");
      return;
    }
    if (!formData.petName || !formData.petType || !formData.size || !formData.location || !formData.contactName || !formData.contactEmail) {
        setError("Пожалуйста, заполните все обязательные поля.");
        return;
    }

    setIsProcessing(true);
    setError(null);

    // 1. Создаем объект FormData для отправки
    const data = new FormData();
    
    // 2. Добавляем файл
    data.append('file', uploadedFile); 
    
    // 3. Добавляем все остальные текстовые поля (должны совпадать с аргументами FastAPI)
    data.append('name', formData.petName);
    data.append('type', formData.petType);
    data.append('status', formData.status);
    data.append('breed', formData.breed);
    data.append('color', formData.color);
    data.append('size', formData.size);
    data.append('location', formData.location);
    data.append('description', formData.description);
    data.append('contact_name', formData.contactName);
    data.append('contact_phone', formData.contactPhone);
    data.append('contact_email', formData.contactEmail);


    try {
      // Отправляем FormData на маршрут POST /api/animals/
      // Axios автоматически установит Content-Type: multipart/form-data
      await axios.post('/api/animals/', data);

      alert("Объявление успешно добавлено!");
      navigate('/'); // <-- изменено: перенаправляем на главную

    } catch (err: any) {
      console.error('Upload error:', err.response || err);
      const detail = err.response?.data?.detail || 'Неизвестная ошибка сервера.';
      setError(`Ошибка при добавлении: ${detail}`);
    } finally {
      setIsProcessing(false);
    }
  };
  // --- КОНЕЦ КЛЮЧЕВОЙ ФУНКЦИИ ---


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Разместить объявление о пропаже или находке
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. Секция ФОТОГРАФИЯ */}
          <Card>
            <CardHeader>
              <CardTitle>1. Фотография питомца</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Загрузить фото *</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              {uploadedImagePreview && (
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-2">
                  <img 
                    src={uploadedImagePreview} 
                    alt="Предпросмотр" 
                    className="w-full h-auto max-h-60 object-contain rounded-md"
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* 2. Секция ОСНОВНАЯ ИНФОРМАЦИЯ */}
          <Card>
            <CardHeader>
              <CardTitle>2. Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <Label htmlFor="petName">Кличка (если известна) *</Label>
                <Input
                  id="petName"
                  value={formData.petName}
                  onChange={(e) => handleInputChange('petName', e.target.value)}
                  placeholder="Макс, Рыжик, ... (или Неизвестна)"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="petType">Тип животного *</Label>
                <Select
                    value={formData.petType}
                    onValueChange={(value: 'dog' | 'cat' | 'other') => handleInputChange('petType', value)}
                    required
                >
                    <SelectTrigger id="petType">
                        <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="dog">Собака</SelectItem>
                        <SelectItem value="cat">Кошка</SelectItem>
                        <SelectItem value="other">Другое</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breed">Порода</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => handleInputChange('breed', e.target.value)}
                  placeholder="Например: Лабрадор, Мейн-кун"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Основной цвет *</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="Например: Черный, Трехцветный"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Размер *</Label>
                <Select
                    value={formData.size}
                    onValueChange={(value: 'small' | 'medium' | 'large') => handleInputChange('size', value)}
                    required
                >
                    <SelectTrigger id="size">
                        <SelectValue placeholder="Выберите размер" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="small">Маленький (до 5 кг)</SelectItem>
                        <SelectItem value="medium">Средний (5-20 кг)</SelectItem>
                        <SelectItem value="large">Крупный (более 20 кг)</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Статус *</Label>
                <Select
                    value={formData.status}
                    onValueChange={(value: 'lost' | 'found') => handleInputChange('status', value)}
                    required
                >
                    <SelectTrigger id="status">
                        <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="lost">Потерян</SelectItem>
                        <SelectItem value="found">Найден</SelectItem>
                    </SelectContent>
                </Select>
              </div>

            </CardContent>
          </Card>

          {/* 3. Секция ЛОКАЦИЯ И ОПИСАНИЕ */}
          <Card>
            <CardHeader>
              <CardTitle>3. Локация и описание</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="location">Место пропажи/находки *</Label>
                    <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Улица, район, город"
                        required
                    />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="description">Описание и приметы</Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Особые приметы (ошейник, шрамы, поведение) и детали случившегося."
                        rows={4}
                    />
                </div>
            </CardContent>
          </Card>

          {/* 4. Секция КОНТАКТЫ */}
          <Card>
            <CardHeader>
              <CardTitle>4. Контактная информация</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactName">Ваше имя *</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="Ваше имя"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Телефон (для связи)</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="+7 (999) 999-99-99"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')} // <-- изменено
              disabled={isProcessing}
            >
              Отмена
            </Button>
            <Button type="submit" className="px-8" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Обработка...
                </>
              ) : 'Опубликовать объявление'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}