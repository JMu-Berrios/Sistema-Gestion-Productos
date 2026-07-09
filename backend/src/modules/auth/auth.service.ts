import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async registrar(registerDto: RegisterDto): Promise<{ token: string; usuario: any }> {
    // Verificar si el usuario ya existe
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: { email: registerDto.email },
    });

    if (usuarioExistente) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar que las contraseñas coincidan
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Encriptar contraseña con SHA-256 a través de bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    // Crear usuario con todos los campos
    const nuevoUsuario = this.usuarioRepository.create({
      nombre: registerDto.nombre,
      apellido: registerDto.apellido,
      email: registerDto.email,
      password: passwordHash,
      rol: 'usuario', // Rol por defecto
      activo: true,
    });

    await this.usuarioRepository.save(nuevoUsuario);

    // Generar token
    const token = this.jwtService.sign({
      id: nuevoUsuario.id,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol,
    });

    return {
      token,
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<{ token: string; usuario: any }> {
    // Buscar usuario incluyendo la contraseña
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.password')
      .where('usuario.email = :email', { email: loginDto.email })
      .getOne();

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(loginDto.password, usuario.password);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último acceso
    usuario.ultimoAcceso = new Date();
    await this.usuarioRepository.save(usuario);

    // Generar token
    const token = this.jwtService.sign({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }

  async validarUsuario(id: number): Promise<Usuario> {
    return this.usuarioRepository.findOne({ where: { id, activo: true } });
  }

  async validarUsuarioPorEmail(email: string): Promise<Usuario> {
    return this.usuarioRepository.findOne({ where: { email, activo: true } });
  }

  async obtenerUsuarioConPassword(id: number): Promise<Usuario> {
    return this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.password')
      .where('usuario.id = :id', { id })
      .getOne();
  }
}