import pool from "../config/db.js";

class aproduc {
  constructor() {
    this.papdcodpro = ""; 
    this.capdestpro = true; 
    this.fapdcodcat = ""; 
    this.capdnompro = ""; 
    this.capddespro = "";
    this.capdingpro = ""; 
    this.capdstopro = 0; 
    this.capdstodia = 0; 
    this.capdpreven = 0.0;
    this.capdfotpro = ""; 
    this.capdfeccre = new Date(); 
    this.capdfecmod = new Date(); 
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
      console.error(
        "Error al verificar existencia en la tabla aproduc:",
        error
      );
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
          capdingpro, capdstopro, capdstodia, capdpreven, capdfotpro, capdfeccre, capdfecmod
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
        )
      `;

      const parametros = [
        this.papdcodpro,
        this.capdestpro,
        this.fapdcodcat,
        this.capdnompro,
        this.capddespro,
        this.capdingpro,
        this.capdstodia,
        this.capdstodia,
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
          capdstopro, capdstodia, capdpreven, capdfotpro, capdfeccre, capdfecmod
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
        this.capdstodia = row.capdstodia;
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
          capdstodia = $6,
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
        this.capdstodia,
        this.capdpreven,
        this.capdfotpro,
        this.papdcodpro
      ]);

      return true;
    } catch (error) {
      console.error(
        "Error al modificar el producto en la base de datos:",
        error
      );
      return false;
    }
  }

  async lista() {
    try {
      const sql = `
        SELECT 
          papdcodpro, capdestpro, fapdcodcat, capdnompro, capddespro,
          capdingpro, capdstopro, capdstodia, capdpreven, capdfotpro, capdfeccre, capdfecmod
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

  async listaConCategoria() {
    try {
      let sql = `
        select * from acatpro cat, aproduc pro where cat.pacpcodcat = pro.fapdcodcat
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

  async ProConCat() {
    try {
      let sql = `
        select * from acatpro cat, aproduc pro where cat.pacpcodcat = pro.fapdcodcat and pro.papdcodpro = $1
      `;

      const resultado = await pool.query(sql, [this.papdcodpro]);

      if (resultado.rowCount > 0) {
        return resultado.rows[0];
      } else {
        console.log("Algo salio mal o no hay productos registrados");
        return [];
      }
    } catch (error) {
      console.log("Error al listar productos: " + error);
      return [];
    }
  }

  async listaProCat(idCategoria) {
    try {
      const sql = `
      SELECT papdcodpro, capdnompro, capdingpro, capdpreven, capdstopro, capdstodia
      FROM aproduc 
      WHERE fapdcodcat = $1 and capdstopro > 0 
    `;

      const resultado = await pool.query(sql, [idCategoria]);
      return resultado.rows;
    } catch (error) {
      console.error("Error al listar productos:", error.message);
      return [];
    }
  }

  async eliminar() {
    try {
      const sql =
        "UPDATE aproduc SET capdestpro = false, capdfecmod = NOW() WHERE papdcodpro = $1";
      await pool.query(sql, [this.papdcodpro]);
      return true;
    } catch (error) {
      console.log("Algo salio mal al desactivar el producto: " + error);
      return false;
    }
  }

  async darAlta() {
    try {
      const sql =
        "UPDATE aproduc SET capdestpro = true, capdfecmod = NOW() WHERE papdcodpro = $1";
      await pool.query(sql, [this.papdcodpro]);
      return true;
    } catch (error) {
      console.log("Algo salio mal al dar de alta el producto: " + error);
      return false;
    }
  }

  async esBebida(codigoProducto) {
    try {
      const sql =
        "select cat.cacptipcat from aproduc pro, acatpro cat where pro.fapdcodcat = cat.pacpcodcat and papdcodpro = $1";
      const resutado = await pool.query(sql, [codigoProducto]);
      if (resutado.rowCount > 0) {
        if (resutado.rows[0].cacptipcat == "BEBIDA") {
          return true;
        } else {
          return false;
        }
      } else {
        console.log("algo salio mal en la consulta es bebida");
      }
    } catch (error) {
      console.log("Algo salio mal al desactivar el producto: " + error);
      return false;
    }
  }

  async esComida(codigoProducto) {
    try {
      const sql =
        "select cat.cacptipcat from aproduc pro, acatpro cat where pro.fapdcodcat = cat.pacpcodcat and papdcodpro = $1";
      const resutado = await pool.query(sql, [codigoProducto]);
      if (resutado.rowCount > 0) {
        if (resutado.rows[0].cacptipcat == "COMIDA") {
          return true;
        } else {
          return false;
        }
      } else {
        console.log("algo salio mal en la consulta es comida");
      }
    } catch (error) {
      console.log("Algo salio mal al desactivar el producto: " + error);
      return false;
    }
  }

  async disminuirStock(codigoProducto, cantidadCompra) {
    try {
      const sql =
        "UPDATE aproduc SET capdstopro = (capdstopro - $2) WHERE papdcodpro = $1 and capdstopro >= $2";
      await pool.query(sql, [codigoProducto, cantidadCompra]);
      return true;
    } catch (error) {
      console.log("Algo salio mal al disminuir el stock: " + error);
      return false;
    }
  }

  

  
  async iniciarStockDiario() {
    try {
      const sql =
        "update aproduc set capdstopro = $1 where papdcodpro = $2";
      await pool.query(sql, [this.capdstodia,this.papdcodpro]);
      return true;
      
    } catch (error) {
      console.log("Algo salio mal en consultar detalles de pedido en espera para cocina " + error);
      return false;
    }
  }
}

export default aproduc;