import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  withCredentials: true, // Required to share and receive session cookies (JSESSIONID)
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
