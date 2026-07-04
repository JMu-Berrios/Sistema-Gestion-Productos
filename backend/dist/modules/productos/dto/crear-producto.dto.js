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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrearProductoDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CrearProductoDto {
}
exports.CrearProductoDto = CrearProductoDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre es requerido' }),
    (0, class_validator_1.MaxLength)(200, { message: 'El nombre no puede exceder 200 caracteres' }),
    __metadata("design:type", String)
], CrearProductoDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La descripción es requerida' }),
    __metadata("design:type", String)
], CrearProductoDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido' }),
    (0, class_validator_1.Min)(0, { message: 'El precio no puede ser negativo' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CrearProductoDto.prototype, "precio", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'El stock debe ser un número entero' }),
    (0, class_validator_1.Min)(0, { message: 'El stock no puede ser negativo' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CrearProductoDto.prototype, "stock", void 0);
__decorate([
    (0, class_validator_1.IsPositive)({ message: 'La categoría debe ser válida' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CrearProductoDto.prototype, "categoriaId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El código es requerido' }),
    (0, class_validator_1.MaxLength)(50, { message: 'El código no puede exceder 50 caracteres' }),
    __metadata("design:type", String)
], CrearProductoDto.prototype, "codigo", void 0);
//# sourceMappingURL=crear-producto.dto.js.map