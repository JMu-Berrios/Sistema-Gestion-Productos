import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { ProductosModule } from './modules/productos/productos.module';
import { CategoriasModule } from './modules/categorias/categorias.module';
import { VentasModule } from './modules/ventas/ventas.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => databaseConfig(configService),
      inject: [ConfigService],
    }),
    AuthModule,
    ProductosModule,
    CategoriasModule,
    VentasModule,
    UsuariosModule,
  ],
})
export class AppModule {}