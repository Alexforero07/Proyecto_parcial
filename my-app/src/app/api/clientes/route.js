import { query } from "../../lib/db"; // ✅ named import

// 🚀 POST → insertar cliente
export async function POST(req) {
  try {
    const { nombre, correo } = await req.json();
    await query(
      "INSERT INTO tienda_app.clientes (nombre, correo) VALUES ($1, $2)",
      [nombre, correo]
    );

    return new Response(
      JSON.stringify({ message: "Cliente registrado exitosamente" }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// 🚀 GET → obtener clientes
export async function GET() {
  try {
    const result = await query(
      "SELECT * FROM tienda_app.clientes ORDER BY id DESC"
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
