import pool from "../config/db.js";

class validacion {
 
  static async insertarExiste(tabla, campo, valor) {
    try {
      const sql = `
        SELECT 1
        FROM ${tabla} 
        WHERE ${campo} = $1 
        LIMIT 1
      `;
      const resultado = await pool.query(sql, [valor]);
      if(resultado.rowCount > 0){
        return true;
      }else{
        return false;
      }
    } catch (error) {
      console.error(
        "Error al verificar existencia en la tabla aususis:",
        error,
      );
      return false;
    }
  }
  static async modificarExiste(tabla, campo, valorCampo, campoClave, valorClave ) {
    try {
      const sql = `
       SELECT 1
        FROM ${tabla} 
        WHERE ${campo} = $1
        AND ${campoClave}  = $2
        LIMIT 1
      `;
      const resultado = await pool.query(sql, [valorCampo, valorClave]);
      if(resultado.rowCount > 0){
        return true;
      }else{
        return false;
      }
    } catch (error) {
      console.error(
        "Error al verificar existencia en la tabla aususis:",
        error,
      );
      return false;
    }
  }

 
}

export default validacion;
