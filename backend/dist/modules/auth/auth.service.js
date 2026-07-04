"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const usuario_entity_1 = require("./entities/usuario.entity");
let AuthService = class AuthService {
    constructor(usuarioRepository, jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
    }
    async registrar(registerDto) {
        const usuarioExistente = await this.usuarioRepository.findOne({
            where: { email: registerDto.email },
        });
        if (usuarioExistente) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        if (registerDto.password !== registerDto.confirmPassword) {
            throw new common_1.BadRequestException('Las contraseñas no coinciden');
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(registerDto.password, salt);
        const nuevoUsuario = this.usuarioRepository.create({
            nombre: registerDto.nombre,
            apellido: registerDto.apellido,
            email: registerDto.email,
            password: passwordHash,
            telefono: registerDto.telefono || null,
            direccion: registerDto.direccion || null,
            rol: 'usuario',
            activo: true,
        });
        await this.usuarioRepository.save(nuevoUsuario);
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
                telefono: nuevoUsuario.telefono,
                direccion: nuevoUsuario.direccion,
                rol: nuevoUsuario.rol,
            },
        };
    }
    async login(loginDto) {
        const usuario = await this.usuarioRepository
            .createQueryBuilder('usuario')
            .addSelect('usuario.password')
            .where('usuario.email = :email', { email: loginDto.email })
            .getOne();
        if (!usuario) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        if (!usuario.activo) {
            throw new common_1.UnauthorizedException('Usuario desactivado');
        }
        const passwordValida = await bcrypt.compare(loginDto.password, usuario.password);
        if (!passwordValida) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        usuario.ultimoAcceso = new Date();
        await this.usuarioRepository.save(usuario);
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
                telefono: usuario.telefono,
                direccion: usuario.direccion,
                rol: usuario.rol,
            },
        };
    }
    async validarUsuario(id) {
        return this.usuarioRepository.findOne({ where: { id, activo: true } });
    }
    async validarUsuarioPorEmail(email) {
        return this.usuarioRepository.findOne({ where: { email, activo: true } });
    }
    async obtenerUsuarioConPassword(id) {
        return this.usuarioRepository
            .createQueryBuilder('usuario')
            .addSelect('usuario.password')
            .where('usuario.id = :id', { id })
            .getOne();
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map