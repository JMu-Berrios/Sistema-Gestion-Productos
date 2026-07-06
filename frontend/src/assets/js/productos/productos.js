/**
 * Cargar categorías en el selector del formulario
 */
async function cargarCategoriasEnSelector(selectorId) {
    const select = document.getElementById(selectorId);
    if (!select) return;
    
    try {
        let categorias;
        if (navigator.onLine) {
            categorias = await apiService.get('/categorias');
        } else {
            categorias = await syncService.obtenerCategoriasOffline();
        }
        
        select.innerHTML = '<option value="">Seleccionar categoría</option>';
        if (categorias && categorias.length > 0) {
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nombre;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando categorías:', error);
    }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Cargar categorías en los selectores
    cargarCategoriasEnSelector('categoriaId');
});

class ProductosManager {
    constructor() {
        this.productos = [];
        this.page = 1;
        this.limit = 10;
    }

    async cargarProductos() {
        try {
            const response = await apiService.get('/productos');
            this.productos = response;
            this.renderizarProductos();
            return response;
        } catch (error) {
            console.error('Error al cargar productos:', error);
            helpers.showAlert('Error al cargar productos', 'danger');
        }
    }

    renderizarProductos() {
        const tablaBody = document.getElementById('tablaProductosBody');
        if (!tablaBody) return;

        if (this.productos.length === 0) {
            tablaBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: var(--color-text);">
                        No hay productos disponibles
                    </td>
                </tr>
            `;
            return;
        }

        tablaBody.innerHTML = this.productos.map(producto => `
            <tr>
                <td>${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td>${producto.categoria?.nombre || 'Sin categoría'}</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td>
                    <span style="color: ${producto.stock <= 10 ? 'var(--color-danger)' : 'var(--color-text-light)'}">
                        ${producto.stock}
                    </span>
                </td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="productosManager.editarProducto(${producto.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="productosManager.eliminarProducto(${producto.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async crearProducto(formData) {
        try {
            const response = await apiService.post('/productos', formData);
            helpers.showAlert('Producto creado exitosamente', 'success');
            await this.cargarProductos();
            return response;
        } catch (error) {
            helpers.showAlert(error.message || 'Error al crear producto', 'danger');
            throw error;
        }
    }

    async editarProducto(id) {
        // Redirigir a la página de edición
        window.location.href = `/pages/productos/editar.html?id=${id}`;
    }

    async eliminarProducto(id) {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            await apiService.delete(`/productos/${id}`);
            helpers.showAlert('Producto eliminado exitosamente', 'success');
            await this.cargarProductos();
        } catch (error) {
            helpers.showAlert(error.message || 'Error al eliminar producto', 'danger');
        }
    }

    async obtenerProductoPorId(id) {
        try {
            return await apiService.get(`/productos/${id}`);
        } catch (error) {
            console.error('Error al obtener producto:', error);
            throw error;
        }
    }

    async actualizarProducto(id, formData) {
        try {
            const response = await apiService.put(`/productos/${id}`, formData);
            helpers.showAlert('Producto actualizado exitosamente', 'success');
            return response;
        } catch (error) {
            helpers.showAlert(error.message || 'Error al actualizar producto', 'danger');
            throw error;
        }
    }
}

// Instancia global
const productosManager = new ProductosManager();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación en páginas protegidas
    const currentPage = window.location.pathname;
    const protectedPages = ['/pages/dashboard/index.html', '/pages/productos/', '/pages/categorias/', '/pages/ventas/'];
    
    if (protectedPages.some(page => currentPage.includes(page))) {
        if (!authService.isAuthenticated()) {
            window.location.href = '/pages/auth/login.html';
            return;
        }
    }

    // Cargar productos si estamos en la página de productos
    if (currentPage.includes('/pages/productos/listar.html')) {
        productosManager.cargarProductos();
    }

    // Manejar formulario de creación de productos
    const formProducto = document.getElementById('formProducto');
    if (formProducto) {
        formProducto.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                nombre: document.getElementById('nombre').value,
                descripcion: document.getElementById('descripcion').value,
                precio: parseFloat(document.getElementById('precio').value),
                stock: parseInt(document.getElementById('stock').value),
                categoriaId: parseInt(document.getElementById('categoriaId').value),
                codigo: document.getElementById('codigo').value
            };

            await productosManager.crearProducto(formData);
        });
    }

    // Manejar formulario de edición de productos
    const formEditarProducto = document.getElementById('formEditarProducto');
    if (formEditarProducto) {
        // Cargar datos del producto a editar
        const urlParams = new URLSearchParams(window.location.search);
        const productoId = urlParams.get('id');
        
        if (productoId) {
            productosManager.obtenerProductoPorId(productoId).then(producto => {
                document.getElementById('nombre').value = producto.nombre;
                document.getElementById('descripcion').value = producto.descripcion;
                document.getElementById('precio').value = producto.precio;
                document.getElementById('stock').value = producto.stock;
                document.getElementById('categoriaId').value = producto.categoriaId;
                document.getElementById('codigo').value = producto.codigo;
            }).catch(error => {
                console.error('Error al cargar producto:', error);
                helpers.showAlert('Error al cargar los datos del producto', 'danger');
            });
        }

        formEditarProducto.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!productoId) {
                helpers.showAlert('ID de producto no encontrado', 'danger');
                return;
            }

            const formData = {
                nombre: document.getElementById('nombre').value,
                descripcion: document.getElementById('descripcion').value,
                precio: parseFloat(document.getElementById('precio').value),
                stock: parseInt(document.getElementById('stock').value),
                categoriaId: parseInt(document.getElementById('categoriaId').value),
                codigo: document.getElementById('codigo').value
            };

            await productosManager.actualizarProducto(parseInt(productoId), formData);
            setTimeout(() => {
                window.location.href = '/pages/productos/listar.html';
            }, 1500);
        });
    }
});