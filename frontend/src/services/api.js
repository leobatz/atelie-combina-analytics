import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000'
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/login');

        // Só redireciona se for 401 em outras rotas (ex: token expirado enquanto navega)
        if (error.response?.status === 401 && !isLoginRequest) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api