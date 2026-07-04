import { Repository } from 'typeorm';
import { Usuario } from '../auth/entities/usuario.entity';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
export declare class UsuariosService {
    private usuarioRepository;
    constructor(usuarioRepository: Repository<Usuario>);
    crear(crearUsuarioDto: CrearUsuarioDto): Promise<Usuario>;
    listarTodos(): Promise<Usuario[]>;
    buscarPorId(id: number): Promise<Usuario>;
    actualizar(id: number, actualizarUsuarioDto: ActualizarUsuarioDto): Promise<Usuario>;
    eliminar(id: number): Promise<void>;
    cambiarPassword(id: number, passwordActual: string, nuevaPassword: string, confirmarPassword: string): Promise<void>;
}
