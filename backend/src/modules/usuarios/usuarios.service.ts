import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../auth/entities/usuario.entity';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async crear(crearUsuarioDto: CrearUsuarioDto): Promise<Usuario> {
    // Verificar si el email ya existe
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: { email: crearUsuarioDto.email },
    });

    if (usuarioExistente) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar que las contraseñas coincidan
    if (crearUsuarioDto.password !== crearUsuarioDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(crearUsuarioDto.password, salt);

    const usuario = this.usuarioRepository.create({
      nombre: crearUsuarioDto.nombre,
      apellido: crearUsuarioDto.apellido,
      email: crearUsuarioDto.email,
      password: passwordHash,
    });

    return this.usuarioRepository.save(usuario);
  }

  async listarTodos(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        activo: true,
        fechaCreacion: true,
        fechaActualizacion: true,
      },
    });
  }

  async buscarPorId(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id, activo: true },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        activo: true,
        fechaCreacion: true,
        fechaActualizacion: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async actualizar(id: number, actualizarUsuarioDto: ActualizarUsuarioDto): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id, activo: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si se actualiza el email, verificar que no exista otro usuario con ese email
    if (actualizarUsuarioDto.email && actualizarUsuarioDto.email !== usuario.email) {
      const usuarioExistente = await this.usuarioRepository.findOne({
        where: { email: actualizarUsuarioDto.email },
      });

      if (usuarioExistente) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    Object.assign(usuario, actualizarUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  async eliminar(id: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id, activo: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Soft delete: marcar como inactivo
    usuario.activo = false;
    await this.usuarioRepository.save(usuario);
  }

  async cambiarPassword(
    id: number,
    passwordActual: string,
    nuevaPassword: string,
    confirmarPassword: string,
  ): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id, activo: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar la contraseña actual
    const passwordValida = await bcrypt.compare(passwordActual, usuario.password);
    if (!passwordValida) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    // Verificar que la nueva contraseña y la confirmación coincidan
    if (nuevaPassword !== confirmarPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Validar que la nueva contraseña sea fuerte
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!regex.test(nuevaPassword)) {
      throw new BadRequestException(
        'La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
      );
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(nuevaPassword, salt);

    usuario.password = passwordHash;
    await this.usuarioRepository.save(usuario);
  }
}