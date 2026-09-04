import pool from "../config/db.js";

class aproduc {
  constructor() {
    this.papdcodpro = ""; // PK - Código de producto
    this.capdestpro = true; // Estado (activo/inactivo)
    this.fapdcodcat = ""; // FK - Código de categoría
    this.capdnompro = ""; // Nombre del producto
    this.capddespro = ""; // Descripción
    this.capdingpro = ""; // Ingredientes / Notas
    this.capdstopro = 0;  // Stock actual
    this.capdpreven = 0.0; // Precio de venta
    this.capdfotpro = ""; // URL o ruta de la foto
    this.capdfeccre = new Date(); // Fecha de creación
    this.capdfecmod = new Date(); // Fecha de modificación
  }

  async verificarExistencia() {
    try {
      const sql = `
        SELECT 1 
        FROM aproduc 
        WHERE papdcodpro = $1 
        LIMIT 1
      `;
      const resultado = await pool.query(sql, [this.papdcodpro]);
      return resultado.rowCount > 0;
    } catch (error) {
      console.error("Error al verificar existencia en la tabla aproduc:", error);
      return false;
    }
  }

  async grabar() {
    try {
      if (await this.verificarExistencia()) {
        return false;
      }
      const sql = `
        INSERT INTO aproduc (
          papdcodpro, capdestpro, fapdcodcat, capdnompro, capddespro,
          capdingpro, capdstopro, capdpreven, capdfotpro, capdfeccre, capdfecmod
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        )
      `;

      const parametros = [
        this.papdcodpro,
        this.capdestpro,
        this.fapdcodcat,
        this.capdnompro,
        this.capddespro,
        this.capdingpro,
        this.capdstopro,
        this.capdpreven,
        this.capdfotpro
      ];

      await pool.query(sql, parametros);
      return true;
    } catch (error) {
      console.error("Error al grabar un nuevo producto:", error);
      return false;
    }
  }

  async obtenerDatos(where = "") {
    try {
      let sql = `
        SELECT 
          capdestpro, fapdcodcat, capdnompro, capddespro, capdingpro,
          capdstopro, capdpreven, capdfotpro, capdfeccre, capdfecmod
        FROM aproduc 
        WHERE papdcodpro = $1
      `;

      if (where !== "") {
        sql += " " + where;
      }

      const resultado = await pool.query(sql, [this.papdcodpro]);

      if (resultado.rowCount > 0) {
        const row = resultado.rows[0];
        this.capdestpro = row.capdestpro;
        this.fapdcodcat = row.fapdcodcat;
        this.capdnompro = row.capdnompro;
        this.capddespro = row.capddespro;
        this.capdingpro = row.capdingpro;
        this.capdstopro = row.capdstopro;
        this.capdpreven = row.capdpreven;
        this.capdfotpro = row.capdfotpro;
        this.capdfeccre = row.capdfeccre;
        this.capdfecmod = row.capdfecmod;
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error al intentar obtener datos del producto:", error);
      return false;
    }
  }

  async modificar() {
    try {
      const sql = `
        UPDATE aproduc SET 
          capdestpro = $1,
          fapdcodcat = $2,
          capdnompro = $3,
          capddespro = $4,
          capdingpro = $5,
          capdstopro = $6,
          capdpreven = $7,
          capdfotpro = $8,
          capdfecmod = NOW()
        WHERE papdcodpro = $9
      `;

      await pool.query(sql, [
        this.capdestpro,
        this.fapdcodcat,
        this.capdnompro,
        this.capddespro,
        this.capdingpro,
        this.capdstopro,
        this.capdpreven,
        this.capdfotpro,
        this.papdcodpro
      ]);

      return true;
    } catch (error) {
      console.error("Error al modificar el producto en la base de datos:", error);
      return false;
    }
  }

  async lista() {
    try {
      const sql = `
        SELECT 
          papdcodpro, capdestpro, fapdcodcat, capdnompro, capddespro,
          capdingpro, capdstopro, capdpreven, capdfotpro, capdfeccre, capdfecmod
        FROM aproduc
      `;

      const resultado = await pool.query(sql);

      if (resultado.rowCount > 0) {
        return resultado.rows;
      } else {
        console.log("Algo salio mal o no hay productos registrados");
        return [];
      }
    } catch (error) {
      console.log("Error al listar productos: " + error);
      return [];
    }
  }
  async listaConCategoria(idCategoria) {
    try {
      let sql = `
        select * from acatpro cat, aproduc pro where cat.pacpcodcat = pro.fapdcodcat and pro.fapdcodcat = $1
      `;

     

      const resultado = await pool.query(sql,[idCategoria]);

      if (resultado.rowCount > 0) {
        return resultado.rows;
      } else {
        console.log("Algo salio mal o no hay productos registrados");
        return [];
      }
    } catch (error) {
      console.log("Error al listar productos: " + error);
      return [];
    }
  }

  async eliminar() {
    try {
      const sql = "UPDATE aproduc SET capdestpro = false, capdfecmod = NOW() WHERE papdcodpro = $1";
      await pool.query(sql, [this.papdcodpro]);
      return true;
    } catch (error) {
      console.log("Algo salio mal al desactivar el producto: " + error);
      return false;
    }
  }

  async darAlta() {
    try {
      const sql = "UPDATE aproduc SET capdestpro = true, capdfecmod = NOW() WHERE papdcodpro = $1";
      await pool.query(sql, [this.papdcodpro]);
      return true;
    } catch (error) {
      console.log("Algo salio mal al dar de alta el producto: " + error);
      return false;
    }
  }
}

export default aproduc;