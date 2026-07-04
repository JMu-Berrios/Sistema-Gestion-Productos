"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserFields1700000000003 = void 0;
class AddUserFields1700000000003 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20) NULL`);
        await queryRunner.query(`ALTER TABLE usuarios ADD COLUMN direccion VARCHAR(255) NULL`);
        await queryRunner.query(`ALTER TABLE usuarios ADD COLUMN rol VARCHAR(50) DEFAULT 'usuario'`);
        await queryRunner.query(`ALTER TABLE usuarios ADD COLUMN ultimo_acceso TIMESTAMP NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE usuarios DROP COLUMN telefono`);
        await queryRunner.query(`ALTER TABLE usuarios DROP COLUMN direccion`);
        await queryRunner.query(`ALTER TABLE usuarios DROP COLUMN rol`);
        await queryRunner.query(`ALTER TABLE usuarios DROP COLUMN ultimo_acceso`);
    }
}
exports.AddUserFields1700000000003 = AddUserFields1700000000003;
//# sourceMappingURL=1700000000003-AddUserFields.js.map