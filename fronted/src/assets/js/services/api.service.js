class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('token');
    }

    async request(endpoint, method = 'GET', data = null, requiresAuth = true) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
        };

        if (requiresAuth) {
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                throw new Error('No autenticado');
            }
        }

        const config = {
            method,
            headers,
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Error en la solicitud');
            }

            return responseData;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async get(endpoint, requiresAuth = true) {
        return this.request(endpoint, 'GET', null, requiresAuth);
    }

    async post(endpoint, data, requiresAuth = true) {
        return this.request(endpoint, 'POST', data, requiresAuth);
    }

    async put(endpoint, data, requiresAuth = true) {
        return this.request(endpoint, 'PUT', data, requiresAuth);
    }

    async delete(endpoint, requiresAuth = true) {
        return this.request(endpoint, 'DELETE', null, requiresAuth);
    }

    // Métodos específicos para autenticación
    async login(email, password) {
        const data = await this.post('/auth/login', { email, password }, false);
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            this.token = data.token;
        }
        return data;
    }

    async register(userData) {
        return this.post('/auth/register', userData, false);
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        this.token = null;
        window.location.href = '/';
    }

    getAuthToken() {
        return this.token || localStorage.getItem('token');
    }

    isAuthenticated() {
        return !!this.getAuthToken();
    }
}

// Instancia global
const apiService = new ApiService();