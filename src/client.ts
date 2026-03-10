import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Базовый клиент для запросов к API
});

// Перехватчик: добавляет токен ко всем запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Перехватчик ответов: обрабатывает 401 и обновляет токен
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и запрос ещё не повторялся
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Обновляем токены
        const response = await axios.post('/api/auth/refresh', { refresh_token: refreshToken });
        const { access_token, refresh_token: newRefreshToken } = response.data;

        // Сохраняем новые токены
        localStorage.setItem('token', access_token);
        localStorage.setItem('refresh_token', newRefreshToken);

        // Повторяем исходный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Очищаем токены и перенаправляем на логин
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/'; // или window.location.reload();
      }
    }

    return Promise.reject(error);
  }
);

export default api;