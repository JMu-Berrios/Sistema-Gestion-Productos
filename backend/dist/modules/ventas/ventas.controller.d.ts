import { VentasService } from './ventas.service';
import { CrearVentaDto } from './dto/crear-venta.dto';
import { ActualizarVentaDto } from './dto/actualizar-venta.dto';
export declare class VentasController {
    private ventasService;
    constructor(ventasService: VentasService);
    crear(crearVentaDto: CrearVentaDto, req: any): Promise<import("./entities/venta.entity").Venta>;
    listarTodos(): Promise<import("./entities/venta.entity").Venta[]>;
    listarMisVentas(req: any): Promise<import("./entities/venta.entity").Venta[]>;
    buscarPorId(id: number): Promise<import("./entities/venta.entity").Venta>;
    listarPorCliente(clienteId: number): Promise<import("./entities/venta.entity").Venta[]>;
    actualizar(id: number, actualizarVentaDto: ActualizarVentaDto): Promise<import("./entities/venta.entity").Venta>;
    eliminar(id: number): Promise<void>;
    obtenerReporteMensual(anio: number, mes: number): Promise<any>;
    obtenerReportePorRango(fechaInicio: string, fechaFin: string): Promise<any>;
    obtenerEstadisticas(): Promise<any>;
}
