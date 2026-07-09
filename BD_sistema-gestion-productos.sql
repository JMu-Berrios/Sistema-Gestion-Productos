-- =========================================================================
-- SCRIPT DE BASE DE DATOS: SISTEMA DE INVENTARIO (5 TABLAS RELACIONADAS)
-- =========================================================================

CREATE DATABASE IF NOT EXISTS sistema_gestion;
USE sistema_gestion;

-- 1. TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. TABLA DE CATEGORÍAS
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    categoria_id INT NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 4. TABLA DE VENTAS (Cabecera de Factura)
CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_factura VARCHAR(20) NOT NULL UNIQUE,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    usuario_id INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 5. TABLA DE DETALLES DE VENTA (Cuerpo de Factura)
CREATE TABLE IF NOT EXISTS detalles_venta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (venta_id) REFERENCES ventas (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =========================================================================
-- AUTOMATIZACIONES: TRIGGERS (DISPARADORES)
-- =========================================================================

-- Trigger A: Calcula automáticamente el subtotal (cantidad * precio) antes de insertar la fila
DELIMITER $$
CREATE TRIGGER tg_detalles_venta_antes_insertar
BEFORE INSERT ON detalles_venta
FOR EACH ROW
BEGIN
    SET NEW.subtotal = NEW.cantidad * NEW.precio_unitario;
END$$
DELIMITER ;

-- Trigger B: Resta del inventario el stock del producto vendido de manera automática
DELIMITER $$
CREATE TRIGGER tg_detalles_venta_despues_insertar
AFTER INSERT ON detalles_venta
FOR EACH ROW
BEGIN
    UPDATE productos 
    SET stock = stock - NEW.cantidad 
    WHERE id = NEW.producto_id;
END$$
DELIMITER ;


-- =========================================================================
-- LOGICA REPETITIVA: PROCEDIMIENTOS ALMACENADOS
-- =========================================================================

-- Procedimiento para autogenerar folios de facturas de manera secuencial (Ej: FAC-00001)
DELIMITER $$
CREATE PROCEDURE sp_generar_numero_factura(OUT nuevo_numero VARCHAR(20))
BEGIN
    DECLARE total_ventas INT;
    SELECT COUNT(*) INTO total_ventas FROM ventas;
    SET nuevo_numero = CONCAT('FAC-', LPAD(total_ventas + 1, 5, '0'));
END$$
DELIMITER ;


-- =========================================================================
-- INSERCIÓN DE DATOS INICIALES / SEMILLAS (SEEDERS)
-- =========================================================================

-- Categorías Base
INSERT INTO categorias (nombre, descripcion) VALUES
('Electrónicos', 'Dispositivos tecnológicos, celulares y computación'),
('Ropa', 'Prendas de vestir masculinas, femeninas y accesorios'),
('Alimentos', 'Bebidas, abarrotes y productos alimenticios procesados');

-- Usuario Administrador de Prueba (Password encriptado listo para usar)
INSERT INTO usuarios (nombre, apellido, email, password) VALUES
('Admin', 'Sistema', 'admin@example.com', '$2a$10$RvVK4q5FhV7Vk8H9tGXJgOqmV5VZVZVZVZVZVZVZVZVZVZVZVZVZVZVZV');

-- Productos Base para Testing de Inventario
INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, codigo) VALUES
('Laptop Gamer', '16GB RAM, 512GB SSD', 1200.00, 15, 1, 'PROD-LAP01'),
('Camiseta Algodón Black', 'Talla M, 100% algodón', 25.00, 50, 2, 'PROD-CAM02'),
('Café Gourmet Instantáneo', 'Frasco de 200g premium', 8.50, 100, 3, 'PROD-CAF03');