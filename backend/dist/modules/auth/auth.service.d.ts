import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from './entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private usuarioRepository;
    private jwtService;
    constructor(usuarioRepository: Repository<Usuario>, jwtService: JwtService);
    registrar(registerDto: RegisterDto): Promise<{
        token: string;
        usuario: any;
    }>;
    login(loginDto: LoginDto): Promise<{
        token: string;
        usuario: any;
    }>;
    validarUsuario(id: number): Promise<Usuario>;
    validarUsuarioPorEmail(email: string): Promise<Usuario>;
    obtenerUsuarioConPassword(id: number): Promise<Usuario>;
}
