import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    private dataSource: DataSource,
  ) {}

  async crear(crearProductoDto: CrearProductoDto): Promise<Producto> {
    // Validar que el código no exista
    const productoExistente = await this.productoRepository.findOne({
      where: { codigo: crearProductoDto.codigo },
    });

    if (productoExistente) {
      throw new BadRequestException('El código del producto ya existe');
    }

    const producto = this.productoRepository.create(crearProductoDto);
    return this.productoRepository.save(producto);
  }

  async listarTodos(): Promise<Producto[]> {
    return this.productoRepository.find({
      relations: ['categoria'],
      where: { activo: true },
    });
  }

  async buscarPorId(id: number): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      relations: ['categoria'],
      where: { id },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }

  async actualizar(id: number, actualizarProductoDto: ActualizarProductoDto): Promise<Producto> {
    const producto = await this.buscarPorId(id);

    // Si se actualiza el código, verificar que no exista otro producto con ese código
    if (actualizarProductoDto.codigo && actualizarProductoDto.codigo !== producto.codigo) {
      const productoExistente = await this.productoRepository.findOne({
        where: { codigo: actualizarProductoDto.codigo },
      });

      if (productoExistente) {
        throw new BadRequestException('El código del producto ya existe');
      }
    }

    Object.assign(producto, actualizarProductoDto);
    return this.productoRepository.save(producto);
  }

  async eliminar(id: number): Promise<void> {
    const producto = await this.buscarPorId(id);
    producto.activo = false;
    await this.productoRepository.save(producto);
  }

  async actualizarStock(id: number, cantidad: number): Promise<Producto> {
    const producto = await this.buscarPorId(id);
    
    // Ejecutar procedimiento almacenado para actualizar stock
    await this.dataSource.query(
      `CALL actualizar_stock_producto(?, ?)`,
      [id, cantidad],
    );

    return this.buscarPorId(id);
  }

  async obtenerProductosBajoStock(limite: number = 10): Promise<Producto[]> {
    return this.productoRepository
      .createQueryBuilder('producto')
      .where('producto.stock <= :limite', { limite })
      .andWhere('producto.activo = true')
      .orderBy('producto.stock', 'ASC')
      .getMany();
  }
}