import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { Producto } from '../productos/entities/producto.entity';
import { CrearVentaDto } from './dto/crear-venta.dto';
import { ActualizarVentaDto } from './dto/actualizar-venta.dto';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventaRepository: Repository<Venta>,
    @InjectRepository(DetalleVenta)
    private detalleVentaRepository: Repository<DetalleVenta>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    private dataSource: DataSource,
  ) {}

  async crear(crearVentaDto: CrearVentaDto, usuarioId: number): Promise<Venta> {
    // Validar que todos los productos existan y tengan stock suficiente
    for (const item of crearVentaDto.detalles) {
      const producto = await this.productoRepository.findOne({
        where: { id: item.productoId, activo: true },
      });

      if (!producto) {
        throw new BadRequestException(`Producto con ID ${item.productoId} no encontrado`);
      }

      if (producto.stock < item.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para el producto ${producto.nombre}. Disponible: ${producto.stock}`
        );
      }
    }

    // Usar el procedimiento almacenado para crear la venta
    const productosJson = JSON.stringify(
      crearVentaDto.detalles.map(item => ({
        producto_id: item.productoId,
        cantidad: item.cantidad,
      }))
    );

    const result = await this.dataSource.query(
      `CALL crear_venta(?, ?, @venta_id)`,
      [usuarioId, productosJson]
    );

    // Obtener el ID de la venta creada
    const [ventaIdResult] = await this.dataSource.query(`SELECT @venta_id as venta_id`);
    const ventaId = ventaIdResult.venta_id;

    // Obtener la venta completa con sus detalles
    const venta = await this.ventaRepository.findOne({
      where: { id: ventaId },
      relations: {
        usuario: true,
        detalles: {
          producto: {
            categoria: true,
          },
        },
      },
    });

    if (!venta) {
      throw new NotFoundException('Venta no encontrada después de crearla');
    }

    return venta;
  }

  async listarTodos(): Promise<Venta[]> {
    return this.ventaRepository.find({
      relations: {
        usuario: true,
        detalles: {
          producto: true,
        },
      },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async listarPorUsuario(usuarioId: number): Promise<Venta[]> {
    return this.ventaRepository.find({
      where: { usuarioId },
      relations: {
        detalles: {
          producto: true,
        },
      },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async buscarPorId(id: number): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: {
        usuario: true,
        detalles: {
          producto: {
            categoria: true,
          },
        },
      },
    });

    if (!venta) {
      throw new NotFoundException('Venta no encontrada');
    }

    return venta;
  }

  async actualizar(id: number, actualizarVentaDto: ActualizarVentaDto): Promise<Venta> {
    const venta = await this.buscarPorId(id);

    // Solo se puede actualizar el estado de la venta
    if (actualizarVentaDto.estado) {
      // Aquí se podría agregar lógica para cambiar el estado de la venta
      // Por ejemplo: 'pendiente', 'completada', 'cancelada'
    }

    return this.ventaRepository.save(venta);
  }

  async eliminar(id: number): Promise<void> {
    const venta = await this.buscarPorId(id);
    
    // Verificar si la venta se puede eliminar (por ejemplo, que no sea muy antigua)
    // Si es necesario, se podría implementar lógica de soft delete
    
    await this.ventaRepository.remove(venta);
  }

  async obtenerReporteMensual(anio: number, mes: number): Promise<any> {
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0);

    const ventas = await this.ventaRepository.find({
      where: {
        fechaCreacion: Between(fechaInicio, fechaFin),
      },
      relations: {
        detalles: true,
      },
    });

    const totalVentas = ventas.length;
    const totalMonto = ventas.reduce((sum, venta) => sum + venta.total, 0);
    const promedioVenta = totalVentas > 0 ? totalMonto / totalVentas : 0;

    return {
      anio,
      mes,
      totalVentas,
      totalMonto,
      promedioVenta,
      ventas,
    };
  }

  async obtenerReportePorRango(fechaInicio: string, fechaFin: string): Promise<any> {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    const ventas = await this.ventaRepository.find({
      where: {
        fechaCreacion: Between(inicio, fin),
      },
      relations: {
        usuario: true,
        detalles: true,
      },
      order: { fechaCreacion: 'DESC' },
    });

    const totalVentas = ventas.length;
    const totalMonto = ventas.reduce((sum, venta) => sum + venta.total, 0);

    return {
      fechaInicio: inicio,
      fechaFin: fin,
      totalVentas,
      totalMonto,
      ventas,
    };
  }

  async obtenerEstadisticas(): Promise<any> {
    const totalVentas = await this.ventaRepository.count();
    
    const totalMontoResult = await this.ventaRepository
      .createQueryBuilder('venta')
      .select('SUM(venta.total)', 'total')
      .getRawOne();

    const ventasHoy = await this.ventaRepository.count({
      where: {
        fechaCreacion: MoreThanOrEqual(new Date(new Date().setHours(0, 0, 0, 0))),
      },
    });

    const ventasSemana = await this.ventaRepository.count({
      where: {
        fechaCreacion: MoreThanOrEqual(new Date(new Date().setDate(new Date().getDate() - 7))),
      },
    });

    const ventasMes = await this.ventaRepository.count({
      where: {
        fechaCreacion: MoreThanOrEqual(new Date(new Date().setDate(new Date().getDate() - 30))),
      },
    });

    const productosMasVendidos = await this.detalleVentaRepository
      .createQueryBuilder('detalle')
      .select('detalle.productoId', 'productoId')
      .addSelect('SUM(detalle.cantidad)', 'totalVendido')
      .addSelect('producto.nombre', 'nombreProducto')
      .innerJoin('detalle.producto', 'producto')
      .groupBy('detalle.productoId')
      .orderBy('totalVendido', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      totalVentas,
      totalMonto: parseFloat(totalMontoResult?.total || 0),
      ventasHoy,
      ventasSemana,
      ventasMes,
      productosMasVendidos,
    };
  }
}