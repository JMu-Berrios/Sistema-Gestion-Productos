import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Usuario } from '../../auth/entities/usuario.entity';
import { DetalleVenta } from './detalle-venta.entity';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  numeroFactura: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column()
  usuarioId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToMany(() => DetalleVenta, detalle => detalle.venta)
  detalles: DetalleVenta[];

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;
}