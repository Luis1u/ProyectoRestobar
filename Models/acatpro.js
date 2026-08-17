import pool from "../config/db.js";

class acatpro {
  constructor() {
    this.pacpcodcat = "";
    this.cacpnomcat = "";
    this.cacpdescat = "";
    this.cacpestcat = true;
  }

  async verificarExistencia() {
    try {
      const sql = `SELECT 1 FROM acatpro WHERE pacpcodcat = $1 LIMIT 1`;
      const resultado = await pool.query(sql, [this.pacpcodcat]);
      return resultado.rowCount > 0;
    } catch (error) {
      console.error("Error al verificar existencia en acatpro:", error);
      return false;
    }
  }

  async verificarExistenciaNombre(nombre) {
    try {
      const sql = `SELECT 1 FROM acatpro WHERE cacpnomcat = $1 LIMIT 1`;
      const resultado = await pool.query(sql, [nombre]);
      return resultado.rowCount > 0;
    } catch (error) {
      console.error("Error al verificar existencia por nombre:", error);
      return false;
    }
  }

  async grabar() {
    try {
      if (await this.verificarExistencia()) {
        return false;
      }
      const sql = `
        INSERT INTO acatpro (pacpcodcat, cacpnomcat, cacpdescat, cacpestcat) 
        VALUES ($1, $2, $3, $4)
      `;

      await pool.query(sql, [
        this.pacpcodcat,
        this.cacpnomcat,
        this.cacpdescat,
        this.cacpestcat,
      ]);
      return true;
    } catch (error) {
      console.error("Error al grabar una nueva categoría:", error);
      return false;
    }
  }

  async obtenerDatos() {
    try {
      const sql = `
        SELECT pacpcodcat, cacpnomcat, cacpdescat, cacpestcat
        FROM acatpro 
        WHERE pacpcodcat = $1
      `;

      const resultado = await pool.query(sql, [this.pacpcodcat]);

      if (resultado.rowCount > 0) {
        const row = resultado.rows[0];
        this.pacpcodcat = row.pacpcodcat;
        this.cacpnomcat = row.cacpnomcat;
        this.cacpdescat = row.cacpdescat;
        this.cacpestcat = row.cacpestcat;
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error al obtener datos de la categoría:", error);
      return false;
    }
  }

  async obtenerCodigo() {
    try {
      const sql = `SELECT pacpcodcat FROM acatpro WHERE cacpnomcat = $1`;
      const resultado = await pool.query(sql, [this.cacpnomcat]);

      if (resultado.rowCount > 0) {
        return resultado.rows[0].pacpcodcat;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener código por nombre:", error);
      return null;
    }
  }

  async modificar() {
    try {
      const sql = `
        UPDATE acatpro SET 
            cacpnomcat = $1,
            cacpdescat = $2,
            cacpestcat = $3
        WHERE pacpcodcat = $4
      `;

      await pool.query(sql, [
        this.cacpnomcat,
        this.cacpdescat,
        this.cacpestcat,
        this.pacpcodcat
      ]);

      return true;
    } catch (error) {
      console.error("Error al modificar la categoría:", error);
      return false;
    }
  }

  async lista() {
    try {
      const sql = `
        SELECT pacpcodcat, cacpnomcat, cacpdescat, cacpestcat
        FROM acatpro
        ORDER BY pacpcodcat ASC
      `;

      const resultado = await pool.query(sql);
      return resultado.rows; // Retorna array con datos o arreglo vacío []
    } catch (error) {
      console.error("Error al listar categorías:", error);
      return [];
    }
  }

  async eliminar() {
    try {
      const sql = "UPDATE acatpro SET cacpestcat = false WHERE pacpcodcat = $1";
      await pool.query(sql, [this.pacpcodcat]);
      return true;
    } catch (error) {
      console.error("Error al desactivar la categoría:", error);
      return false;
    }
  }

  async darAlta() {
    try {
      const sql = "UPDATE acatpro SET cacpestcat = true WHERE pacpcodcat = $1";
      await pool.query(sql, [this.pacpcodcat]);
      return true;
    } catch (error) {
      console.error("Error al dar de alta la categoría:", error);
      return false;
    }
  }
}

export default acatpro;