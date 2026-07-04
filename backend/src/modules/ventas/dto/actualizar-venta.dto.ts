import { IsOptional, IsString, IsIn } from 'class-validator';

export class ActualizarVentaDto {
  @IsOptional()
  @IsString()
  @IsIn(['pendiente', 'completada', 'cancelada'], {
    message: 'El estado debe ser pendiente, completada o cancelada',
  })
  estado?: string;
}