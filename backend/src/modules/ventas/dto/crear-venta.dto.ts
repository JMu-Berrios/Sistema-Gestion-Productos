import { IsArray, ValidateNested, IsNotEmpty, IsInt, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

class DetalleVentaDto {
  @IsPositive({ message: 'El ID del producto debe ser válido' })
  productoId: number;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  cantidad: number;
}

export class CrearVentaDto {
  @IsArray({ message: 'Los detalles deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => DetalleVentaDto)
  detalles: DetalleVentaDto[];
}