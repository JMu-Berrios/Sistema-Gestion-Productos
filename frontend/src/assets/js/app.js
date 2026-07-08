/**
 * Aplicación Principal - Sistema de Gestión de Productos
 * Soporte para modo offline/online con sincronización
 */

class App {
    constructor() {
        this.pages = {};
        this.currentPage = 'dashboard';
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;
        this.offlineQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        this.init();
    }

    async init() {
        console.log(' Iniciando aplicación...');
        
        // Configurar eventos de conexión
        this.setupNetworkListeners();
        
        // Verificar autenticación
        const isAuthenticated = authService.isAuthenticated();
        console.log('🔑 Autenticado:', isAuthenticated);
        
        // Determinar página actual
        const path = window.location.pathname;
        const page = this.getPageFromPath(path);
        console.log('📍 Ruta actual:', path);
        
        // Si no está autenticado y no está en login/register, redirigir
        if (!isAuthenticated && !['login', 'register'].includes(page)) {
            this.navigateTo('login');
            return; 
        }
        
        // Si está autenticado y está en login/register, redirigir al dashboard
        if (isAuthenticated && ['login', 'register'].includes(page)) {
            this.navigateTo('dashboard');
            return;
        }
        
        // Cargar la página
        await this.loadPage(page);
        
        // Verificar sincronización pendiente
        if (this.isOnline && this.offlineQueue.length > 0) {
            await this.syncOfflineData();
        }
        
        // Verificar conexión al servidor
        if (this.isOnline) {
            await this.checkServerConnection();
        }
        
        console.log('✅ Aplicación iniciada correctamente');
    }

    setupNetworkListeners() {
        window.addEventListener('online', async () => {
            console.log('🔄 Conexión restablecida');
            this.isOnline = true;
            
            // Mostrar notificación
            helpers.showAlert('Conexión restablecida. Sincronizando datos...', 'success');
            
            // Sincronizar datos pendientes
            if (this.offlineQueue.length > 0) {
                await this.syncOfflineData();
            }
            
            // Verificar conexión al servidor
            await this.checkServerConnection();
        });
        
        window.addEventListener('offline', () => {
            console.log('📴 Conexión perdida');
            this.isOnline = false;
            helpers.showAlert('Sin conexión a internet. Los datos se guardarán localmente.', 'warning');
        });
    }

    //se agrega prefijos a la ruta de los htmls para mostrar la interfaz
    getPageFromPath(path) {
        if (path.includes('/src/pages/auth/login')) return 'login';
        if (path.includes('/src/pages/auth/register')) return 'register';
        if (path.includes('/src/pages/dashboard')) return 'dashboard';
        if (path.includes('/src/pages/productos')) return 'productos';
        if (path.includes('/src/pages/categorias')) return 'categorias';
        if (path.includes('/src/pages/ventas')) return 'ventas';
        return 'dashboard';
    }

    async loadPage(page) {
        this.currentPage = page;
        
        try {
            // Cargar el HTML de la página
            const pagePath = this.getPagePath(page);
            const response = await fetch(pagePath);
            
            if (!response.ok) {
                throw new Error(`Error cargando página: ${response.status}`);
            }
            
            const html = await response.text();
            
            // Cargar parciales
            const headerHtml = await this.loadPartial('header');
            const sidebarHtml = await this.loadPartial('sidebar');
            const footerHtml = await this.loadPartial('footer');
            
            // Inyectar en el DOM
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = this.buildLayout(html, headerHtml, sidebarHtml, footerHtml, page);
            }
            
            // Ejecutar scripts específicos de la página
            this.executePageScripts(page);
            
            // Actualizar navegación activa
            this.updateActiveNav(page);
            
            // Cargar datos según la página
            await this.loadPageData(page);
            
        } catch (error) {
            console.error('Error cargando página:', error);
            this.showErrorPage(error.message);
        }
    }

    getPagePath(page) {
        const pages = {
            'login': '/src/pages/auth/login.html',
            'register': '/src/pages/auth/register.html',
            'dashboard': '/src/pages/dashboard/index.html',
            'productos': '/src/pages/productos/listar.html',
            'categorias': '/src/pages/categorias/listar.html',
            'ventas': '/src/pages/ventas/listar.html'
        };
        return pages[page] || pages['dashboard'];
    }

    async loadPartial(partial) {
        try {
            const response = await fetch(`/src/partials/${partial}.html`);
            if (!response.ok) return '';
            return await response.text();
        } catch (error) {
            console.warn(`Error cargando partial ${partial}:`, error);
            return '';
        }
    }

    buildLayout(content, header, sidebar, footer, page) {
        // Para páginas de autenticación, no mostrar header/sidebar
        if (['login', 'register'].includes(page)) {
            return content;
        }
        
        return `
            ${header}
            <div class="main-container">
                ${sidebar}
                <main class="content">
                    ${content}
                </main>
            </div>
            ${footer}
        `;
    }

    executePageScripts(page) {
        // Remover scripts anteriores
        const oldScripts = document.querySelectorAll('.page-script');
        oldScripts.forEach(script => script.remove());
        
        // Cargar script específico
        const scriptMap = {
            'login': '/src/assets/js/auth/login.js',
            'register': '/src/assets/js/auth/register.js',
            'dashboard': null,
            'productos': '/src/assets/js/productos/productos.js',
            'categorias': '/src/assets/js/categorias/categorias.js',
            'ventas': '/src/assets/js/ventas/ventas.js'
        };
        
        const scriptPath = scriptMap[page];
        if (scriptPath) {
            const script = document.createElement('script');
            script.src = scriptPath;
            script.className = 'page-script';
            document.body.appendChild(script);
        }
    }

    updateActiveNav(page) {
        const navItems = document.querySelectorAll('.sidebar li');
        navItems.forEach(item => {
            item.classList.remove('active');
            const link = item.querySelector('a');
            if (link) {
                const href = link.getAttribute('data-page');
                if (href === page) {
                    item.classList.add('active');
                }
            }
        });
    }

    async loadPageData(page) {
        if (!this.isOnline) {
            // Cargar datos desde localStorage en modo offline
            this.loadOfflineData(page);
            return;
        }
        
        try {
            switch(page) {
                case 'dashboard':
                    await this.loadDashboardData();
                    break;
                case 'productos':
                    if (typeof productosManager !== 'undefined') {
                        await productosManager.cargarProductos();
                    }
                    break;
                case 'categorias':
                    if (typeof categoriasManager !== 'undefined') {
                        await categoriasManager.cargarCategorias();
                    }
                    break;
                case 'ventas':
                    if (typeof ventasManager !== 'undefined') {
                        await ventasManager.cargarVentas();
                    }
                    break;
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            // Si falla, intentar cargar desde localStorage
            this.loadOfflineData(page);
        }
    }

    loadOfflineData(page) {
        console.log('📴 Cargando datos desde localStorage (modo offline)');
        try {
            const data = localStorage.getItem(`offline_${page}`);
            if (data) {
                const parsed = JSON.parse(data);
                // Renderizar con datos offline
                this.renderOfflineData(page, parsed);
            }
        } catch (error) {
            console.error('Error cargando datos offline:', error);
        }
    }

    renderOfflineData(page, data) {
        helpers.showAlert('Mostrando datos guardados localmente (modo offline)', 'warning');
        // Cada página maneja su renderizado offline
        switch(page) {
            case 'productos':
                if (typeof productosManager !== 'undefined') {
                    productosManager.renderizarProductosOffline(data);
                }
                break;
            case 'categorias':
                if (typeof categoriasManager !== 'undefined') {
                    categoriasManager.renderizarCategoriasOffline(data);
                }
                break;
            case 'ventas':
                if (typeof ventasManager !== 'undefined') {
                    ventasManager.renderizarVentasOffline(data);
                }
                break;
        }
    }

    async loadDashboardData() {
        try {
            // Obtener estadísticas
            const stats = await apiService.get('/ventas/estadisticas/resumen');
            this.renderDashboardStats(stats);
            
            // Obtener productos bajo stock
            const productosBajoStock = await apiService.get('/productos/bajo-stock/5');
            this.renderDashboardLowStock(productosBajoStock);
            
            // Obtener últimas ventas
            const ultimasVentas = await apiService.get('/ventas?limit=5');
            this.renderDashboardRecentSales(ultimasVentas);
            
        } catch (error) {
            console.error('Error cargando dashboard:', error);
            // Cargar datos offline del dashboard
            const offlineData = JSON.parse(localStorage.getItem('offline_dashboard') || '{}');
            if (offlineData.stats) {
                this.renderDashboardStats(offlineData.stats);
            }
        }
    }

    renderDashboardStats(stats) {
        const container = document.getElementById('statsContainer');
        if (!container) return;
        
        // Guardar offline
        localStorage.setItem('offline_dashboard', JSON.stringify({ stats }));
        
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-info">
                        <h3>Total Ventas</h3>
                        <p class="stat-number">${stats.totalVentas || 0}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💵</div>
                    <div class="stat-info">
                        <h3>Ingresos Totales</h3>
                        <p class="stat-number">${helpers.formatCurrency(stats.totalMonto || 0)}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <div class="stat-info">
                        <h3>Ventas Hoy</h3>
                        <p class="stat-number">${stats.ventasHoy || 0}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-info">
                        <h3>Ventas Mes</h3>
                        <p class="stat-number">${stats.ventasMes || 0}</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderDashboardLowStock(productos) {
        const container = document.getElementById('lowStockContainer');
        if (!container) return;
        
        if (!productos || productos.length === 0) {
            container.innerHTML = `<p class="no-data">✅ Todos los productos tienen stock suficiente</p>`;
            return;
        }
        
        container.innerHTML = `
            <div class="low-stock-list">
                ${productos.map(p => `
                    <div class="low-stock-item ${p.stock <= 0 ? 'out-of-stock' : 'low-stock'}">
                        <span class="product-name">${p.nombre}</span>
                        <span class="product-stock">${p.stock} unidades</span>
                        <span class="product-price">${helpers.formatCurrency(p.precio)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderDashboardRecentSales(ventas) {
        const container = document.getElementById('recentSalesContainer');
        if (!container) return;
        
        if (!ventas || ventas.length === 0) {
            container.innerHTML = `<p class="no-data">No hay ventas recientes</p>`;
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Factura</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Usuario</th>
                    </tr>
                </thead>
                <tbody>
                    ${ventas.map(v => `
                        <tr>
                            <td>${v.numeroFactura}</td>
                            <td>${helpers.formatDate(v.fechaCreacion)}</td>
                            <td>${helpers.formatCurrency(v.total)}</td>
                            <td>${v.usuario?.nombre || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    //se agrega prefijo src para mostrar infterfaz al ser llamadas
    navigateTo(page) {
        // Cambiar la URL sin recargar
        const pages = {
            'login': '/src/pages/auth/login.html',
            'register': '/src/pages/auth/register.html',
            'dashboard': '/src/pages/dashboard/index.html',
            'productos': '/src/pages/productos/listar.html',
            'categorias': '/src/pages/categorias/listar.html',
            'ventas': '/src/pages/ventas/listar.html'
        };
        
        const url = pages[page] || pages['dashboard'];
        window.history.pushState({ page }, '', url);
        this.loadPage(page);
    }

    async syncOfflineData() {
        if (this.syncInProgress) return;
        this.syncInProgress = true;
        
        console.log('🔄 Sincronizando datos offline...');
        helpers.showAlert('Sincronizando datos pendientes...', 'info');
        
        try {
            const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
            let synced = 0;
            let failed = 0;
            
            for (const item of queue) {
                try {
                    let response;
                    switch (item.action) {
                        case 'create_producto':
                            response = await apiService.post('/productos', item.data);
                            break;
                        case 'update_producto':
                            response = await apiService.put(`/productos/${item.id}`, item.data);
                            break;
                        case 'delete_producto':
                            response = await apiService.delete(`/productos/${item.id}`);
                            break;
                        case 'create_categoria':
                            response = await apiService.post('/categorias', item.data);
                            break;
                        case 'create_venta':
                            response = await apiService.post('/ventas', item.data);
                            break;
                        default:
                            console.warn('Acción desconocida:', item.action);
                            continue;
                    }
                    
                    if (response) {
                        synced++;
                        // Remover de la cola
                        const index = queue.indexOf(item);
                        if (index > -1) {
                            queue.splice(index, 1);
                        }
                    }
                } catch (error) {
                    failed++;
                    console.error(`Error sincronizando ${item.action}:`, error);
                }
            }
            
            // Actualizar cola
            localStorage.setItem('offlineQueue', JSON.stringify(queue));
            this.offlineQueue = queue;
            
            if (synced > 0) {
                helpers.showAlert(`✅ ${synced} operaciones sincronizadas correctamente`, 'success');
                // Recargar datos
                await this.loadPageData(this.currentPage);
            }
            
            if (failed > 0) {
                helpers.showAlert(`⚠️ ${failed} operaciones fallaron. Se reintentarán después.`, 'warning');
            }
            
        } catch (error) {
            console.error('Error en sincronización:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    async checkServerConnection() {
        try {
            const response = await apiService.get('/auth/health', false);
            if (response && response.status === 'ok') {
                console.log('✅ Servidor conectado');
                // Si hay datos offline, sincronizar
                if (this.offlineQueue.length > 0) {
                    await this.syncOfflineData();
                }
                return true;
            }
        } catch (error) {
            console.warn('⚠️ No se pudo conectar al servidor');
            this.isOnline = false;
            return false;
        }
    }

    showErrorPage(message) {
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div class="error-page">
                    <h1>Error</h1>
                    <p>${message}</p>
                    <button onclick="app.navigateTo('dashboard')">Volver al inicio</button>
                </div>
            `;
        }
    }

    // Método para guardar operaciones offline
    queueOfflineAction(action, data, id = null) {
        const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        queue.push({
            action,
            data,
            id,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('offlineQueue', JSON.stringify(queue));
        this.offlineQueue = queue;
        console.log(`📴 Operación ${action} encolada para sincronización offline`);
    }
}

// Inicializar aplicación cuando el DOM esté listo
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});

// Exponer para uso global
window.app = app;