import pool from "../config/db.js";

async function siguienteCorrelativo(client, tipo) {
  // Atómico: incrementa y devuelve en una sola sentencia
  const r = await client.query(
    `UPDATE xnumcor SET cxncnumcor = cxncnumcor + 1
     WHERE pxnctipcor = $1 RETURNING cxncnumcor`,
    [tipo]
  );
  if (r.rowCount === 0) {
    const ins = await client.query(
      `INSERT INTO xnumcor (cxncnumcor, pxnctipcor) VALUES (1, $1)
       RETURNING cxncnumcor`,
      [tipo]
    );
    return `${tipo}-${String(ins.rows[0].cxncnumcor).padStart(11, "0")}`;
  }
  return `${tipo}-${String(r.rows[0].cxncnumcor).padStart(11, "0")}`;
}

export async function guardarPedidoTransaccional({ productos, datosMesa, total, codUsuario }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

   // 1. Tomar la mesa de forma atómica (solo uno puede pasar de LIBRE a ESPERA)
const mesa = await client.query(
  `UPDATE amesloc SET camlestmes = 'ESPERA'
   WHERE pamlcodmes = $1 AND camlestmes = 'LIBRE' AND camlactmes = true
   RETURNING pamlcodmes`,
  [datosMesa.codMesa]
);
if (mesa.rowCount === 0) {
  await client.query("ROLLBACK");
  return {
    success: false,
    tipo: "MESA_OCUPADA",
    mensaje: "La mesa ya cuenta con un pedido",
    url: "/mesero/nuevoPedido"
  };
}

    // 2. Descontar stock de forma atómica (ordenado por código para evitar deadlocks)
    const ordenados = [...productos].sort((a, b) => String(a.codigo).localeCompare(String(b.codigo)));
    const faltantes = [];

    for (const item of ordenados) {
      const r = await client.query(
        `UPDATE aproduc SET capdstopro = capdstopro - $2
         WHERE papdcodpro = $1 AND capdstopro >= $2 AND capdestpro = true
         RETURNING capdstopro`,
        [item.codigo, item.cantidadCompra]
      );
      if (r.rowCount === 0) {
        const actual = await client.query(
          `SELECT capdnompro, capdstopro FROM aproduc WHERE papdcodpro = $1`,
          [item.codigo]
        );
        faltantes.push({
          codigo: item.codigo,
          nombre: actual.rows[0]?.capdnompro ?? item.nombre,
          pedido: item.cantidadCompra,
          disponible: actual.rows[0]?.capdstopro ?? 0
        });
      }
    }

    // Si algo no alcanzó: deshacer TODO (mesa y stock incluidos)
    if (faltantes.length > 0) {
      await client.query("ROLLBACK");
      return {
        success: false,
        tipo: "SIN_STOCK",
        mensaje: "Algunos productos ya no tienen stock suficiente",
        faltantes,
        url: null // el front se queda en la pantalla para corregir
      };
    }

    // 3. Saber si hay comida y/o bebida (una sola consulta)
    const tipos = await client.query(
      `SELECT DISTINCT cat.cacptipcat
       FROM aproduc pro JOIN acatpro cat ON pro.fapdcodcat = cat.pacpcodcat
       WHERE pro.papdcodpro = ANY($1)`,
      [productos.map((p) => p.codigo)]
    );
    const hayComida = tipos.rows.some((t) => t.cacptipcat === "COMIDA");
    const hayBebida = tipos.rows.some((t) => t.cacptipcat === "BEBIDA");
    

    // 4. Cabecera del pedido
    const codPedido = await siguienteCorrelativo(client, "apedpro");
    const ahora = new Date();
    await client.query(
      `INSERT INTO apedpro (pappcodped, cappcanper, capptipped, cappfecped, capphorped,
                            cappestcoc, cappestbar, capptotpag, fappcodusu, fappcodmes)
       VALUES ($1,$2,'LOCAL',$3,$4,$5,$6,$7,$8,$9)`,
      [
        codPedido,
        datosMesa.nroPersonas,
        ahora.toLocaleDateString("sv"),
        ahora.toLocaleTimeString("es-ES", { hour12: false }),
        hayComida ? "ESPERA" : null,
        hayBebida ? "ESPERA" : null,
        total,
        codUsuario,
        datosMesa.codMesa
      ]
    );

    // 5. Detalles
    for (const item of productos) {
      const codDet = await siguienteCorrelativo(client, "adetped");
      await client.query(
        `INSERT INTO adetped (padpcoddet, cadpnotdet, cadpcandet, fadpcodpro, fadpcodped)
         VALUES ($1,$2,$3,$4,$5)`,
        [codDet, item.nota ?? "", item.cantidadCompra, item.codigo, codPedido]
      );
    }

    await client.query("COMMIT");
    return { success: true, codPedido, hayComida, hayBebida };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al guardar pedido:", error);
    return { success: false, tipo: "ERROR", mensaje: "Error interno al guardar el pedido" };
  } finally {
    client.release();
  }
}