"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [tab, setTab] = useState("clientes");
  const [data, setData] = useState([]);
  const [form, setForm] = useState({});

  // 🔹 Cargar datos al cambiar de pestaña
  useEffect(() => {
    fetch(`/api/${tab}`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, [tab]);

  // 🔹 Manejar cambios en los formularios
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Enviar datos al backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`/api/${tab}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({});
    // Recargar lista
    fetch(`/api/${tab}`)
      .then((res) => res.json())
      .then((data) => setData(data));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-4">Gestión de Negocio</h1>

      {/* 🔹 Navegación de pestañas */}
      <div className="flex justify-center space-x-4 mb-6">
        {["clientes", "productos", "pedidos", "devoluciones"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded ${
              tab === t ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 🔹 Formulario dinámico según pestaña */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        {tab === "clientes" && (
          <>
            <input
              name="nombre"
              placeholder="Nombre"
              onChange={handleChange}
              className="border p-2 w-full"
            />
            <input
              name="correo"
              placeholder="Correo"
              onChange={handleChange}
              className="border p-2 w-full"
            />
          </>
        )}

        {tab === "productos" && (
          <>
            <input
              name="nombre"
              placeholder="Nombre del producto"
              onChange={handleChange}
              className="border p-2 w-full"
            />
            <input
              name="precio"
              type="number"
              placeholder="Precio"
              onChange={handleChange}
              className="border p-2 w-full"
            />
            <input
              name="stock"
              type="number"
              placeholder="Stock"
              onChange={handleChange}
              className="border p-2 w-full"
            />
          </>
        )}

        {tab === "pedidos" && (
          <>
            <input
              name="cliente_id"
              type="number"
              placeholder="ID Cliente"
              onChange={handleChange}
              className="border p-2 w-full"
            />
            <input
              name="total"
              type="number"
              placeholder="Total"
              onChange={handleChange}
              className="border p-2 w-full"
            />
          </>
        )}

        {tab === "devoluciones" && (
          <>
            <input
              name="pedido_id"
              type="number"
              placeholder="ID Pedido"
              onChange={handleChange}
              className="border p-2 w-full"
            />
            <input
              name="motivo"
              placeholder="Motivo"
              onChange={handleChange}
              className="border p-2 w-full"
            />
          </>
        )}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Guardar
        </button>
      </form>

      {/* 🔹 Tabla de datos */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-300">
              {data.length > 0 &&
                Object.keys(data[0]).map((key) => (
                  <th key={key} className="border px-2 py-1">
                    {key}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="odd:bg-gray-100">
                {Object.values(row).map((val, i) => (
                  <td key={i} className="border px-2 py-1">
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
