import axios from 'axios';

// base URL points to your Spring Boot backend
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
});

// REQUEST interceptor — adds JWT token to every request automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
            // automatically adds: Authorization: Bearer eyJhbG...
            // to every API call — no need to manually add token
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE interceptor — handles 401 (token expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response?.status === 401) {
            // token expired → clear storage → redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;