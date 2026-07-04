import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto';
export declare class CategoriasService {
    private categoriaRepository;
    constructor(categoriaRepository: Repository<Categoria>);
    private normalizarNombre;
    private nombreDuplicado;
    crear(crearCategoriaDto: CrearCategoriaDto): Promise<Categoria>;
    listarTodos(): Promise<Categoria[]>;
    buscarPorId(id: number): Promise<Categoria>;
    buscarPorIdIncluyendoInactivas(id: number): Promise<Categoria>;
    buscarPorNombre(nombre: string): Promise<Categoria | null>;
    actualizar(id: number, actualizarCategoriaDto: ActualizarCategoriaDto): Promise<Categoria>;
    eliminar(id: number): Promise<void>;
    eliminarFisicamente(id: number): Promise<void>;
    obtenerProductosPorCategoria(id: number): Promise<any>;
    restaurar(id: number): Promise<Categoria>;
    listarEliminadas(): Promise<Categoria[]>;
    contarActivas(): Promise<number>;
    buscarPorTexto(texto: string): Promise<Categoria[]>;
}
