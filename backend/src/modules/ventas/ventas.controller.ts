import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CrearVentaDto } from './dto/crear-venta.dto';
import { ActualizarVentaDto } from './dto/actualizar-venta.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('ventas')
@UseGuards(JwtAuthGuard)
export class VentasController {
  constructor(private ventasService: VentasService) {}

  @Post()
  crear(@Body() crearVentaDto: CrearVentaDto, @Req() req: any) {
    // El usuario ID viene del token JWT
    const usuarioId = req.user.id;
    return this.ventasService.crear(crearVentaDto, usuarioId);
  }

  @Get()
  listarTodos() {
    return this.ventasService.listarTodos();
  }

  @Get('mis-ventas')
  listarMisVentas(@Req() req: any) {
    const usuarioId = req.user.id;
    return this.ventasService.listarPorUsuario(usuarioId);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: number) {
    return this.ventasService.buscarPorId(id);
  }

  @Get('cliente/:clienteId')
  listarPorCliente(@Param('clienteId') clienteId: number) {
    return this.ventasService.listarPorUsuario(clienteId);
  }

  @Put(':id')
  actualizar(@Param('id') id: number, @Body() actualizarVentaDto: ActualizarVentaDto) {
    return this.ventasService.actualizar(id, actualizarVentaDto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: number) {
    return this.ventasService.eliminar(id);
  }

  @Get('reporte/mensual/:anio/:mes')
  obtenerReporteMensual(@Param('anio') anio: number, @Param('mes') mes: number) {
    return this.ventasService.obtenerReporteMensual(anio, mes);
  }

  @Get('reporte/rango')
  obtenerReportePorRango(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.ventasService.obtenerReportePorRango(fechaInicio, fechaFin);
  }

  @Get('estadisticas/resumen')
  obtenerEstadisticas() {
    return this.ventasService.obtenerEstadisticas();
  }
}