
-- CREACIÓN DEL ESQUEMA

CREATE SCHEMA IF NOT EXISTS tienda_app;


-- TABLAS

-- Tabla de usuarios del sistema
CREATE TABLE tienda_app.usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'empleado'))
);

-- Tabla de clientes
CREATE TABLE tienda_app.clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    telefono VARCHAR(20),
    direccion TEXT
);

-- Tabla de productos
CREATE TABLE tienda_app.productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio NUMERIC(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0
);

-- Tabla de pedidos
CREATE TABLE tienda_app.pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES tienda_app.clientes(id) ON DELETE CASCADE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Tabla intermedia para relacionar pedidos con productos (muchos a muchos)
CREATE TABLE tienda_app.pedido_detalles (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL REFERENCES tienda_app.pedidos(id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES tienda_app.productos(id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    subtotal NUMERIC(10,2) NOT NULL
);

-- Tabla de devoluciones
CREATE TABLE tienda_app.devoluciones (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL REFERENCES tienda_app.pedidos(id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES tienda_app.productos(id) ON DELETE CASCADE,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    motivo TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- ROLES DE LA APP

CREATE ROLE admin_app LOGIN PASSWORD 'admin123' SUPERUSER;
CREATE ROLE empleado_app LOGIN PASSWORD 'empleado123' NOSUPERUSER;


-- Permisos empleados
GRANT CONNECT ON DATABASE tienda_app TO empleado_app;
GRANT USAGE ON SCHEMA tienda_app TO empleado_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA tienda_app TO empleado_app;
REVOKE DELETE ON ALL TABLES IN SCHEMA tienda_app FROM empleado_app;



-- PROCEDIMIENTO PARA REGISTRAR PEDIDO
CREATE OR REPLACE PROCEDURE tienda_app.registrar_pedido(
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
    INSERT INTO tienda_app.pedidos(cliente_id, total)
    VALUES (p_cliente_id, 0)
    RETURNING id INTO v_pedido_id;

    -- Insertar productos en pedido_detalles
    FOR i IN 1..array_length(p_productos, 1) LOOP
        SELECT precio INTO v_precio
        FROM tienda_app.productos
        WHERE id = p_productos[i];

        INSERT INTO tienda_app.pedido_detalles(pedido_id, producto_id, cantidad, subtotal)
        VALUES (v_pedido_id, p_productos[i], p_cantidades[i], v_precio * p_cantidades[i]);

        v_total := v_total + (v_precio * p_cantidades[i]);

        -- Reducir stock del producto
        UPDATE tienda_app.productos
        SET stock = stock - p_cantidades[i]
        WHERE id = p_productos[i];
    END LOOP;

    -- Actualizar total en el pedido
    UPDATE tienda_app.pedidos
    SET total = v_total
    WHERE id = v_pedido_id;
END;
$$;



-- FUNCIÓN PARA SUMA TOTAL DE VENTAS
CREATE OR REPLACE FUNCTION tienda_app.ventas_totales()
RETURNS NUMERIC(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total NUMERIC(10,2);
BEGIN
    SELECT COALESCE(SUM(total),0) INTO v_total
    FROM tienda_app.pedidos;
    RETURN v_total;
END;
$$;




-- CONSULTAS DE COMPROBACIÓN

INSERT INTO tienda_app.usuarios (nombre, email, password, rol)
VALUES ('Administrador', 'alex@tienda.com', '1234', 'admin');


INSERT INTO tienda_app.usuarios (nombre, email, password, rol)
VALUES ('Empleado', 'russi@tienda.com', '1234', 'empleado');


SELECT * FROM tienda_app.usuarios;
SELECT * FROM tienda_app.clientes;
SELECT * FROM tienda_app.productos;
SELECT * FROM tienda_app.pedidos;


DROP TABLE tienda_app.clientes;
DROP TABLE tienda_app.productos;

TRUNCATE TABLE tienda_app.pedidos, tienda_app.clientes RESTART IDENTITY CASCADE;
TRUNCATE TABLE tienda_app.clientes, tienda_app.pedidos RESTART IDENTITY CASCADE;

DROP TABLE IF EXISTS tienda_app.pedidos CASCADE;
DROP TABLE IF EXISTS tienda_app.clientes CASCADE;
DROP TABLE IF EXISTS tienda_app.productos CASCADE;
DROP TABLE IF EXISTS tienda_app.devoluciones CASCADE;

DROP DATABASE tienda_app;

DROP TRIGGER IF EXISTS trg_actualizar_stock ON tienda_app.devoluciones;
DROP FUNCTION IF EXISTS tienda_app.actualizar_stock();

