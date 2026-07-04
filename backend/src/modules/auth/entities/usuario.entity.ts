import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Venta } from '../../ventas/entities/venta.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ nullable: true, length: 20 })
  telefono: string;

  @Column({ nullable: true, length: 255 })
  direccion: string;

  @Column({ nullable: true, length: 50 })
  rol: string;

  @Column({ name: 'ultimo_acceso', nullable: true })
  ultimoAcceso: Date;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;

  // Relación con ventas
  @OneToMany(() => Venta, venta => venta.usuario)
  ventas: Venta[];
}