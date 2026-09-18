import pool from "../config/db.js";

class adetped {
  constructor() {
    this.padpcoddet = ""; // Código único del detalle (PK)
    this.cadpnotdet = ""; // Nota u observación del ítem (ej: "Sin cebolla")
    this.cadpcandet = 1;  // Cantidad solicitada
    this.fadpcodpro = null; // FK Producto / Platillo
    this.fadpcodped = null; // FK Pedido (referencia a apedpro)
  }

  // Verificar si existe un registro por su PK
  async verificarExistencia() {
    try {
      const sql = `
        SELECT 1 
        FROM adetped 
        WHERE padpcoddet = $1 
        LIMIT 1
      `;
      const resultado = await pool.query(sql, [this.padpcoddet]);
      return resultado.rowCount > 0;
    } catch (error) {
      console.error("Error al verificar existencia en adetped:", error);
      return false;
    }
  }

  // Registrar un detalle de pedido
  async grabar() {
    try {
      if (await this.verificarExistencia()) {
        return false;
      }

      const sql = `
        INSERT INTO adetped (
          padpcoddet, cadpnotdet, cadpcandet, fadpcodpro, fadpcodped
        ) VALUES (
          $1, $2, $3, $4, $5
        )
      `;

      const parametros = [
        this.padpcoddet,
        this.cadpnotdet,
        this.cadpcandet,
        this.fadpcodpro,
        this.fadpcodped
      ];

      await pool.query(sql, parametros);
      return true;
    } catch (error) {
      console.error("Error al grabar el detalle del pedido:", error);
      return false;
    }
  }

  // Obtener los datos de un detalle específico por su PK (padpcoddet)
  async obtenerDatos(where = "") {
    try {
      let sql = `
        SELECT 
          cadpnotdet, cadpcandet, fadpcodpro, fadpcodped
        FROM adetped 
        WHERE padpcoddet = $1
      `;

      if (where !== "") {
        sql += ` ${where}`;
      }

      const resultado = await pool.query(sql, [this.padpcoddet]);

      if (resultado.rowCount > 0) {
        const row = resultado.rows[0];
        this.cadpnotdet = row.cadpnotdet;
        this.cadpcandet = row.cadpcandet;
        this.fadpcodpro = row.fadpcodpro;
        this.fadpcodped = row.fadpcodped;
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error al obtener datos del detalle del pedido:", error);
      return false;
    }
  }

  // Modificar un registro de detalle existente
  async modificar() {
    try {
      const sql = `
        UPDATE adetped SET 
          cadpnotdet = $1,
          cadpcandet = $2,
          fadpcodpro = $3,
          fadpcodped = $4
        WHERE padpcoddet = $11 -- Se actualiza según la PK
      `;

      await pool.query(sql, [
        this.cadpnotdet,
        this.cadpcandet,
        this.fadpcodpro,
        this.fadpcodped,
        this.padpcoddet
      ]);

      return true;
    } catch (error) {
      console.error("Error al modificar el detalle del pedido:", error);
      return false;
    }
  }

  // Listar todos los ítems de detalle
  async lista() {
    try {
      const sql = `
        SELECT 
          padpcoddet, cadpnotdet, cadpcandet, fadpcodpro, fadpcodped
        FROM adetped
      `;

      const resultado = await pool.query(sql);

      if (resultado.rowCount > 0) {
        return resultado.rows;
      } else {
        console.log("No se encontraron registros en el detalle de pedidos");
        return [];
      }
    } catch (error) {
      console.error("Error al listar los detalles de pedidos: " + error);
      return false;
    }
  }

  // Métodos auxiliares clave para relaciones en la base de datos

  // Listar todos los ítems pertenecientes a un pedido específico (por fadpcodped)
  async obtenerPorPedido(codPedido) {
    try {
      const sql = `
        SELECT 
          padpcoddet, cadpnotdet, cadpcandet, fadpcodpro, fadpcodped
        FROM adetped
        WHERE fadpcodped = $1
      `;
      const resultado = await pool.query(sql, [codPedido]);
      return resultado.rows;
    } catch (error) {
      console.error("Error al obtener los detalles del pedido:", error);
      return [];
    }
  }

  // Eliminar físicamente un ítem del detalle
  async eliminar() {
    try {
      const sql = "DELETE FROM adetped WHERE padpcoddet = $1";
      await pool.query(sql, [this.padpcoddet]);
      return true;
    } catch (error) {
      console.error("Error al eliminar el ítem de detalle:", error);
      return false;
    }
  }
}

export default adetped;