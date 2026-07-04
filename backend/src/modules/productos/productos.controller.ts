import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('productos')
@UseGuards(JwtAuthGuard)
export class ProductosController {
  constructor(private productosService: ProductosService) {}

  @Post()
  crear(@Body() crearProductoDto: CrearProductoDto) {
    return this.productosService.crear(crearProductoDto);
  }

  @Get()
  listarTodos() {
    return this.productosService.listarTodos();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: number) {
    return this.productosService.buscarPorId(id);
  }

  @Put(':id')
  actualizar(@Param('id') id: number, @Body() actualizarProductoDto: ActualizarProductoDto) {
    return this.productosService.actualizar(id, actualizarProductoDto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: number) {
    return this.productosService.eliminar(id);
  }

  @Get('bajo-stock/:limite')
  obtenerBajoStock(@Param('limite') limite: number = 10) {
    return this.productosService.obtenerProductosBajoStock(limite);
  }
}