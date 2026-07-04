import { ProductosService } from './productos.service';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
export declare class ProductosController {
    private productosService;
    constructor(productosService: ProductosService);
    crear(crearProductoDto: CrearProductoDto): Promise<import("./entities/producto.entity").Producto>;
    listarTodos(): Promise<import("./entities/producto.entity").Producto[]>;
    buscarPorId(id: number): Promise<import("./entities/producto.entity").Producto>;
    actualizar(id: number, actualizarProductoDto: ActualizarProductoDto): Promise<import("./entities/producto.entity").Producto>;
    eliminar(id: number): Promise<void>;
    obtenerBajoStock(limite?: number): Promise<import("./entities/producto.entity").Producto[]>;
}
