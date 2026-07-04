import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProcedures1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Procedimiento para actualizar stock de producto
    await queryRunner.query(`
      CREATE PROCEDURE IF NOT EXISTS actualizar_stock_producto(
        IN p_producto_id INT,
        IN p_cantidad INT
      )
      BEGIN
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
          ROLLBACK;
          RESIGNAL;
        END;

        START TRANSACTION;
        
        UPDATE productos 
        SET stock = stock + p_cantidad,
            fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = p_producto_id;
        
        COMMIT;
      END
    `);

    // Procedimiento para crear venta
    await queryRunner.query(`
      CREATE PROCEDURE IF NOT EXISTS crear_venta(
        IN p_usuario_id INT,
        IN p_productos JSON,
        OUT p_venta_id INT
      )
      BEGIN
        DECLARE v_total DECIMAL(10,2) DEFAULT 0;
        DECLARE v_numero_factura VARCHAR(20);
        DECLARE v_producto_id INT;
        DECLARE v_cantidad INT;
        DECLARE v_precio DECIMAL(10,2);
        DECLARE v_subtotal DECIMAL(10,2);
        DECLARE v_index INT DEFAULT 0;
        DECLARE v_productos_length INT;

        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
          ROLLBACK;
          RESIGNAL;
        END;

        START TRANSACTION;

        -- Generar número de factura
        SET v_numero_factura = CONCAT('FAC-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 10000), 4, '0'));

        -- Calcular total
        SET v_productos_length = JSON_LENGTH(p_productos);
        
        WHILE v_index < v_productos_length DO
          SET v_producto_id = JSON_EXTRACT(p_productos, CONCAT('$[', v_index, '].producto_id'));
          SET v_cantidad = JSON_EXTRACT(p_productos, CONCAT('$[', v_index, '].cantidad'));
          
          SELECT precio INTO v_precio FROM productos WHERE id = v_producto_id AND activo = TRUE;
          SET v_subtotal = v_precio * v_cantidad;
          SET v_total = v_total + v_subtotal;
          
          SET v_index = v_index + 1;
        END WHILE;

        -- Insertar venta
        INSERT INTO ventas (numero_factura, total, usuario_id)
        VALUES (v_numero_factura, v_total, p_usuario_id);
        
        SET p_venta_id = LAST_INSERT_ID();

        -- Insertar detalles y actualizar stock
        SET v_index = 0;
        WHILE v_index < v_productos_length DO
          SET v_producto_id = JSON_EXTRACT(p_productos, CONCAT('$[', v_index, '].producto_id'));
          SET v_cantidad = JSON_EXTRACT(p_productos, CONCAT('$[', v_index, '].cantidad'));
          
          SELECT precio INTO v_precio FROM productos WHERE id = v_producto_id AND activo = TRUE;
          SET v_subtotal = v_precio * v_cantidad;
          
          INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal)
          VALUES (p_venta_id, v_producto_id, v_cantidad, v_precio, v_subtotal);
          
          -- Actualizar stock
          UPDATE productos SET stock = stock - v_cantidad WHERE id = v_producto_id;
          
          SET v_index = v_index + 1;
        END WHILE;

        COMMIT;
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP PROCEDURE IF EXISTS actualizar_stock_producto');
    await queryRunner.query('DROP PROCEDURE IF EXISTS crear_venta');
  }
}