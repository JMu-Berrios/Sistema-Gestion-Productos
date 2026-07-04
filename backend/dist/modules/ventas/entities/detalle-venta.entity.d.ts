import { Venta } from './venta.entity';
import { Producto } from '../../productos/entities/producto.entity';
export declare class DetalleVenta {
    id: number;
    ventaId: number;
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    venta: Venta;
    producto: Producto;
}
