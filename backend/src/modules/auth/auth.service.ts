import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
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
      throw new ConflictException('Las contraseñas no coinciden');
    }

    // Encriptar contraseña con SHA-256 a través de bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    // Crear usuario
    const nuevoUsuario = this.usuarioRepository.create({
      nombre: registerDto.nombre,
      apellido: registerDto.apellido,
      email: registerDto.email,
      password: passwordHash,
    });

    await this.usuarioRepository.save(nuevoUsuario);

    // Generar token
    const token = this.jwtService.sign({
      id: nuevoUsuario.id,
      email: nuevoUsuario.email,
    });

    return {
      token,
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        email: nuevoUsuario.email,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<{ token: string; usuario: any }> {
    // Buscar usuario
    const usuario = await this.usuarioRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(loginDto.password, usuario.password);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token
    const token = this.jwtService.sign({
      id: usuario.id,
      email: usuario.email,
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
      },
    };
  }

  async validarUsuario(id: number): Promise<Usuario> {
    return this.usuarioRepository.findOne({ where: { id } });
  }
}