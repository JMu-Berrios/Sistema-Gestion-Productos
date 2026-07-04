import { Repository, DataSource } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { Producto } from '../productos/entities/producto.entity';
import { CrearVentaDto } from './dto/crear-venta.dto';
import { ActualizarVentaDto } from './dto/actualizar-venta.dto';
export declare class VentasService {
    private ventaRepository;
    private detalleVentaRepository;
    private productoRepository;
    private dataSource;
    constructor(ventaRepository: Repository<Venta>, detalleVentaRepository: Repository<DetalleVenta>, productoRepository: Repository<Producto>, dataSource: DataSource);
    crear(crearVentaDto: CrearVentaDto, usuarioId: number): Promise<Venta>;
    listarTodos(): Promise<Venta[]>;
    listarPorUsuario(usuarioId: number): Promise<Venta[]>;
    buscarPorId(id: number): Promise<Venta>;
    actualizar(id: number, actualizarVentaDto: ActualizarVentaDto): Promise<Venta>;
    eliminar(id: number): Promise<void>;
    obtenerReporteMensual(anio: number, mes: number): Promise<any>;
    obtenerReportePorRango(fechaInicio: string, fechaFin: string): Promise<any>;
    obtenerEstadisticas(): Promise<any>;
}
