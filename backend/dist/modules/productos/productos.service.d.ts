import { Repository, DataSource } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
export declare class ProductosService {
    private productoRepository;
    private dataSource;
    constructor(productoRepository: Repository<Producto>, dataSource: DataSource);
    crear(crearProductoDto: CrearProductoDto): Promise<Producto>;
    listarTodos(): Promise<Producto[]>;
    buscarPorId(id: number): Promise<Producto>;
    actualizar(id: number, actualizarProductoDto: ActualizarProductoDto): Promise<Producto>;
    eliminar(id: number): Promise<void>;
    actualizarStock(id: number, cantidad: number): Promise<Producto>;
    obtenerProductosBajoStock(limite?: number): Promise<Producto[]>;
}
