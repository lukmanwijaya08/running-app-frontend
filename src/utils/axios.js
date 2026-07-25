import axios from 'axios';

const axiosInstance = axios.create({
  // Sesuaikan dengan port Laragon Anda, default biasanya port 8000
  baseURL: 'http://localhost:8000/api', 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor untuk menyisipkan Bearer Token otomatis
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;