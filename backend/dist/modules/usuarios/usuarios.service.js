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
exports.UsuariosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const usuario_entity_1 = require("../auth/entities/usuario.entity");
let UsuariosService = class UsuariosService {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
    async crear(crearUsuarioDto) {
        const usuarioExistente = await this.usuarioRepository.findOne({
            where: { email: crearUsuarioDto.email },
        });
        if (usuarioExistente) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        if (crearUsuarioDto.password !== crearUsuarioDto.confirmPassword) {
            throw new common_1.BadRequestException('Las contraseñas no coinciden');
        }
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
    async listarTodos() {
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
    async buscarPorId(id) {
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
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        return usuario;
    }
    async actualizar(id, actualizarUsuarioDto) {
        const usuario = await this.usuarioRepository.findOne({
            where: { id, activo: true },
        });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        if (actualizarUsuarioDto.email && actualizarUsuarioDto.email !== usuario.email) {
            const usuarioExistente = await this.usuarioRepository.findOne({
                where: { email: actualizarUsuarioDto.email },
            });
            if (usuarioExistente) {
                throw new common_1.ConflictException('El email ya está registrado');
            }
        }
        Object.assign(usuario, actualizarUsuarioDto);
        return this.usuarioRepository.save(usuario);
    }
    async eliminar(id) {
        const usuario = await this.usuarioRepository.findOne({
            where: { id, activo: true },
        });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        usuario.activo = false;
        await this.usuarioRepository.save(usuario);
    }
    async cambiarPassword(id, passwordActual, nuevaPassword, confirmarPassword) {
        const usuario = await this.usuarioRepository.findOne({
            where: { id, activo: true },
        });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const passwordValida = await bcrypt.compare(passwordActual, usuario.password);
        if (!passwordValida) {
            throw new common_1.BadRequestException('Contraseña actual incorrecta');
        }
        if (nuevaPassword !== confirmarPassword) {
            throw new common_1.BadRequestException('Las contraseñas no coinciden');
        }
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!regex.test(nuevaPassword)) {
            throw new common_1.BadRequestException('La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(nuevaPassword, salt);
        usuario.password = passwordHash;
        await this.usuarioRepository.save(usuario);
    }
};
exports.UsuariosService = UsuariosService;
exports.UsuariosService = UsuariosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsuariosService);
//# sourceMappingURL=usuarios.service.js.map