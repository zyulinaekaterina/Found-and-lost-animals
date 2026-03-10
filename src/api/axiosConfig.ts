// src/api/axiosConfig.ts
import axios from 'axios';

// Очередь запросов, которые ждут обновления токена
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Добавляем перехватчик для ответов
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и это не запрос на обновление токена
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url.includes('/auth/refresh') &&
        !originalRequest.url.includes('/auth/login') &&
        !originalRequest.url.includes('/auth/register')) {
      
      if (isRefreshing) {
        // Если уже идет обновление, добавляем запрос в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post('/api/auth/refresh', {
          refresh_token: refreshToken
        });

        const { access_token, refresh_token } = response.data;
        
        // Сохраняем новые токены
        localStorage.setItem('token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        // Обновляем заголовок для всех будущих запросов
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

        processQueue(null, access_token);
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Если не удалось обновить - очищаем токены и перенаправляем на вход
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        
        // Перенаправляем на страницу входа (перезагружаем страницу для сброса состояния)
        window.location.href = '/';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Добавляем токен к каждому запросу
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axios;