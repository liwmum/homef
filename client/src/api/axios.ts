import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Адрес твоего сервера
});

export default api;