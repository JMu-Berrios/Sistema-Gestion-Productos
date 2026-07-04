class AuthService {
    constructor() {
        this.usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    }

    async login(email, password) {
        try {
            const response = await apiService.login(email, password);
            this.usuario = response.usuario;
            return response;
        } catch (error) {
            throw error;
        }
    }

    async register(userData) {
        try {
            return await apiService.register(userData);
        } catch (error) {
            throw error;
        }
    }

    logout() {
        apiService.logout();
        this.usuario = null;
    }

    getUsuario() {
        return this.usuario;
    }

    isAuthenticated() {
        return apiService.isAuthenticated() && this.usuario !== null;
    }

    getToken() {
        return apiService.getAuthToken();
    }
}

const authService = new AuthService();