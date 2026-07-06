/**
 * Gestión de categorías
 */

class CategoriasManager {
    constructor() {
        this.categorias = [];
    }

    async cargarCategorias() {
        try {
            const categorias = await apiService.get('/categorias');
            this.categorias = categorias;
            this.renderizarCategorias();
            await syncService.guardarCategoriasOffline(categorias);
            return categorias;
        } catch (error) {
            console.warn('Error cargando categorías online:', error);
            this.categorias = await syncService.obtenerCategoriasOffline();
            this.renderizarCategorias();
            helpers.showAlert('Cargando categorías desde modo offline', 'warning');
        }
    }

    renderizarCategorias() {
        const tablaBody = document.getElementById('tablaCategoriasBody');
        if (!tablaBody) return;

        if (!this.categorias || this.categorias.length === 0) {
            tablaBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--color-text);">
                        No hay categorías disponibles
                    </td>
                </tr>
            `;
            return;
        }

        tablaBody.innerHTML = this.categorias.map(categoria => `
            <tr>
                <td>${categoria.id}</td>
                <td>${categoria.nombre}</td>
                <td>${categoria.descripcion || ''}</td>
                <td>${categoria.productosCount ?? '-'}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="categoriasManager.editarCategoria(${categoria.id})">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="categoriasManager.eliminarCategoria(${categoria.id})">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderizarCategoriasOffline(data) {
        this.categorias = data || [];
        this.renderizarCategorias();
    }

    abrirModalCategoria() {
        const modal = document.getElementById('modalCategoria');
        if (!modal) return;
        modal.style.display = 'block';
        document.getElementById('modalCategoriaTitle').textContent = 'Nueva Categoría';
        document.getElementById('categoriaId').value = '';
        document.getElementById('categoriaNombre').value = '';
        document.getElementById('categoriaDescripcion').value = '';
    }

    cerrarModalCategoria() {
        const modal = document.getElementById('modalCategoria');
        if (!modal) return;
        modal.style.display = 'none';
    }

    async crearCategoria(formData) {
        try {
            if (!navigator.onLine) {
                await syncService.agregarASyncQueue('CREATE_CATEGORIA', formData);
                helpers.showAlert('Categoría guardada en modo offline. Se sincronizará cuando vuelvas a conectado.', 'success');
                this.categorias.push({ ...formData, id: Date.now() });
                this.renderizarCategorias();
                this.cerrarModalCategoria();
                return;
            }

            await apiService.post('/categorias', formData);
            helpers.showAlert('Categoría creada exitosamente', 'success');
            this.cerrarModalCategoria();
            await this.cargarCategorias();
        } catch (error) {
            helpers.showAlert(error.message || 'Error al crear categoría', 'danger');
            console.error('Error creando categoría:', error);
            throw error;
        }
    }

    async editarCategoria(id) {
        helpers.showAlert('Función de edición no implementada aún.', 'info');
    }

    async eliminarCategoria(id) {
        if (!confirm('¿Deseas eliminar esta categoría?')) return;

        try {
            await apiService.delete(`/categorias/${id}`);
            helpers.showAlert('Categoría eliminada', 'success');
            await this.cargarCategorias();
        } catch (error) {
            helpers.showAlert(error.message || 'Error al eliminar categoría', 'danger');
            console.error('Error eliminando categoría:', error);
        }
    }
}

const categoriasManager = new CategoriasManager();

// Inicializar comportamiento de página
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;

    if (currentPath.includes('/pages/categorias/listar.html')) {
        categoriasManager.cargarCategorias();
    }

    const formCategoria = document.getElementById('formCategoria');
    if (formCategoria) {
        formCategoria.addEventListener('submit', async (event) => {
            event.preventDefault();
            const nombre = document.getElementById('categoriaNombre').value.trim();
            const descripcion = document.getElementById('categoriaDescripcion').value.trim();

            if (!nombre) {
                helpers.showAlert('El nombre de la categoría es obligatorio', 'warning');
                return;
            }

            await categoriasManager.crearCategoria({ nombre, descripcion });
        });
    }
});
