
import pool from "../config/db.js";

export async function estadoAPreparacion(
  idPedido,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

      actualizarPedido = await client.query(
        `UPDATE apedpro 
        set cappestbar = 'EN_PREPARACION'
        where pappcodped = $1
        and cappestbar = 'ESPERA'
        and cappactbar = true
         RETURNING *`,
        [idPedido]
      );

    if (actualizarPedido.rowCount === 0) {
      await client.query("ROLLBACK");
      return {
        success: false,
        tipo: "PEDIDO",
        mensaje:
          "El pedido fue cancelado o acurrio un error en la parte de actualizar estado de 'ESPERA' a 'EN_PREPARACION'",
        url: ""
      };
    }

    


     
      if (actualizarMesa.rowCount === 0) {
        await client.query("ROLLBACK");
        return {
          success: false,
          tipo: "FALLO_MESA",
          mensaje: "No se pudo modificar el estado operativo de la mesa",
          url: ""
        };
      }
    }

    let productosRes = "";

    // 3. Obtener el detalle de productos del pedido (.rows)
    if(tipo == 'comida'){
      productosRes = await client.query(
      `SELECT det.fadpcodpro , det.cadpcandet
        FROM apedpro ped, adetped det, aproduc pro, acatpro cat WHERE det.fadpcodped = $1 
        and ped.pappcodped = det.fadpcodped and det.fadpcodpro = pro.papdcodpro and pro.fapdcodcat = cat.pacpcodcat and cat.cacptipcat = 'COMIDA'  `,
      [idPedido]
      
    );
    console.log('entre a consulta de comida')
    }else if(tipo == 'bebida'){
      productosRes = await client.query(
      `SELECT det.fadpcodpro ,det.cadpcandet
        FROM apedpro ped, adetped det, aproduc pro, acatpro cat WHERE det.fadpcodped = $1 
        and ped.pappcodped = det.fadpcodped and det.fadpcodpro = pro.papdcodpro and pro.fapdcodcat = cat.pacpcodcat and cat.cacptipcat = 'BEBIDA'  `,
      [idPedido]
    );
    console.log('entre a consulta de bebida')

      
    }else{
      productosRes = await client.query(
      `SELECT *
        FROM adetped WHERE fadpcodped = $1`,
      [idPedido]
    );
    console.log('entre a consulta de ambos')


    }



    




    
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
        [item.cadpcandet, item.fadpcodpro]
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
        codigo: item.fadpcodpro,
        stock: r.rows[0].capdstopro 
      });

      console.log("STOCK ACTUALIZADO: ", stockActualizado);
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
