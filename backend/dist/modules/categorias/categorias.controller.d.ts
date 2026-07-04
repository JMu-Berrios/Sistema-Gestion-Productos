import { CategoriasService } from './categorias.service';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto';
export declare class CategoriasController {
    private categoriasService;
    constructor(categoriasService: CategoriasService);
    crear(crearCategoriaDto: CrearCategoriaDto): Promise<import("./entities/categoria.entity").Categoria>;
    listarTodos(): Promise<import("./entities/categoria.entity").Categoria[]>;
    listarEliminadas(): Promise<import("./entities/categoria.entity").Categoria[]>;
    buscarPorTexto(texto: string): Promise<import("./entities/categoria.entity").Categoria[]>;
    contarActivas(): Promise<number>;
    buscarPorId(id: number): Promise<import("./entities/categoria.entity").Categoria>;
    actualizar(id: number, actualizarCategoriaDto: ActualizarCategoriaDto): Promise<import("./entities/categoria.entity").Categoria>;
    eliminar(id: number): Promise<void>;
    eliminarFisicamente(id: number): Promise<void>;
    restaurar(id: number): Promise<import("./entities/categoria.entity").Categoria>;
    obtenerProductosPorCategoria(id: number): Promise<any>;
}
