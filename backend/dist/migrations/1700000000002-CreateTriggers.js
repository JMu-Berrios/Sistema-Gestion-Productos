"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTriggers1700000000002 = void 0;
class CreateTriggers1700000000002 {
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TRIGGER IF NOT EXISTS validar_stock_venta
      BEFORE INSERT ON detalles_venta
      FOR EACH ROW
      BEGIN
        DECLARE v_stock_disponible INT;
        
        SELECT stock INTO v_stock_disponible 
        FROM productos 
        WHERE id = NEW.producto_id;
        
        IF v_stock_disponible < NEW.cantidad THEN
          SIGNAL SQLSTATE '45000' 
          SET MESSAGE_TEXT = 'Stock insuficiente para el producto';
        END IF;
      END
    `);
        await queryRunner.query(`
      CREATE TRIGGER IF NOT EXISTS actualizar_total_venta
      AFTER INSERT ON detalles_venta
      FOR EACH ROW
      BEGIN
        UPDATE ventas 
        SET total = (
          SELECT SUM(subtotal) 
          FROM detalles_venta 
          WHERE venta_id = NEW.venta_id
        )
        WHERE id = NEW.venta_id;
      END
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS logs_productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        accion VARCHAR(50) NOT NULL,
        datos_anteriores JSON,
        datos_nuevos JSON,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`
      CREATE TRIGGER IF NOT EXISTS log_actualizacion_producto
      AFTER UPDATE ON productos
      FOR EACH ROW
      BEGIN
        IF OLD.nombre != NEW.nombre OR OLD.precio != NEW.precio OR OLD.stock != NEW.stock THEN
          INSERT INTO logs_productos (producto_id, accion, datos_anteriores, datos_nuevos)
          VALUES (
            NEW.id,
            'ACTUALIZACION',
            JSON_OBJECT('nombre', OLD.nombre, 'precio', OLD.precio, 'stock', OLD.stock),
            JSON_OBJECT('nombre', NEW.nombre, 'precio', NEW.precio, 'stock', NEW.stock)
          );
        END IF;
      END
    `);
        await queryRunner.query(`
      CREATE TRIGGER IF NOT EXISTS log_eliminacion_producto
      AFTER UPDATE ON productos
      FOR EACH ROW
      BEGIN
        IF OLD.activo = TRUE AND NEW.activo = FALSE THEN
          INSERT INTO logs_productos (producto_id, accion, datos_anteriores, datos_nuevos)
          VALUES (
            NEW.id,
            'ELIMINACION',
            JSON_OBJECT('nombre', OLD.nombre, 'stock', OLD.stock),
            JSON_OBJECT('nombre', NEW.nombre, 'activo', FALSE)
          );
        END IF;
      END
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TRIGGER IF EXISTS log_eliminacion_producto');
        await queryRunner.query('DROP TRIGGER IF EXISTS log_actualizacion_producto');
        await queryRunner.query('DROP TRIGGER IF EXISTS actualizar_total_venta');
        await queryRunner.query('DROP TRIGGER IF EXISTS validar_stock_venta');
        await queryRunner.query('DROP TABLE IF EXISTS logs_productos');
    }
}
exports.CreateTriggers1700000000002 = CreateTriggers1700000000002;
//# sourceMappingURL=1700000000002-CreateTriggers.js.map