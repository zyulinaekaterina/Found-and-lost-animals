// AdminPanel.tsx
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import axios from 'axios';

// Типы данных для пользователя
interface User {
  id: number;
  email: string;
  name: string;
  is_superuser: boolean;
  is_active: boolean;
  created_at: string;
}

interface AdminPanelProps {
  onNavigate: (page: string) => void;
  user: User; // текущий пользователь (должен быть суперпользователем)
}

export function AdminPanel({ onNavigate, user }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Загрузка списка пользователей
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/users/');
      setUsers(response.data.users || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  };

  // Назначение/снятие прав суперпользователя
  const toggleSuperuser = async (targetUser: User) => {
    try {
      if (targetUser.is_superuser) {
        await axios.post(`/api/users/${targetUser.id}/remove-superuser`);
      } else {
        await axios.post(`/api/users/${targetUser.id}/make-superuser`);
      }
      // Обновляем список
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка при изменении прав');
    }
  };

  // Удаление пользователя
  const deleteUser = async (targetUser: User) => {
    if (targetUser.id === user.id) {
      alert('Нельзя удалить самого себя');
      return;
    }

    if (!window.confirm(`Вы уверены, что хотите удалить пользователя ${targetUser.name}?`)) {
      return;
    }

    try {
      await axios.delete(`/api/users/${targetUser.id}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка при удалении пользователя');
    }
  };

  // Фильтрация пользователей
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user.is_superuser) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h1>
          <p className="mb-6">У вас нет прав для просмотра этой страницы.</p>
          <Button onClick={() => onNavigate('home')}>
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Управление пользователями</h1>
          <Button variant="outline" onClick={() => onNavigate('home')}>
            ← На главную
          </Button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Всего пользователей</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Администраторов</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{users.filter(u => u.is_superuser).length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Активных</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{users.filter(u => u.is_active).length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Поиск */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Поиск по имени или email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Список пользователей */}
        {loading ? (
          <div className="text-center py-12">Загрузка...</div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">{error}</div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((u) => (
              <Card key={u.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{u.name}</h3>
                        {u.is_superuser && (
                          <Badge variant="default" className="bg-purple-600">Админ</Badge>
                        )}
                        {!u.is_active && (
                          <Badge variant="destructive">Заблокирован</Badge>
                        )}
                        {u.id === user.id && (
                          <Badge variant="outline">Это вы</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Зарегистрирован: {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      {/* Кнопка для назначения/снятия админа */}
                      <Button
                        variant={u.is_superuser ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleSuperuser(u)}
                        disabled={u.id === user.id} // Нельзя изменить свои права
                      >
                        {u.is_superuser ? 'Снять админа' : 'Сделать админом'}
                      </Button>

                      {/* Кнопка удаления (не для себя) */}
                      {u.id !== user.id && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteUser(u)}
                        >
                          Удалить
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Пользователи не найдены
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}