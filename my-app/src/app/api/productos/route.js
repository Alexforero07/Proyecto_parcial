import pool from "../../lib/db"; 

// POST → crear producto
export async function POST(req) {
  try {
    const { nombre, precio, stock } = await req.json();

    // 🔹 Validaciones
    if (!nombre || nombre.trim() === "") {
      return new Response(
        JSON.stringify({ error: "El nombre del producto es obligatorio" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (precio <= 0) {
      return new Response(
        JSON.stringify({ error: "El precio debe ser mayor a 0" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (stock < 0) {
      return new Response(
        JSON.stringify({ error: "El stock no puede ser negativo" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await pool.query(
      "INSERT INTO tienda_app.productos (nombre, precio, stock) VALUES ($1, $2, $3)",
      [nombre, precio, stock]
    );

    return new Response(
      JSON.stringify({ message: "Producto registrado exitosamente" }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// GET → listar productos
export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM tienda_app.productos ORDER BY id DESC"
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
