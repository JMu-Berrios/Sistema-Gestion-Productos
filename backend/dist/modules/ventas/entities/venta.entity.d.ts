import { Usuario } from '../../auth/entities/usuario.entity';
import { DetalleVenta } from './detalle-venta.entity';
export declare class Venta {
    id: number;
    numeroFactura: string;
    total: number;
    usuarioId: number;
    usuario: Usuario;
    detalles: DetalleVenta[];
    fechaCreacion: Date;
}
