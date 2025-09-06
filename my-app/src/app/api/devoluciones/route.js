import pool from "../../lib/db"; 

// POST → registrar devolución
export async function POST(req) {
  try {
    const { pedido_id, producto_id, cantidad } = await req.json();

    await pool.query(
      "INSERT INTO tienda_app.devoluciones (pedido_id, producto_id, cantidad) VALUES ($1, $2, $3)",
      [pedido_id, producto_id, cantidad]
    );

    await pool.query(
      "UPDATE tienda_app.productos SET stock = stock + $1 WHERE id = $2",
      [cantidad, producto_id]
    );

    return new Response(
      JSON.stringify({ message: "Devolución registrada exitosamente" }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// GET → listar devoluciones
export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM tienda_app.devoluciones ORDER BY id DESC"
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
