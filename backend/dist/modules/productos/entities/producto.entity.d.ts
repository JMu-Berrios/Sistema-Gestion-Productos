import { Categoria } from '../../categorias/entities/categoria.entity';
export declare class Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    categoria: Categoria;
    categoriaId: number;
    codigo: string;
    activo: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
}
