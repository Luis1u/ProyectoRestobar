import pool from "../config/db.js";

class xnumcor {
  // Constructor con soporte para inicialización por objeto (útil para el método lista)
  constructor(datos = {}) {
    this.cxncnumcor = datos.cxncnumcor || 0;
    this.pxnctipcor = datos.pxnctipcor || "";
  }

  // 1. OBTENER DATOS
  async obtenerDatos() {
    try {
      const sql = `
                SELECT cxncnumcor, pxnctipcor 
                FROM xnumcor 
                WHERE pxnctipcor = $1
            `;
      const resultado = await pool.query(sql, [this.pxnctipcor]);

      if (resultado.rows.length > 0) {
        const fila = resultado.rows[0];
        this.cxncnumcor = Number(fila.cxncnumcor);
        this.pxnctipcor = fila.pxnctipcor;
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al obtener datos correlativo:", error);
      return false;
    }
  }

  // 2. VERIFICAR EXISTENCIA
  async verificarExistencia() {
    try {
      const sql = `
                SELECT 1 
                FROM xnumcor 
                WHERE pxnctipcor = $1 
                LIMIT 1
            `;
      const resultado = await pool.query(sql, [this.pxnctipcor]);
      return resultado.rows.length > 0;
    } catch (error) {
      console.error("Error al verificar existencia correlativo:", error);
      return false;
    }
  }

  // 3. GRABAR
  // 3. GRABAR
  async grabar() {
    try {
      const existe = await this.verificarExistencia();
      if (existe) return false;

      // $1 = Número (cxncnumcor)
      // $2 = Texto (pxnctipcor)
      const sql = `
                INSERT INTO xnumcor (cxncnumcor, pxnctipcor) 
                VALUES ($1, $2)
            `;
      await pool.query(sql, [Number(this.cxncnumcor), String(this.pxnctipcor)]);
      return true;
    } catch (error) {
      console.error("Error al grabar correlativo:", error);
      return false;
    }
  }

  // 4. MODIFICAR
  async modificar() {
    try {
      const existe = await this.verificarExistencia();
      if (!existe) return false;

      // $1 = Número (cxncnumcor)
      // $2 = Texto (pxnctipcor)
      const sql = `
                UPDATE xnumcor 
                SET cxncnumcor = $1 
                WHERE pxnctipcor = $2
            `;
      await pool.query(sql, [Number(this.cxncnumcor), String(this.pxnctipcor)]);
      return true;
    } catch (error) {
      console.error("Error al modificar correlativo:", error);
      return false;
    }
  }
  // 5. LISTA
 //se boroo lista 

  // 6. OBTENER SIGUIENTE (Por defecto suma 1)
  async obtenerSiguiente(n = 1) {
    let ban = false;

    // Intentamos obtener el número actual de la base de datos
    const existeDatos = await this.obtenerDatos();

    if (existeDatos) {
      this.cxncnumcor += n; // Suma la cantidad solicitada
      if (await this.modificar()) {
        ban = true;
      }
    } else {
      this.cxncnumcor = n; // Si no existía, empieza con el valor de n
      if (await this.grabar()) {
        ban = true;
      }
    }
    return ban;
  }
}

export default xnumcor;
