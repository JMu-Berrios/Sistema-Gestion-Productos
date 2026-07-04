import { Venta } from '../../ventas/entities/venta.entity';
export declare class Usuario {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    activo: boolean;
    telefono: string;
    direccion: string;
    rol: string;
    ultimoAcceso: Date;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    ventas: Venta[];
}
