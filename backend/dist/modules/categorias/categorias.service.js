"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const categoria_entity_1 = require("./entities/categoria.entity");
let CategoriasService = class CategoriasService {
    constructor(categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }
    normalizarNombre(nombre) {
        return nombre.trim();
    }
    async nombreDuplicado(nombre, excludeId) {
        const qb = this.categoriaRepository.createQueryBuilder('categoria');
        qb.where('LOWER(categoria.nombre) = LOWER(:nombre)', { nombre: this.normalizarNombre(nombre) });
        if (excludeId) {
            qb.andWhere('categoria.id != :excludeId', { excludeId });
        }
        return (await qb.getCount()) > 0;
    }
    async crear(crearCategoriaDto) {
        const nombre = this.normalizarNombre(crearCategoriaDto.nombre);
        if (await this.nombreDuplicado(nombre)) {
            throw new common_1.ConflictException('El nombre de la categoría ya existe');
        }
        const categoria = this.categoriaRepository.create({
            nombre,
            descripcion: crearCategoriaDto.descripcion,
            activo: true,
        });
        return this.categoriaRepository.save(categoria);
    }
    async listarTodos() {
        return this.categoriaRepository.find({
            where: { activo: true },
            relations: { productos: true },
            order: { nombre: 'ASC' },
        });
    }
    async buscarPorId(id) {
        const categoria = await this.categoriaRepository.findOne({
            where: { id, activo: true },
            relations: { productos: true },
        });
        if (!categoria) {
            throw new common_1.NotFoundException(`Categoría con ID ${id} no encontrada`);
        }
        return categoria;
    }
    async buscarPorIdIncluyendoInactivas(id) {
        const categoria = await this.categoriaRepository.findOne({
            where: { id },
            relations: { productos: true },
        });
        if (!categoria) {
            throw new common_1.NotFoundException(`Categoría con ID ${id} no encontrada`);
        }
        return categoria;
    }
    async buscarPorNombre(nombre) {
        const normalized = this.normalizarNombre(nombre);
        return this.categoriaRepository
            .createQueryBuilder('categoria')
            .where('LOWER(categoria.nombre) = LOWER(:nombre)', { nombre: normalized })
            .andWhere('categoria.activo = :activo', { activo: true })
            .getOne();
    }
    async actualizar(id, actualizarCategoriaDto) {
        const categoria = await this.buscarPorId(id);
        const { nombre, descripcion } = actualizarCategoriaDto;
        if (nombre && nombre.trim() !== categoria.nombre) {
            if (await this.nombreDuplicado(nombre, id)) {
                throw new common_1.ConflictException('El nombre de la categoría ya existe');
            }
            categoria.nombre = this.normalizarNombre(nombre);
        }
        if (descripcion !== undefined) {
            categoria.descripcion = descripcion;
        }
        return this.categoriaRepository.save(categoria);
    }
    async eliminar(id) {
        const categoria = await this.buscarPorId(id);
        if (categoria.productos && categoria.productos.length > 0) {
            const productosActivos = categoria.productos.filter(p => p.activo !== false);
            if (productosActivos.length > 0) {
                throw new common_1.BadRequestException(`No se puede eliminar la categoría porque tiene ${productosActivos.length} productos asociados. Primero elimina o reasigna los productos.`);
            }
        }
        categoria.activo = false;
        await this.categoriaRepository.save(categoria);
    }
    async eliminarFisicamente(id) {
        const categoria = await this.buscarPorIdIncluyendoInactivas(id);
        if (categoria.productos && categoria.productos.length > 0) {
            throw new common_1.BadRequestException(`No se puede eliminar la categoría porque tiene ${categoria.productos.length} productos asociados.`);
        }
        await this.categoriaRepository.remove(categoria);
    }
    async obtenerProductosPorCategoria(id) {
        const categoria = await this.buscarPorId(id);
        return {
            categoria: {
                id: categoria.id,
                nombre: categoria.nombre,
                descripcion: categoria.descripcion,
            },
            productos: categoria.productos,
            total: categoria.productos.length,
        };
    }
    async restaurar(id) {
        const categoria = await this.categoriaRepository.findOne({
            where: { id, activo: false },
        });
        if (!categoria) {
            throw new common_1.NotFoundException(`Categoría con ID ${id} no encontrada o ya está activa`);
        }
        categoria.activo = true;
        return this.categoriaRepository.save(categoria);
    }
    async listarEliminadas() {
        return this.categoriaRepository.find({
            where: { activo: false },
            relations: { productos: true },
            order: { fechaActualizacion: 'DESC' },
        });
    }
    async contarActivas() {
        return this.categoriaRepository.count({
            where: { activo: true },
        });
    }
    async buscarPorTexto(texto) {
        const termino = texto?.trim();
        if (!termino) {
            return [];
        }
        return this.categoriaRepository
            .createQueryBuilder('categoria')
            .where('LOWER(categoria.nombre) LIKE LOWER(:texto)', { texto: `%${termino}%` })
            .andWhere('categoria.activo = :activo', { activo: true })
            .orderBy('categoria.nombre', 'ASC')
            .getMany();
    }
};
exports.CategoriasService = CategoriasService;
exports.CategoriasService = CategoriasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(categoria_entity_1.Categoria)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriasService);
//# sourceMappingURL=categorias.service.js.map