import pool from "../config/db.js";

class amesloc {
  constructor() {
    this.pamlcodmes = "";
    this.camlnummes = "";
    this.camlestmes = "";
    this.camlactmes = true;
    this.camlcapmes = "";
    this.camldesmes = "";
  }

  async verificarExistencia() {
    try {
      const sql = `SELECT 1 FROM amesloc WHERE pamlcodmes = $1 LIMIT 1`;
      const resultado = await pool.query(sql, [this.pamlcodmes]);
      return resultado.rowCount > 0;
    } catch (error) {
      console.error("Error al verificar existencia en amesloc:", error);
      return false;
    }
  }

  async verificarExistenciaNumero(numero) {
    try {
      const sql = `SELECT 1 FROM amesloc WHERE camlnummes = $1 LIMIT 1`;
      const resultado = await pool.query(sql, [numero]);
      return resultado.rowCount > 0;
    } catch (error) {
      console.error("Error al verificar existencia por número de mesa:", error);
      return false;
    }
  }

  async grabar() {
    try {
      if (await this.verificarExistencia()) {
        return false;
      }
      const sql = `
        INSERT INTO amesloc (
          pamlcodmes, 
          camlnummes, 
          camlestmes, 
          camlactmes, 
          camlcapmes, 
          camldesmes
        ) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

      await pool.query(sql, [
        this.pamlcodmes,
        this.camlnummes,
        this.camlestmes,
        this.camlactmes,
        this.camlcapmes,
        this.camldesmes,
      ]);
      return true;
    } catch (error) {
      console.error("Error al grabar una nueva mesa:", error);
      return false;
    }
  }

  async obtenerDatos() {
    try {
      const sql = `
        SELECT pamlcodmes, camlnummes, camlestmes, camlactmes, camlcapmes, camldesmes
        FROM amesloc 
        WHERE pamlcodmes = $1
      `;

      const resultado = await pool.query(sql, [this.pamlcodmes]);

      if (resultado.rowCount > 0) {
        const row = resultado.rows[0];
        this.pamlcodmes = row.pamlcodmes;
        this.camlnummes = row.camlnummes;
        this.camlestmes = row.camlestmes;
        this.camlactmes = row.camlactmes;
        this.camlcapmes = row.camlcapmes;
        this.camldesmes = row.camldesmes;
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error al obtener datos de la mesa:", error);
      return false;
    }
  }

  async obtenerCodigo() {
    try {
      const sql = `SELECT pamlcodmes FROM amesloc WHERE camlnummes = $1`;
      const resultado = await pool.query(sql, [this.camlnummes]);

      if (resultado.rowCount > 0) {
        return resultado.rows[0].pamlcodmes;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener código por número de mesa:", error);
      return null;
    }
  }

  async modificar() {
    try {
      const sql = `
        UPDATE amesloc SET 
            camlnummes = $1,
            camlestmes = $2,
            camlactmes = $3,
            camlcapmes = $4,
            camldesmes = $5
        WHERE pamlcodmes = $6
      `;

      await pool.query(sql, [
        this.camlnummes,
        this.camlestmes,
        this.camlactmes,
        this.camlcapmes,
        this.camldesmes,
        this.pamlcodmes
      ]);

      return true;
    } catch (error) {
      console.error("Error al modificar la mesa:", error);
      return false;
    }
  }

  async lista() {
    try {
      const sql = `
        SELECT pamlcodmes, camlnummes, camlestmes, camlactmes, camlcapmes, camldesmes
        FROM amesloc
        ORDER BY pamlcodmes ASC
      `;

      const resultado = await pool.query(sql);
      return resultado.rows;
    } catch (error) {
      console.error("Error al listar mesas:", error);
      return [];
    }
  }

  async eliminar() {
    try {
      const sql = "UPDATE amesloc SET camlactmes = false WHERE pamlcodmes = $1";
      await pool.query(sql, [this.pamlcodmes]);
      return true;
    } catch (error) {
      console.error("Error al desactivar la mesa:", error);
      return false;
    }
  }

  async darAlta() {
    try {
      const sql = "UPDATE amesloc SET camlactmes = true WHERE pamlcodmes = $1";
      await pool.query(sql, [this.pamlcodmes]);
      return true;
    } catch (error) {
      console.error("Error al dar de alta la mesa:", error);
      return false;
    }
  }
}

export default amesloc;