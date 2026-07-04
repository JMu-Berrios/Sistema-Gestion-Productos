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
exports.VentasController = void 0;
const common_1 = require("@nestjs/common");
const ventas_service_1 = require("./ventas.service");
const crear_venta_dto_1 = require("./dto/crear-venta.dto");
const actualizar_venta_dto_1 = require("./dto/actualizar-venta.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let VentasController = class VentasController {
    constructor(ventasService) {
        this.ventasService = ventasService;
    }
    crear(crearVentaDto, req) {
        const usuarioId = req.user.id;
        return this.ventasService.crear(crearVentaDto, usuarioId);
    }
    listarTodos() {
        return this.ventasService.listarTodos();
    }
    listarMisVentas(req) {
        const usuarioId = req.user.id;
        return this.ventasService.listarPorUsuario(usuarioId);
    }
    buscarPorId(id) {
        return this.ventasService.buscarPorId(id);
    }
    listarPorCliente(clienteId) {
        return this.ventasService.listarPorUsuario(clienteId);
    }
    actualizar(id, actualizarVentaDto) {
        return this.ventasService.actualizar(id, actualizarVentaDto);
    }
    eliminar(id) {
        return this.ventasService.eliminar(id);
    }
    obtenerReporteMensual(anio, mes) {
        return this.ventasService.obtenerReporteMensual(anio, mes);
    }
    obtenerReportePorRango(fechaInicio, fechaFin) {
        return this.ventasService.obtenerReportePorRango(fechaInicio, fechaFin);
    }
    obtenerEstadisticas() {
        return this.ventasService.obtenerEstadisticas();
    }
};
exports.VentasController = VentasController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crear_venta_dto_1.CrearVentaDto, Object]),
    __metadata("design:returntype", void 0)
], VentasController.prototype, "crear", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VentasController.prototype, "listarTodos", null);
__decorate([
    (0, common_1.Get)('mis-ventas'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VentasController.prototype, "listarMisVentas", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VentasController.prototype, "buscarPorId", null);
__decorate([
    (0, common_1.Get)('cliente/:clienteId'),
    __param(0, (0, common_1.Param)('clienteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VentasController.prototype, "listarPorCliente", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, actualizar_venta_dto_1.ActualizarVentaDto]),
    __metadata("design:returntype", void 0)
], VentasController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VentasController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Get)('reporte/mensual/:anio/:mes'),
    __param(0, (0, common_1.Param)('anio')),
    __param(1, (0, common_1.Param)('mes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], VentasController.prototype, "obtenerReporteMensual", null);
__decorate([
    (0, common_1.Get)('reporte/rango'),
    __param(0, (0, common_1.Query)('fechaInicio')),
    __param(1, (0, common_1.Query)('fechaFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VentasController.prototype, "obtenerReportePorRango", null);
__decorate([
    (0, common_1.Get)('estadisticas/resumen'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VentasController.prototype, "obtenerEstadisticas", null);
exports.VentasController = VentasController = __decorate([
    (0, common_1.Controller)('ventas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ventas_service_1.VentasService])
], VentasController);
//# sourceMappingURL=ventas.controller.js.map