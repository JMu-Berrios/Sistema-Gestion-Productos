/**
 * Gestión de ventas
 */

class VentasManager {
    constructor() {
        this.ventas = [];
    }

    async cargarVentas() {
        try {
            const ventas = await apiService.get('/ventas');
            this.ventas = ventas;
            this.renderizarVentas();
            localStorage.setItem('ventasOffline', JSON.stringify(ventas));
            return ventas;
        } catch (error) {
            console.warn('Error cargando ventas online:', error);
            const offlineData = localStorage.getItem('ventasOffline');
            this.ventas = offlineData ? JSON.parse(offlineData) : [];
            this.renderizarVentas();
            helpers.showAlert('Cargando ventas desde modo offline', 'warning');
        }
    }

    renderizarVentas() {
        const tablaBody = document.getElementById('tablaVentasBody');
        if (!tablaBody) return;

        if (!this.ventas || this.ventas.length === 0) {
            tablaBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: var(--color-text);">
                        No hay ventas registradas
                    </td>
                </tr>
            `;
            return;
        }

        tablaBody.innerHTML = this.ventas.map(venta => `
            <tr>
                <td>${venta.numeroFactura || venta.id}</td>
                <td>${helpers.formatDate(venta.fechaCreacion)}</td>
                <td>${venta.usuario?.nombre || 'N/A'}</td>
                <td>${helpers.formatCurrency(venta.total || 0)}</td>
                <td>${venta.detalles?.map(d => d.producto?.nombre || d.productoNombre || '—').join(', ')}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="ventasManager.verVenta(${venta.id})">
                        Ver
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderizarVentasOffline(data) {
        this.ventas = data || [];
        this.renderizarVentas();
    }

    async verVenta(id) {
        if (!id) return;
        helpers.showAlert('Función ver venta no implementada aún.', 'info');
    }
}

const ventasManager = new VentasManager();

document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;

    if (currentPath.includes('/pages/ventas/listar.html')) {
        ventasManager.cargarVentas();
    }
});
