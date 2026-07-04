const helpers = {
    showAlert(message, type = 'success') {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) {
            console.warn('Contenedor de alertas no encontrado');
            return;
        }

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;

        alertContainer.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 5000);
    },

    formatCurrency(value) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(value);
    },

    formatDate(date) {
        return new Date(date).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    getToken() {
        return localStorage.getItem('token');
    },

    getUsuario() {
        const usuario = localStorage.getItem('usuario');
        return usuario ? JSON.parse(usuario) : null;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/pages/auth/login.html';
    }
};