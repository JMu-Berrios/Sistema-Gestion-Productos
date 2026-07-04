"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedAdminUser1700000000004 = void 0;
const bcrypt = __importStar(require("bcryptjs"));
class SeedAdminUser1700000000004 {
    async up(queryRunner) {
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
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM usuarios WHERE email = 'admin@example.com'`);
    }
}
exports.SeedAdminUser1700000000004 = SeedAdminUser1700000000004;
//# sourceMappingURL=1700000000004-SeedAdminUser.js.map