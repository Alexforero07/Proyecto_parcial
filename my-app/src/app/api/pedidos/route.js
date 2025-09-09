import pool from "../../lib/db"; 

// POST → registrar pedido con productos
export async function POST(req) {
  try {
    const { cliente_id, productos, cantidades } = await req.json();

    // 🔹 Validación de cliente_id
    if (!cliente_id || cliente_id <= 0) {
      return new Response(
        JSON.stringify({ error: "El ID de cliente debe ser un número positivo" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🔹 Validación de arrays
    if (!Array.isArray(productos) || !Array.isArray(cantidades)) {
      return new Response(
        JSON.stringify({ error: "Productos y cantidades deben ser arreglos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (productos.length !== cantidades.length) {
      return new Response(
        JSON.stringify({ error: "La cantidad de productos y cantidades no coincide" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🔹 Validación de cada producto_id y cantidad
    for (let i = 0; i < productos.length; i++) {
      if (productos[i] <= 0) {
        return new Response(
          JSON.stringify({ error: "El ID del producto debe ser un número positivo" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      if (cantidades[i] <= 0) {
        return new Response(
          JSON.stringify({ error: "La cantidad debe ser mayor a 0" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 🚀 Crear pedido
    const resultPedido = await pool.query(
      "INSERT INTO tienda_app.pedidos (cliente_id, total) VALUES ($1, 0) RETURNING id",
      [cliente_id]
    );
    const pedidoId = resultPedido.rows[0].id;

    let total = 0;

    for (let i = 0; i < productos.length; i++) {
      const prodId = productos[i];
      const cant = cantidades[i];

      const resultProd = await pool.query(
        "SELECT precio FROM tienda_app.productos WHERE id = $1",
        [prodId]
      );
      const precio = resultProd.rows[0].precio;
      const subtotal = precio * cant;

      await pool.query(
        "INSERT INTO tienda_app.pedido_detalles (pedido_id, producto_id, cantidad, subtotal) VALUES ($1, $2, $3, $4)",
        [pedidoId, prodId, cant, subtotal]
      );

      await pool.query(
        "UPDATE tienda_app.productos SET stock = stock - $1 WHERE id = $2",
        [cant, prodId]
      );

      total += subtotal;
    }

    await pool.query(
      "UPDATE tienda_app.pedidos SET total = $1 WHERE id = $2",
      [total, pedidoId]
    );

    return new Response(
      JSON.stringify({ message: "Pedido registrado exitosamente", pedidoId }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// GET → listar pedidos
export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM tienda_app.pedidos ORDER BY id DESC"
    );
    return new Response(JSON.stringify(result.rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
