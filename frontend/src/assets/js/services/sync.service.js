/**
 * Servicio de Sincronización Offline/Online
 * Maneja el almacenamiento local y sincronización con el servidor
 */

class SyncService {
    constructor() {
        this.dbName = 'sistemaGestionDB';
        this.dbVersion = 1;
        this.db = null;
        this.initDB();
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Store para productos
                if (!db.objectStoreNames.contains('productos')) {
                    const store = db.createObjectStore('productos', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('codigo', 'codigo', { unique: true });
                    store.createIndex('categoriaId', 'categoriaId', { unique: false });
                }
                
                // Store para categorías
                if (!db.objectStoreNames.contains('categorias')) {
                    const store = db.createObjectStore('categorias', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('nombre', 'nombre', { unique: true });
                }
                
                // Store para ventas
                if (!db.objectStoreNames.contains('ventas')) {
                    const store = db.createObjectStore('ventas', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('usuarioId', 'usuarioId', { unique: false });
                }
                
                // Store para cola de sincronización
                if (!db.objectStoreNames.contains('syncQueue')) {
                    db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    async guardarDatos(storeName, data) {
        if (!this.db) await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async obtenerDatos(storeName, filtro = null) {
        if (!this.db) await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            
            const request = store.getAll();
            request.onsuccess = () => {
                let data = request.result;
                if (filtro) {
                    data = data.filter(filtro);
                }
                resolve(data);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async eliminarDatos(storeName, id) {
        if (!this.db) await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            
            const request = store.delete(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async limpiarStore(storeName) {
        if (!this.db) await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            
            const request = store.clear();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async guardarProductosOffline(productos) {
        await this.limpiarStore('productos');
        for (const producto of productos) {
            await this.guardarDatos('productos', producto);
        }
    }

    async obtenerProductosOffline() {
        return this.obtenerDatos('productos');
    }

    async guardarCategoriasOffline(categorias) {
        await this.limpiarStore('categorias');
        for (const categoria of categorias) {
            await this.guardarDatos('categorias', categoria);
        }
    }

    async obtenerCategoriasOffline() {
        return this.obtenerDatos('categorias');
    }

    async agregarASyncQueue(accion, datos, id = null) {
        if (!this.db) await this.initDB();
        
        const item = {
            accion,
            datos,
            id,
            timestamp: new Date().toISOString(),
            intentos: 0
        };
        
        return this.guardarDatos('syncQueue', item);
    }

    async obtenerSyncQueue() {
        return this.obtenerDatos('syncQueue');
    }

    async eliminarDeSyncQueue(id) {
        return this.eliminarDatos('syncQueue', id);
    }

    async sincronizar() {
        if (!navigator.onLine) {
            console.log('📴 Sin conexión, no se puede sincronizar');
            return { sincronizados: 0, fallidos: 0 };
        }
        
        const queue = await this.obtenerSyncQueue();
        let sincronizados = 0;
        let fallidos = 0;
        
        for (const item of queue) {
            try {
                let response;
                switch (item.accion) {
                    case 'CREATE_PRODUCTO':
                        response = await apiService.post('/productos', item.datos);
                        break;
                    case 'UPDATE_PRODUCTO':
                        response = await apiService.put(`/productos/${item.id}`, item.datos);
                        break;
                    case 'DELETE_PRODUCTO':
                        response = await apiService.delete(`/productos/${item.id}`);
                        break;
                    case 'CREATE_CATEGORIA':
                        response = await apiService.post('/categorias', item.datos);
                        break;
                    case 'CREATE_VENTA':
                        response = await apiService.post('/ventas', item.datos);
                        break;
                    default:
                        console.warn('Acción desconocida:', item.accion);
                        continue;
                }
                
                if (response) {
                    await this.eliminarDeSyncQueue(item.id);
                    sincronizados++;
                }
            } catch (error) {
                item.intentos++;
                if (item.intentos >= 3) {
                    await this.eliminarDeSyncQueue(item.id);
                    fallidos++;
                    console.error(`Error en ${item.accion} después de 3 intentos:`, error);
                } else {
                    await this.guardarDatos('syncQueue', item);
                }
            }
        }
        
        return { sincronizados, fallidos };
    }
}

// Instancia global
const syncService = new SyncService();