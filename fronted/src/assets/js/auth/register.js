document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Verificar si ya está autenticado
    if (authService.isAuthenticated()) {
        window.location.href = '/';
        return;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Limpiar mensajes
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';
            
            // Validar campos
            if (!validators.isEmail(emailInput.value)) {
                errorMessage.textContent = 'Por favor ingresa un email válido';
                errorMessage.style.display = 'block';
                return;
            }
            
            if (!validators.isRequired(passwordInput.value)) {
                errorMessage.textContent = 'Por favor ingresa tu contraseña';
                errorMessage.style.display = 'block';
                return;
            }

            try {
                // Mostrar loading
                const btn = loginForm.querySelector('button[type="submit"]');
                btn.disabled = true;
                btn.textContent = 'Iniciando sesión...';
                
                const response = await authService.login(
                    emailInput.value,
                    passwordInput.value
                );
                
                successMessage.textContent = '¡Inicio de sesión exitoso! Redirigiendo...';
                successMessage.style.display = 'block';
                
                // Redirigir al dashboard (SPA) después de 1 segundo
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
                
            } catch (error) {
                errorMessage.textContent = error.message || 'Error al iniciar sesión';
                errorMessage.style.display = 'block';
            } finally {
                const btn = loginForm.querySelector('button[type="submit"]');
                btn.disabled = false;
                btn.textContent = 'Iniciar Sesión';
            }
        });
    }
});