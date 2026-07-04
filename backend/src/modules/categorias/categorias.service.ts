import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
  ) {}

  // Normaliza el nombre para evitar espacios al inicio o final.
  private normalizarNombre(nombre: string): string {
    return nombre.trim();
  }

  // Verifica si ya existe una categoría con el mismo nombre.
  // excludeId permite omitir una categoría concreta cuando se actualiza.
  private async nombreDuplicado(nombre: string, excludeId?: number): Promise<boolean> {
    const qb = this.categoriaRepository.createQueryBuilder('categoria');
    qb.where('LOWER(categoria.nombre) = LOWER(:nombre)', { nombre: this.normalizarNombre(nombre) });

    if (excludeId) {
      qb.andWhere('categoria.id != :excludeId', { excludeId });
    }

    return (await qb.getCount()) > 0;
  }

  /**
   * Crear una nueva categoría
   */
  /**
   * Crear una nueva categoría.
   * Se normaliza el nombre y se valida que no exista otra categoría activa o inactiva
   * con el mismo nombre, ignorando mayúsculas y espacios finales.
   */
  async crear(crearCategoriaDto: CrearCategoriaDto): Promise<Categoria> {
    const nombre = this.normalizarNombre(crearCategoriaDto.nombre);

    if (await this.nombreDuplicado(nombre)) {
      throw new ConflictException('El nombre de la categoría ya existe');
    }

    const categoria = this.categoriaRepository.create({
      nombre,
      descripcion: crearCategoriaDto.descripcion,
      activo: true,
    });

    return this.categoriaRepository.save(categoria);
  }

  /**
   * Listar todas las categorías activas
   */
  async listarTodos(): Promise<Categoria[]> {
    return this.categoriaRepository.find({
      where: { activo: true },
      relations: { productos: true },
      order: { nombre: 'ASC' },
    });
  }

  /**
   * Buscar categoría por ID (solo activas)
   */
  async buscarPorId(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id, activo: true },
      relations: { productos: true },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return categoria;
  }

  /**
   * Buscar categoría por ID incluyendo inactivas (para administración)
   */
  async buscarPorIdIncluyendoInactivas(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id },
      relations: { productos: true },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return categoria;
  }

  /**
   * Buscar categoría por nombre
   */
  async buscarPorNombre(nombre: string): Promise<Categoria | null> {
    const normalized = this.normalizarNombre(nombre);

    return this.categoriaRepository
      .createQueryBuilder('categoria')
      .where('LOWER(categoria.nombre) = LOWER(:nombre)', { nombre: normalized })
      .andWhere('categoria.activo = :activo', { activo: true })
      .getOne();
  }

  /**
   * Actualizar una categoría existente
   */
  /**
   * Actualizar una categoría existente.
   * No se permite cambiar el estado `activo` desde aquí para mantener
   * la lógica de baja/alta en los métodos específicos de eliminar/restaurar.
   */
  async actualizar(id: number, actualizarCategoriaDto: ActualizarCategoriaDto): Promise<Categoria> {
    const categoria = await this.buscarPorId(id);
    const { nombre, descripcion } = actualizarCategoriaDto;

    if (nombre && nombre.trim() !== categoria.nombre) {
      if (await this.nombreDuplicado(nombre, id)) {
        throw new ConflictException('El nombre de la categoría ya existe');
      }
      categoria.nombre = this.normalizarNombre(nombre);
    }

    if (descripcion !== undefined) {
      categoria.descripcion = descripcion;
    }

    return this.categoriaRepository.save(categoria);
  }

  /**
   * Eliminar categoría (soft delete)
   */
  async eliminar(id: number): Promise<void> {
    const categoria = await this.buscarPorId(id);

    // Verificar si tiene productos activos asociados
    if (categoria.productos && categoria.productos.length > 0) {
      const productosActivos = categoria.productos.filter(p => p.activo !== false);
      if (productosActivos.length > 0) {
        throw new BadRequestException(
          `No se puede eliminar la categoría porque tiene ${productosActivos.length} productos asociados. Primero elimina o reasigna los productos.`
        );
      }
    }

    // Soft delete
    categoria.activo = false;
    await this.categoriaRepository.save(categoria);
  }

  /**
   * Eliminar categoría físicamente (solo para administración)
   */
  async eliminarFisicamente(id: number): Promise<void> {
    const categoria = await this.buscarPorIdIncluyendoInactivas(id);

    // Verificar si tiene productos asociados
    if (categoria.productos && categoria.productos.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la categoría porque tiene ${categoria.productos.length} productos asociados.`
      );
    }

    await this.categoriaRepository.remove(categoria);
  }

  /**
   * Obtener productos por categoría
   */
  async obtenerProductosPorCategoria(id: number): Promise<any> {
    const categoria = await this.buscarPorId(id);
    return {
      categoria: {
        id: categoria.id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
      },
      productos: categoria.productos,
      total: categoria.productos.length,
    };
  }

  /**
   * Restaurar categoría eliminada
   */
  async restaurar(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id, activo: false },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada o ya está activa`);
    }

    categoria.activo = true;
    return this.categoriaRepository.save(categoria);
  }

  /**
   * Obtener categorías eliminadas
   */
  async listarEliminadas(): Promise<Categoria[]> {
    return this.categoriaRepository.find({
      where: { activo: false },
      relations: { productos: true },
      order: { fechaActualizacion: 'DESC' },
    });
  }

  /**
   * Contar categorías activas
   */
  async contarActivas(): Promise<number> {
    return this.categoriaRepository.count({
      where: { activo: true },
    });
  }

  /**
   * Buscar categorías por nombre (búsqueda parcial)
   */
  async buscarPorTexto(texto: string): Promise<Categoria[]> {
    const termino = texto?.trim();

    if (!termino) {
      return [];
    }

    return this.categoriaRepository
      .createQueryBuilder('categoria')
      .where('LOWER(categoria.nombre) LIKE LOWER(:texto)', { texto: `%${termino}%` })
      .andWhere('categoria.activo = :activo', { activo: true })
      .orderBy('categoria.nombre', 'ASC')
      .getMany();
  }
}