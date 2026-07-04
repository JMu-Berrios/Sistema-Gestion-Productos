import { IsNotEmpty, IsString, IsNumber, Min, MaxLength, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearProductoDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  nombre: string;

  @IsNotEmpty({ message: 'La descripción es requerida' })
  descripcion: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  @Type(() => Number)
  precio: number;

  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  @Type(() => Number)
  stock: number;

  @IsPositive({ message: 'La categoría debe ser válida' })
  @Type(() => Number)
  categoriaId: number;

  @IsNotEmpty({ message: 'El código es requerido' })
  @MaxLength(50, { message: 'El código no puede exceder 50 caracteres' })
  codigo: string;
}