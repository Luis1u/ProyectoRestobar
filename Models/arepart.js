import pool from "../config/db.js";
import Xnumcor from "./xnumcor.js";

class arepart {
  constructor() {
    this.paracodrep = "";
    this.faracodper = "";
    this.caraestrep = "";
  }

  // 1. VERIFICAR EXISTENCIA
  // En JS se acostumbra a usar COUNT en el SQL si solo quieres saber si existe.
  async verificarExistencia() {
    try {
      const sql = `
                SELECT 1 
                FROM arepart 
                WHERE arepart = $1 
                LIMIT 1
            `;
      const resultado = await pool.query(sql, [this.paracodrep]);

      // Si devuelve filas, el registro existe (HasRows)
      return resultado.rows.length > 0;
    } catch (error) {
      console.error("Error al verificar existencia:", error);
      return false;
    }
  }

  // 2. GRABAR (INSERTAR)
  async grabar() {
    try {
      const sql = `
                INSERT INTO arepart (
                    paracodrep,
                    faracodper,
                    caraestrep
                ) VALUES (
                    $1, $2, $3
                )
            `;

      const parametros = [this.paracodrep, this.faracodper, this.caraestrep];

      await pool.query(sql, parametros);

      return true;
    } catch (error) {
      console.error("Error al grabar en la tabla arepart:", error);
      return false;
    }
  }

  // 3. MODIFICAR (ACTUALIZAR)
  async modificar() {
    try {
      const sql = `update arepart set caraestrep = $1 where faracodper = $2`;

      await pool.query(sql,[this.caraestrep,this.faracodper]);
      return true;
     
    } catch (error) {
      console.error("Error al modificar repartidor:", error);
      return false;
    }
  }
  async obtenerDatosForaneos() {
    try {
      const sql = `SELECT 
                    paracodrep,
                    caraestrep 
                    FROM arepart 
                    where faracodper = $1`;

      const resultado = await pool.query(sql, [this.faracodper]);
      if (resultado.rowCount > 0) {
        this.paracodrep = resultado.rows[0].paracodrep;
        this.caraestrep = resultado.rows[0].caraestrep;
      }
      return true;
    } catch (error) {
      console.error("Error al intentar obtener datos de repartidor:", error);
      return false;
    }
  }
  async eliminar () {
    try{

      const sql =  `update arepart set caraestrep = false where faracodper = $1`;
      
      await pool.query(sql,[this.faracodper]);

      return true;
      
    }catch(error){
      console.log("Erro al cambiar de estado a falso del repartidor",error);
      return false;

    }

  }
  async darAlta () {
    try{

      const sql =  `update arepart set caraestrep = true where faracodper = $1`;
      
      await pool.query(sql,[this.faracodper]);

      return true;

    }catch(error){
      console.log("Erro al cambiar de estado a true del repartidor",error);
      return false;

    }

  }
}
export default arepart;
