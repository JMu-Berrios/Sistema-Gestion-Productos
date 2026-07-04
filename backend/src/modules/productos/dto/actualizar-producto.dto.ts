import { IsOptional, IsString, MaxLength, IsNumber, Min, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class ActualizarProductoDto {
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  @Type(() => Number)
  precio?: number;

  @IsOptional()
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsPositive({ message: 'La categoría debe ser válida' })
  @Type(() => Number)
  categoriaId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'El código no puede exceder 50 caracteres' })
  codigo?: string;
}
