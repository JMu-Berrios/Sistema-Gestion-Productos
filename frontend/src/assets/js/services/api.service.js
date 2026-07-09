class ApiService {
  constructor() {
    // Detectar entorno
    const isProduction =
      window.location.hostname !== "localhost" &&
      !window.location.hostname.includes("127.0.0.1");

    // Al usar '/api-tienda' de forma relativa, se adaptará a cualquier dominio de Render de forma automática
    this.baseURL = isProduction
      ? "/api-tienda"
      : "http://localhost:3000/api-tienda";

    this.token = localStorage.getItem("token");
    this.offlineMode = false;
  }

  async request(endpoint, method = "GET", data = null, requiresAuth = true) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
    };

    if (requiresAuth) {
      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else if (requiresAuth) {
        throw new Error("No autenticado");
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

      // Si es 401, redirigir al login
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        // En lugar de apuntar a /src/pages/auth/login.html, apunta a la raíz
        window.location.href = "/";
        throw new Error("Sesión expirada o credenciales incorrectas");
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Error en la solicitud");
      }

      return responseData;
    } catch (error) {
      // Si es error de conexión, entrar en modo offline
      if (
        error.message === "Failed to fetch" ||
        error.message.includes("NetworkError")
      ) {
        this.offlineMode = true;
        console.warn("📴 Modo offline activado");
        throw new Error(
          "Sin conexión al servidor. Los datos se guardarán localmente.",
        );
      }
      throw error;
    }
  }

  async get(endpoint, requiresAuth = true) {
    return this.request(endpoint, "GET", null, requiresAuth);
  }

  async post(endpoint, data, requiresAuth = true) {
    return this.request(endpoint, "POST", data, requiresAuth);
  }

  async put(endpoint, data, requiresAuth = true) {
    return this.request(endpoint, "PUT", data, requiresAuth);
  }

  async delete(endpoint, requiresAuth = true) {
    return this.request(endpoint, "DELETE", null, requiresAuth);
  }

  // Métodos específicos
  async login(email, password) {
    try {
      const data = await this.post("/auth/login", { email, password }, false);
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        this.token = data.token;
        this.offlineMode = false;
      }
      return data;
    } catch (error) {
      // Si falla el login, verificar credenciales offline
      const offlineUser = this.checkOfflineCredentials(email, password);
      if (offlineUser) {
        localStorage.setItem("usuario", JSON.stringify(offlineUser));
        return { token: "offline-token", usuario: offlineUser };
      }
      throw error;
    }
  }

  checkOfflineCredentials(email, password) {
    // Verificar si hay credenciales guardadas offline
    const offlineUsers = JSON.parse(
      localStorage.getItem("offlineUsers") || "[]",
    );
    return offlineUsers.find(
      (u) => u.email === email && u.password === password,
    );
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    this.token = null;
    this.offlineMode = false;
    window.location.href = "/pages/auth/login.html";
  }

  getAuthToken() {
    return this.token || localStorage.getItem("token");
  }

  isAuthenticated() {
    return !!this.getAuthToken();
  }

  // Método para guardar credenciales offline
  saveOfflineCredentials(usuario) {
    const offlineUsers = JSON.parse(
      localStorage.getItem("offlineUsers") || "[]",
    );
    if (!offlineUsers.find((u) => u.email === usuario.email)) {
      offlineUsers.push(usuario);
      localStorage.setItem("offlineUsers", JSON.stringify(offlineUsers));
    }
  }
}

// Instancia global
const apiService = new ApiService();
