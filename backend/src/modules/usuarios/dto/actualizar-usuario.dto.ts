import { IsOptional, IsEmail, MaxLength, IsString } from 'class-validator';

export class ActualizarUsuarioDto {
  @IsOptional()
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  apellido?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido' })
  email?: string;

  @IsOptional()
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  telefono?: string;

  @IsOptional()
  @MaxLength(255, { message: 'La dirección no puede exceder 255 caracteres' })
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'El rol no puede exceder 50 caracteres' })
  rol?: string;
}