import { IsNotEmpty, IsString, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class CrearCategoriaDto {
  @IsNotEmpty({ message: 'El nombre de la categoría es requerido' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}