import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export class SeedAdminUser1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Admin123', salt);

    await queryRunner.query(`
      INSERT INTO usuarios (nombre, apellido, email, password, rol, activo)
      VALUES ('Admin', 'Sistema', 'admin@example.com', '${passwordHash}', 'admin', true)
      ON DUPLICATE KEY UPDATE 
        password = '${passwordHash}',
        rol = 'admin',
        activo = true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM usuarios WHERE email = 'admin@example.com'`);
  }
}