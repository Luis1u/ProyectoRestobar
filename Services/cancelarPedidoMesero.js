import pool from "../config/db.js";

export async function cancelarPedidoTransaccional(idMesa, idPedido) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Cancelar el pedido
    const actualizarPedido = await client.query(
      `UPDATE apedpro 
       SET cappactped = false 
       WHERE pappcodped = $1 
         AND ((cappestcoc = 'ESPERA' AND cappestbar IS NULL) 
           OR (cappestbar = 'ESPERA' AND cappestcoc IS NULL) 
           OR (cappestcoc = 'ESPERA' AND cappestbar = 'ESPERA')) 
       RETURNING *`,
      [idPedido]
    );

    if (actualizarPedido.rowCount === 0) {
      await client.query("ROLLBACK");
      return {
        success: false,
        tipo: "PEDIDO_EN_PROCESO",
        mensaje: "El pedido ya está en preparación o no se puede cancelar",
        url: ""
      };
    }

    // 2. Liberar la mesa
    const actualizarMesa = await client.query(
      `UPDATE amesloc 
       SET camlestmes = 'LIBRE' 
       WHERE pamlcodmes = $1 AND camlestmes = 'ESPERA' 
       RETURNING *`,
      [idMesa]
    );

    if (actualizarMesa.rowCount === 0) {
      await client.query("ROLLBACK");
      return {
        success: false,
        tipo: "FALLO_MESA",
        mensaje: "No se pudo modificar el estado operativo de la mesa",
        url: ""
      };
    }

    // 3. Obtener el detalle de productos del pedido (.rows)
    const productosRes = await client.query(
      `SELECT * FROM adetped WHERE fadpcodped = $1`,
      [idPedido]
    );
    const productos = productosRes.rows;

    // 4. Reponer stock de forma atómica (ordenados por el ID del producto)
    const stockActualizado = [];
    const ordenados = [...productos].sort((a, b) =>
      String(a.fadpcodpro).localeCompare(String(b.fadpcodpro))
    );

    for (const item of ordenados) {
      let r = await client.query(
        `UPDATE aproduc 
         SET capdstopro = capdstopro + $1 
         WHERE papdcodpro = $2 
         RETURNING *`,
        [item.cadpcandet, item.fadpcodpro] // <-- Usar fadpcodpro (ID Producto)
      );

      if (r.rowCount === 0) {
        await client.query("ROLLBACK");
        return {
          success: false,
          tipo: "FALLO_PRODUCTO",
          mensaje: "No se pudo actualizar el stock del producto",
          url: ""
        };
      }

      stockActualizado.push({
        codigo: item.fadpcodpro, // <-- Usar fadpcodpro
        stock: r.rows[0].capdstopro //se cambio
      });

      console.log('STOCK ACTUALIZADO: ',stockActualizado);
    }

    // 5. Determinar las áreas afectadas (Comida / Bebida)
    const codigosProductos = productos.map((p) => p.fadpcodpro); // <-- Usar fadpcodpro

    let hayComida = false;
    let hayBebida = false;

    if (codigosProductos.length > 0) {
      const tipos = await client.query(
        `SELECT DISTINCT cat.cacptipcat
         FROM aproduc pro 
         JOIN acatpro cat ON pro.fapdcodcat = cat.pacpcodcat
         WHERE pro.papdcodpro = ANY($1)`,
        [codigosProductos]
      );

      hayComida = tipos.rows.some((t) => t.cacptipcat === "COMIDA");
      hayBebida = tipos.rows.some((t) => t.cacptipcat === "BEBIDA");
    }

    await client.query("COMMIT");

    return {
      success: true,
      idPedido,
      hayComida,
      hayBebida,
      stockActualizado
    };

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al cancelar pedido:", error);
    return {
      success: false,
      tipo: "ERROR",
      mensaje: "Error interno al cancelar el pedido"
    };
  } finally {
    client.release();
  }
}