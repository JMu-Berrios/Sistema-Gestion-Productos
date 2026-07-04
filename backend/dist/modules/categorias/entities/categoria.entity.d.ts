import { Producto } from '../../productos/entities/producto.entity';
export declare class Categoria {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
    productos: Producto[];
    fechaCreacion: Date;
    fechaActualizacion: Date;
}
