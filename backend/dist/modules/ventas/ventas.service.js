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
exports.VentasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const venta_entity_1 = require("./entities/venta.entity");
const detalle_venta_entity_1 = require("./entities/detalle-venta.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
let VentasService = class VentasService {
    constructor(ventaRepository, detalleVentaRepository, productoRepository, dataSource) {
        this.ventaRepository = ventaRepository;
        this.detalleVentaRepository = detalleVentaRepository;
        this.productoRepository = productoRepository;
        this.dataSource = dataSource;
    }
    async crear(crearVentaDto, usuarioId) {
        for (const item of crearVentaDto.detalles) {
            const producto = await this.productoRepository.findOne({
                where: { id: item.productoId, activo: true },
            });
            if (!producto) {
                throw new common_1.BadRequestException(`Producto con ID ${item.productoId} no encontrado`);
            }
            if (producto.stock < item.cantidad) {
                throw new common_1.BadRequestException(`Stock insuficiente para el producto ${producto.nombre}. Disponible: ${producto.stock}`);
            }
        }
        const productosJson = JSON.stringify(crearVentaDto.detalles.map(item => ({
            producto_id: item.productoId,
            cantidad: item.cantidad,
        })));
        const result = await this.dataSource.query(`CALL crear_venta(?, ?, @venta_id)`, [usuarioId, productosJson]);
        const [ventaIdResult] = await this.dataSource.query(`SELECT @venta_id as venta_id`);
        const ventaId = ventaIdResult.venta_id;
        const venta = await this.ventaRepository.findOne({
            where: { id: ventaId },
            relations: {
                usuario: true,
                detalles: {
                    producto: {
                        categoria: true,
                    },
                },
            },
        });
        if (!venta) {
            throw new common_1.NotFoundException('Venta no encontrada después de crearla');
        }
        return venta;
    }
    async listarTodos() {
        return this.ventaRepository.find({
            relations: {
                usuario: true,
                detalles: {
                    producto: true,
                },
            },
            order: { fechaCreacion: 'DESC' },
        });
    }
    async listarPorUsuario(usuarioId) {
        return this.ventaRepository.find({
            where: { usuarioId },
            relations: {
                detalles: {
                    producto: true,
                },
            },
            order: { fechaCreacion: 'DESC' },
        });
    }
    async buscarPorId(id) {
        const venta = await this.ventaRepository.findOne({
            where: { id },
            relations: {
                usuario: true,
                detalles: {
                    producto: {
                        categoria: true,
                    },
                },
            },
        });
        if (!venta) {
            throw new common_1.NotFoundException('Venta no encontrada');
        }
        return venta;
    }
    async actualizar(id, actualizarVentaDto) {
        const venta = await this.buscarPorId(id);
        if (actualizarVentaDto.estado) {
        }
        return this.ventaRepository.save(venta);
    }
    async eliminar(id) {
        const venta = await this.buscarPorId(id);
        await this.ventaRepository.remove(venta);
    }
    async obtenerReporteMensual(anio, mes) {
        const fechaInicio = new Date(anio, mes - 1, 1);
        const fechaFin = new Date(anio, mes, 0);
        const ventas = await this.ventaRepository.find({
            where: {
                fechaCreacion: (0, typeorm_2.Between)(fechaInicio, fechaFin),
            },
            relations: {
                detalles: true,
            },
        });
        const totalVentas = ventas.length;
        const totalMonto = ventas.reduce((sum, venta) => sum + venta.total, 0);
        const promedioVenta = totalVentas > 0 ? totalMonto / totalVentas : 0;
        return {
            anio,
            mes,
            totalVentas,
            totalMonto,
            promedioVenta,
            ventas,
        };
    }
    async obtenerReportePorRango(fechaInicio, fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const ventas = await this.ventaRepository.find({
            where: {
                fechaCreacion: (0, typeorm_2.Between)(inicio, fin),
            },
            relations: {
                usuario: true,
                detalles: true,
            },
            order: { fechaCreacion: 'DESC' },
        });
        const totalVentas = ventas.length;
        const totalMonto = ventas.reduce((sum, venta) => sum + venta.total, 0);
        return {
            fechaInicio: inicio,
            fechaFin: fin,
            totalVentas,
            totalMonto,
            ventas,
        };
    }
    async obtenerEstadisticas() {
        const totalVentas = await this.ventaRepository.count();
        const totalMontoResult = await this.ventaRepository
            .createQueryBuilder('venta')
            .select('SUM(venta.total)', 'total')
            .getRawOne();
        const ventasHoy = await this.ventaRepository.count({
            where: {
                fechaCreacion: (0, typeorm_2.MoreThanOrEqual)(new Date(new Date().setHours(0, 0, 0, 0))),
            },
        });
        const ventasSemana = await this.ventaRepository.count({
            where: {
                fechaCreacion: (0, typeorm_2.MoreThanOrEqual)(new Date(new Date().setDate(new Date().getDate() - 7))),
            },
        });
        const ventasMes = await this.ventaRepository.count({
            where: {
                fechaCreacion: (0, typeorm_2.MoreThanOrEqual)(new Date(new Date().setDate(new Date().getDate() - 30))),
            },
        });
        const productosMasVendidos = await this.detalleVentaRepository
            .createQueryBuilder('detalle')
            .select('detalle.productoId', 'productoId')
            .addSelect('SUM(detalle.cantidad)', 'totalVendido')
            .addSelect('producto.nombre', 'nombreProducto')
            .innerJoin('detalle.producto', 'producto')
            .groupBy('detalle.productoId')
            .orderBy('totalVendido', 'DESC')
            .limit(5)
            .getRawMany();
        return {
            totalVentas,
            totalMonto: parseFloat(totalMontoResult?.total || 0),
            ventasHoy,
            ventasSemana,
            ventasMes,
            productosMasVendidos,
        };
    }
};
exports.VentasService = VentasService;
exports.VentasService = VentasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(venta_entity_1.Venta)),
    __param(1, (0, typeorm_1.InjectRepository)(detalle_venta_entity_1.DetalleVenta)),
    __param(2, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], VentasService);
//# sourceMappingURL=ventas.service.js.map