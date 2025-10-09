import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";

interface User {
  id: number;
  name: string;
  email: string;
}

interface UploadPageProps {
  onNavigate: (page: string) => void;
  user: User;
}

export function UploadPage({ onNavigate, user }: UploadPageProps) {
  const [formData, setFormData] = useState({
    petName: '',
    petType: '',
    breed: '',
    color: '',
    size: '',
    status: 'found', // По умолчанию "найден", так как это сайт для найденных питомцев
    location: '',
    date: '',
    description: '',
    contactName: user.name,
    contactPhone: '',
    contactEmail: user.email
  });

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Имитация обработки изображения
    setTimeout(() => {
      console.log('Форма отправлена:', formData);
      setIsProcessing(false);
      // Перенаправление на страницу с похожими животными
      onNavigate('similar');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-secondary/10 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-primary mb-4">
            Загрузить найденного питомца
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Загрузите фотографию найденного питомца и укажите детали. Наша система автоматически 
            найдет похожих животных в базе данных потерянных питомцев.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Pet Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" x2="12" y1="8" y2="12"/>
                  <line x1="12" x2="12.01" y1="16" y2="16"/>
                </svg>
                Информация о находке
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Статус питомца</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="found">Найден</SelectItem>
                      <SelectItem value="lost">Потерян</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Дата</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    placeholder="Когда это произошло?"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
                Фотография питомца
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img 
                        src={uploadedImage} 
                        alt="Загруженная фотография питомца" 
                        className="max-w-full h-64 object-cover mx-auto rounded-lg"
                      />
                      <Button variant="outline" onClick={() => setUploadedImage(null)}>
                        Изменить фото
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <svg className="h-12 w-12 text-muted-foreground mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" x2="12" y1="15" y2="3"/>
                      </svg>
                      <div>
                        <Label 
                          htmlFor="photo-upload" 
                          className="cursor-pointer inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                            <circle cx="12" cy="13" r="3"/>
                          </svg>
                          Загрузить фото
                        </Label>
                        <Input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Загрузите четкую фотографию питомца. JPG, PNG до 10МБ.
                      </p>
                    </div>
                  )}
                </div>
                
                <Alert>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" x2="12" y1="8" y2="12"/>
                    <line x1="12" x2="12.01" y1="16" y2="16"/>
                  </svg>
                  <AlertDescription>
                    Качественная фотография критически важна для идентификации. Постарайтесь включить морду питомца и отличительные признаки.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Pet Details */}
          <Card>
            <CardHeader>
              <CardTitle>Информация о питомце</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Кличка питомца (если известна)</Label>
                  <Input
                    value={formData.petName}
                    onChange={(e) => handleInputChange('petName', e.target.value)}
                    placeholder="например, Макс, Белла, Неизвестно"
                  />
                </div>
                <div>
                  <Label>Тип животного</Label>
                  <Select value={formData.petType} onValueChange={(value) => handleInputChange('petType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Собака</SelectItem>
                      <SelectItem value="cat">Кот</SelectItem>
                      <SelectItem value="bird">Птица</SelectItem>
                      <SelectItem value="rabbit">Кролик</SelectItem>
                      <SelectItem value="other">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Порода (если известна)</Label>
                  <Input
                    value={formData.breed}
                    onChange={(e) => handleInputChange('breed', e.target.value)}
                    placeholder="например, Золотистый ретривер, Метис"
                  />
                </div>
                <div>
                  <Label>Основной окрас</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="например, Рыжий, Черный, Серый"
                  />
                </div>
                <div>
                  <Label>Размер</Label>
                  <Select value={formData.size} onValueChange={(value) => handleInputChange('size', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите размер" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Маленький (до 11 кг)</SelectItem>
                      <SelectItem value="medium">Средний (11-27 кг)</SelectItem>
                      <SelectItem value="large">Большой (свыше 27 кг)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Описание</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Укажите дополнительные детали о внешности, поведении или обстоятельствах..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Информация о местоположении
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Место (где был найден/потерян питомец)</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="например, Центральный парк, ул. Ленина 123, Арбат"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Контактная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Ваше имя</Label>
                  <Input
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    placeholder="Полное имя"
                  />
                </div>
                <div>
                  <Label>Номер телефона</Label>
                  <Input
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    placeholder="+7 (999) 666-66-66"
                  />
                </div>
              </div>
              <div>
                <Label>Адрес электронной почты</Label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate('home')}
              disabled={isProcessing}
            >
              Отмена
            </Button>
            <Button type="submit" className="px-8" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Обработка изображения...
                </>
              ) : (
                'Найти похожих питомцев'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}