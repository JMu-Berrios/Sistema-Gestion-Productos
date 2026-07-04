import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
export declare class UsuariosController {
    private usuariosService;
    constructor(usuariosService: UsuariosService);
    crear(crearUsuarioDto: CrearUsuarioDto): Promise<import("../auth/entities/usuario.entity").Usuario>;
    listarTodos(): Promise<import("../auth/entities/usuario.entity").Usuario[]>;
    buscarPorId(id: number): Promise<import("../auth/entities/usuario.entity").Usuario>;
    actualizar(id: number, actualizarUsuarioDto: ActualizarUsuarioDto): Promise<import("../auth/entities/usuario.entity").Usuario>;
    eliminar(id: number): Promise<void>;
    cambiarPassword(id: number, body: {
        passwordActual: string;
        nuevaPassword: string;
        confirmarPassword: string;
    }): Promise<void>;
}
