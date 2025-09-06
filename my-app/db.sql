-- ==========================
-- CREACIÓN DE BASE DE DATOS
-- ==========================
CREATE DATABASE tienda_app;
\c tienda_app;

-- ==========================
-- TABLAS
-- ==========================

-- Tabla de usuarios del sistema
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'empleado'))
);

-- Tabla de clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    telefono VARCHAR(20),
    direccion TEXT
);

-- Tabla de productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0
);

-- Tabla de pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES clientes(id) ON DELETE CASCADE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total NUMERIC(10,2) NOT NULL
);

-- Tabla de devoluciones
CREATE TABLE devoluciones (
    id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INT REFERENCES productos(id) ON DELETE CASCADE,
    cantidad INT NOT NULL,
    motivo TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla intermedia para relacionar pedidos con productos
CREATE TABLE pedido_detalles (
    id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INT REFERENCES productos(id),
    cantidad INT NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL
);

-- ==========================
-- ROLES
-- ==========================

-- Rol administrador
CREATE ROLE admin_app LOGIN PASSWORD 'admin123' SUPERUSER;

-- Rol empleados (sin permisos DELETE)
CREATE ROLE empleado_app LOGIN PASSWORD 'empleado123' NOSUPERUSER;

-- Permisos para empleados: solo INSERT y UPDATE
GRANT CONNECT ON DATABASE tienda_app TO empleado_app;
GRANT USAGE ON SCHEMA public TO empleado_app;

GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO empleado_app;
REVOKE DELETE ON ALL TABLES IN SCHEMA public FROM empleado_app;

-- ==========================
-- PROCEDURE PARA REGISTRAR PEDIDO
-- ==========================
CREATE OR REPLACE PROCEDURE registrar_pedido(
    p_cliente_id INT,
    p_productos INT[],
    p_cantidades INT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total NUMERIC(10,2) := 0;
    v_pedido_id INT;
    i INT;
    v_precio NUMERIC(10,2);
BEGIN
    -- Crear pedido vacío
    INSERT INTO pedidos(cliente_id, total)
    VALUES (p_cliente_id, 0)
    RETURNING id INTO v_pedido_id;

    -- Insertar productos en pedido_detalles
    FOR i IN 1..array_length(p_productos, 1) LOOP
        SELECT precio
        INTO v_precio
        FROM productos
        WHERE id = p_productos[i];

        INSERT INTO pedido_detalles(pedido_id, producto_id, cantidad, subtotal)
        VALUES (v_pedido_id, p_productos[i], p_cantidades[i], v_precio * p_cantidades[i]);

        v_total := v_total + (v_precio * p_cantidades[i]);

        -- Reducir stock del producto
        UPDATE productos
        SET stock = stock - p_cantidades[i]
        WHERE id = p_productos[i];
    END LOOP;

    -- Actualizar el total en el pedido
    UPDATE pedidos
    SET total = v_total
    WHERE id = v_pedido_id;
END;
$$;


-- ==========================
-- FUNCIÓN VENTAS TOTALES
-- ==========================
CREATE OR REPLACE FUNCTION ventas_totales()
RETURNS NUMERIC(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total NUMERIC(10,2);
BEGIN
    SELECT COALESCE(SUM(total), 0) INTO v_total FROM pedidos;
    RETURN v_total;
END;
$$;

-- ==========================
-- TRIGGER ACTUALIZAR STOCK
-- ==========================
CREATE OR REPLACE FUNCTION actualizar_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Al insertar una devolución, se aumenta el stock
    UPDATE productos
    SET stock = stock + NEW.cantidad
    WHERE id = NEW.producto_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_actualizar_stock
AFTER INSERT ON devoluciones
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock();

-- ==========================
-- DATOS DE PRUEBA
-- ==========================
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Admin', 'admin@tienda.com', '1234', 'admin'),
('Empleado', 'empleado@tienda.com', '1234', 'empleado');

INSERT INTO clientes (nombre, email, telefono, direccion) VALUES
('Carlos Pérez', 'carlos@mail.com', '3001234567', 'Calle 123'),
('Ana Gómez', 'ana@mail.com', '3007654321', 'Carrera 45');

INSERT INTO productos (nombre, descripcion, precio, stock) VALUES
('Laptop', 'Laptop de 15 pulgadas', 2500.00, 10),
('Mouse', 'Mouse inalámbrico', 50.00, 100),
('Teclado', 'Teclado mecánico', 120.00, 50);
