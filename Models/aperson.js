import pool from "../config/db.js";
import Xnumcor from "./xnumcor.js";

class aperson {
  constructor() {
    this.papscodper = "";
    this.capsnumcid = "";
    this.capsnomper = "";
    this.capsapepat = "";
    this.capsapemat = "";
    this.capsnumcel = "";
    this.capscorele = "";
    this.capsestper = "";
    this.capsfecnac = "";
    this.capssexper = "";
    this.capsdirper = "";
  }

  async verificarExistencia() {
    try {
      const sql = `
        SELECT 1 
        FROM aperson 
        WHERE papscodper = $1 
        LIMIT 1
      `;
      const resultado = await pool.query(sql, [this.papscodper]);
      return resultado.rowCount > 0;
    } catch (error) {
      console.error("Error al verificar existencia en la tabla aperson:", error);
      return false;
    }
  }

  async verificarExistenciaCi(ci) {
    try {
      const sql = `
        SELECT capsnumcid 
        FROM aperson 
        WHERE capsnumcid = $1 
      `;
      const resultado = await pool.query(sql, [ci]);
      return resultado.rowCount > 0;
    } catch (error) {
      console.error("Error al verificar existencia por CI:", error);
      return false;
    }
  }

  async grabar() {
    try {
      if (await this.verificarExistencia()) {
        return false;
      }
      const sql = `
        INSERT INTO aperson (
          papscodper, capsnumcid, capsnomper, capsapepat, capsapemat,
          capsnumcel, capscorele, capsestper, capsfecnac, capssexper, capsdirper
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
      `;

      const parametros = [
        this.papscodper,
        this.capsnumcid,
        this.capsnomper,
        this.capsapepat,
        this.capsapemat,
        this.capsnumcel,
        this.capscorele,
        this.capsestper,
        this.capsfecnac,
        this.capssexper,
        this.capsdirper
      ];

      await pool.query(sql, parametros);
      return true;
    } catch (error) {
      console.error("Error al grabar una nueva persona:", error);
      return false;
    }
  }

  async obtenerDatos() {
    try {
      const sql = `
        SELECT 
          capsnumcid, capsnomper, capsapepat, capsapemat, capsnumcel,
          capscorele, capsestper, capsfecnac, capssexper, capsdirper 
        FROM aperson 
        WHERE papscodper = $1
      `;

      const resultado = await pool.query(sql, [this.papscodper]);
      
      if (resultado.rowCount > 0) {
        const row = resultado.rows[0];
        this.capsnumcid = row.capsnumcid;
        this.capsnomper = row.capsnomper;
        this.capsapepat = row.capsapepat;
        this.capsapemat = row.capsapemat;
        this.capsnumcel = row.capsnumcel;
        this.capscorele = row.capscorele;
        this.capsestper = row.capsestper;
        this.capsfecnac = row.capsfecnac;
        this.capssexper = row.capssexper;
        this.capsdirper = row.capsdirper;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error al intentar obtener datos de persona:", error);
      return false;
    }
  }

  async obtenerCodigo() {
    try {
      const sql = `SELECT papscodper FROM aperson WHERE capsnumcid = $1`;
      const resultado = await pool.query(sql, [this.capsnumcid]);

      if (resultado.rowCount > 0) {
        console.log("Código obtenido de la base de datos");
        return resultado.rows[0].papscodper;
      }
      return null;
    } catch (error) {
      console.error("Error al intentar obtener código de persona a través de CI:", error);
      return null;
    }
  }

  async modificar() {
    try {
      const sql = `
        UPDATE aperson SET 
          capsnumcid = $1,
          capsnomper = $2,
          capsapepat = $3,
          capsapemat = $4,
          capsnumcel = $5,
          capscorele = $6,
          capsestper = $7,
          capsfecnac = $8,
          capssexper = $9,
          capsdirper = $10 
        WHERE papscodper = $11
      `;

      await pool.query(sql, [
        this.capsnumcid,
        this.capsnomper,
        this.capsapepat,
        this.capsapemat,
        this.capsnumcel,
        this.capscorele,
        this.capsestper,
        this.capsfecnac,
        this.capssexper,
        this.capsdirper,
        this.papscodper
      ]);

      return true;
    } catch (error) {
      console.error("Error al modificar la persona en la base de datos:", error);
      return false;
    }
  }
}

export default aperson;