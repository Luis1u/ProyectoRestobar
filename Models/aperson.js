import pool from "../config/db.js";
import Xnumcor from "./xnumcor.js";

class aperson {
  constructor() {
    this.papscodper = "";
    this.capsnumcid = "";
    this.capsnomper = "";
    this.capsapemat = "";
    this.capsapepat = "";
    this.capsfecing = "";
    this.capssueper = "";
    this.capsnumcel = "";
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

      // Si devuelve filas, el registro existe (HasRows)
      if (resultado.rowCount > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(
        "Error al verificar existencia en la tabla aperson:",
        error,
      );
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

      // Si devuelve filas, el registro existe (HasRows)
      if (resultado.rowCount > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(
        "Error al verificar existencia si es que ya existe un ci igual:",
        error,
      );
      return false;
    }
  }

  // 2. GRABAR (INSERTAR)
  async grabar() {
    try {
      if (await this.verificarExistencia()) {
        return false;
      }
      const sql = `
                INSERT INTO aperson (
                    papscodper,
                    capsnumcid,
                    capsnomper,
                    capsapemat,
                    capsapepat, 
                    capsfecing,
                    capssueper,
                    capsnumcel
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8
                )
            `;

      const parametros = [
        this.papscodper, // $1
        this.capsnumcid, // $2
        this.capsnomper, // $3
        this.capsapemat, // $4
        this.capsapepat, // $5
        this.capsfecing, // $6
        this.capssueper, // $7
        this.capsnumcel, // $8
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
      const sql = `SELECT 
                    capsnumcid,
                    capsnomper,
                    capsapemat,
                    capsapepat, 
                    capsfecing,
                    capssueper,
                    capsnumcel 
                    FROM aperson 
                    where papscodper = $1`;

      const resultado = await pool.query(sql, [this.papscodper]);
      if (resultado.rowCount > 0) {
        this.capsnumcid = resultado.rows[0].capsnumcid;
        this.capsnomper = resultado.rows[0].capsnomper;
        this.capsapemat = resultado.rows[0].capsapemat;
        this.capsapepat = resultado.rows[0].capsapepat;
        this.capsfecing = resultado.rows[0].capsfecing;
        this.capssueper = resultado.rows[0].capssueper;
        this.capsnumcel = resultado.rows[0].capsnumcel;
      }
      return true;
    } catch (error) {
      console.error("Error al intentar obtener datos de persona:", error);
      return false;
    }
  }
  async obtenerCodigo() {
    try {
      const sql = `select papscodper from aperson where capsnumcid = $1`;

      const resultado = await pool.query(sql, [this.capsnumcid]);

      if (resultado.rowCount > 0) {
        return resultado.rows[0].papscodper;
        console.log("codigio Obtenido de base de datos");
      } else {
      }
    } catch (error) {
      console.error(
        "Error al intentar obtener codigo de persona atraves de ci:",
        error,
      );
    }
  }
  async modificar(){
    try{
      const sql = `update aperson set 
      capsnumcid = $1,
      capsnomper = $2,
      capsapepat = $3,
      capsapemat = $4,
      capsfecing = $5,
      capssueper = $6,
      capsnumcel = $7
      where papscodper = $8
      `;

      await pool.query(sql,[
      this.capsnumcid,
      this.capsnomper,
      this.capsapepat,
      this.capsapemat,
      this.capsfecing,
      this.capssueper,
      this.capsnumcel,
      this.papscodper
      ]);

      return true;
    }catch(error){
      console.log('Error al modificar la persona en la base de datos');
      return false;
    }


    
                

  }
}
export default aperson;
