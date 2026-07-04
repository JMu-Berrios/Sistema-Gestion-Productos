import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserFields1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20) NULL`);
    await queryRunner.query(`ALTER TABLE usuarios ADD COLUMN direccion VARCHAR(255) NULL`);
    await queryRunner.query(`ALTER TABLE usuarios ADD COLUMN rol VARCHAR(50) DEFAULT 'usuario'`);
    await queryRunner.query(`ALTER TABLE usuarios ADD COLUMN ultimo_acceso TIMESTAMP NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE usuarios DROP COLUMN telefono`);
    await queryRunner.query(`ALTER TABLE usuarios DROP COLUMN direccion`);
    await queryRunner.query(`ALTER TABLE usuarios DROP COLUMN rol`);
    await queryRunner.query(`ALTER TABLE usuarios DROP COLUMN ultimo_acceso`);
  }
}