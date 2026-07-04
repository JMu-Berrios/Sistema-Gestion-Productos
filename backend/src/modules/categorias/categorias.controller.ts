import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('categorias')
@UseGuards(JwtAuthGuard)
export class CategoriasController {
  constructor(private categoriasService: CategoriasService) {}

  @Post()
  crear(@Body() crearCategoriaDto: CrearCategoriaDto) {
    return this.categoriasService.crear(crearCategoriaDto);
  }

  @Get()
  listarTodos() {
    return this.categoriasService.listarTodos();
  }

  @Get('eliminadas')
  listarEliminadas() {
    return this.categoriasService.listarEliminadas();
  }

  @Get('buscar')
  buscarPorTexto(@Query('texto') texto: string) {
    return this.categoriasService.buscarPorTexto(texto);
  }

  @Get('contar')
  contarActivas() {
    return this.categoriasService.contarActivas();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.buscarPorId(id);
  }

  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarCategoriaDto: ActualizarCategoriaDto,
  ) {
    return this.categoriasService.actualizar(id, actualizarCategoriaDto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.eliminar(id);
  }

  @Delete(':id/fisico')
  eliminarFisicamente(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.eliminarFisicamente(id);
  }

  @Patch(':id/restaurar')
  restaurar(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.restaurar(id);
  }

  @Get(':id/productos')
  obtenerProductosPorCategoria(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.obtenerProductosPorCategoria(id);
  }
}