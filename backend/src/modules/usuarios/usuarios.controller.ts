import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Post()
  crear(@Body() crearUsuarioDto: CrearUsuarioDto) {
    return this.usuariosService.crear(crearUsuarioDto);
  }

  @Get()
  listarTodos() {
    return this.usuariosService.listarTodos();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: number) {
    return this.usuariosService.buscarPorId(id);
  }

  @Put(':id')
  actualizar(@Param('id') id: number, @Body() actualizarUsuarioDto: ActualizarUsuarioDto) {
    return this.usuariosService.actualizar(id, actualizarUsuarioDto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: number) {
    return this.usuariosService.eliminar(id);
  }

  @Put(':id/cambiar-password')
  cambiarPassword(
    @Param('id') id: number,
    @Body() body: { passwordActual: string; nuevaPassword: string; confirmarPassword: string },
  ) {
    return this.usuariosService.cambiarPassword(
      id,
      body.passwordActual,
      body.nuevaPassword,
      body.confirmarPassword,
    );
  }
}