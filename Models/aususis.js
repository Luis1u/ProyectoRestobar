import pool from "../config/db.js";

class aususis {
  constructor() {
    this.pauscodusu = "";
    this.causestusu = true;
    this.causnomlog = "";
    this.causpasswo = "";
    this.causactpas = true;
    this.causrolusu = "";
    this.fauscodper = "";
  }

  async verificarExistencia() {
    try {
      const sql = `
        SELECT 1 
        FROM aususis 
        WHERE pauscodusu = $1 
        LIMIT 1
      `;
      const resultado = await pool.query(sql, [this.pauscodusu]);
      return resultado.rowCount > 0;
    } catch (error) {
      console.error(
        "Error al verificar existencia en la tabla aususis:",
        error,
      );
      return false;
    }
  }

  async verificarExistenciaLogin(login) {
    try {
      const sql = `
        SELECT causnomlog 
        FROM aususis 
        WHERE causnomlog = $1 
        LIMIT 1
      `;
      const resultado = await pool.query(sql, [login]);
      return resultado.rowCount > 0;
    } catch (error) {
      console.error("Error al verificar existencia por login:", error);
      return false;
    }
  }

  async grabar() {
    try {
      if (await this.verificarExistencia()) {
        return false;
      }
      const sql = `
        INSERT INTO aususis (
          pauscodusu, causestusu, causnomlog, causpasswo, 
          causactpas, causrolusu, fauscodper
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        )
      `;

      const parametros = [
        this.pauscodusu,
        this.causestusu,
        this.causnomlog,
        this.causpasswo,
        this.causactpas,
        this.causrolusu,
        this.fauscodper,
      ];

      await pool.query(sql, parametros);
      return true;
    } catch (error) {
      console.error("Error al grabar un nuevo usuario:", error);
      return false;
    }
  }

  async obtenerDatos(where = "") {
    try {
      let sql = `
        SELECT 
          causestusu, causnomlog, causpasswo, 
          causactpas, causrolusu, fauscodper 
        FROM aususis 
        WHERE pauscodusu = $1
      `;

      if (where !== "") {
        sql += where;
      }

      const resultado = await pool.query(sql, [this.pauscodusu]);

      if (resultado.rowCount > 0) {
        const row = resultado.rows[0];
        this.causestusu = row.causestusu;
        this.causnomlog = row.causnomlog;
        this.causpasswo = row.causpasswo;
        this.causactpas = row.causactpas;
        this.causrolusu = row.causrolusu;
        this.fauscodper = row.fauscodper;
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error al intentar obtener datos de usuario:", error);
      return false;
    }
  }
  async obtenerDatosUsuPer() {
    try {
      let sql = `
       select * from aususis usuario, aperson persona where usuario.fauscodper = persona.papscodper and usuario.pauscodusu = $1
      `;

      

      const resultado = await pool.query(sql, [this.pauscodusu]);

      if (resultado.rowCount > 0) {
        return resultado.rows[0];
       
      }

      
    } catch (error) {
      console.error("Error al intentar obtener datos de usuario:", error);
      return [];
    }
  }
  async obtenerDatosUsuPerPorlogin(causnomlog) {
    try {
      let sql = `
       select * from aususis usuario, aperson persona where usuario.fauscodper = persona.papscodper and usuario.causnomlog = $1
      `;

      

      const resultado = await pool.query(sql, [causnomlog]);

      if (resultado.rowCount > 0) {
        return resultado.rows[0];
       
      }

      return [];
    } catch (error) {
      console.error("Error al intentar obtener datos de usuario:", error);
      return [];
    }
  }

  async modificar() {
    try {
      const sql = `
        UPDATE aususis SET 
          causestusu = $1,
          causnomlog = $2,
          causpasswo = $3,
          causactpas = $4,
          causrolusu = $5,
          fauscodper = $6
        WHERE pauscodusu = $7
      `;

      await pool.query(sql, [
        this.causestusu,
        this.causnomlog,
        this.causpasswo,
        this.causactpas,
        this.causrolusu,
        this.fauscodper,
        this.pauscodusu,
      ]);

      return true;
    } catch (error) {
      console.error(
        "Error al modificar el usuario en la base de datos:",
        error
      );
      return false;
    }
  }
  async restablecerClave() {
    try {
      const sql = `
        UPDATE aususis SET 
          causactpas = true
        WHERE pauscodusu = $1
      `;

      await pool.query(sql, [
        this.pauscodusu
      ]);

      return true;
    } catch (error) {
      console.error(
        "Error al restablecer contraseña :",
        error
      );
      return false;
    }
  }
    async modificarContraseña(causpasswo, causnomlog ) {
      try {
        const sql = `
          UPDATE aususis SET 
            causpasswo = $1,
            causactpas = false
          WHERE causnomlog = $2
        `;

        await pool.query(sql,[causpasswo, causnomlog]);

        return true;
      } catch (error) {
        console.error(
          "Error al modificar el usuario en la base de datos:",
          error
        );
        return false;
      }
    }

  async listaConPer() {
    try {
      const sql = `
        select * from aususis usu,
         aperson per where per.papscodper =  usu.fauscodper
      `;

      const resultado = await pool.query(sql);

      if (resultado.rowCount > 0) {
        return resultado.rows;
      } else {
        console.log("Algo salio mal o no hay usuarios registrados");
        return [];
      }
    } catch (error) {
      console.error("Error al listar usuarios: " + error);
      return false;
    }
  }
  async PerSinUsu() {
    try {
      const sql = `
        select * from aperson where capsestper = true and  papscodper not in (select persona.papscodper from aususis usuario, aperson persona where usuario.fauscodper = persona.papscodper)
      `;

      const resultado = await pool.query(sql);

      if (resultado.rowCount > 0) {
        return resultado.rows;
      } else {
        console.log("Algo salio mal o no hay usuarios registrados");
        return [];
      }
    } catch (error) {
      console.error("Error al listar usuarios: " + error);
      return false;
    }
  }
  

  async eliminar() {
    try {
      const sql = "UPDATE aususis SET causestusu = false WHERE pauscodusu = $1";
      await pool.query(sql, [this.pauscodusu]);
      return true;
    } catch (error) {
      console.error("Algo salio mal al desactivar el usuario: " + error);
      return false;
    }
  }

  async darAlta() {
    try {
      const sql = "UPDATE aususis SET causestusu = true WHERE pauscodusu = $1";
      await pool.query(sql, [this.pauscodusu]);
      return true;
    } catch (error) {
      console.error("Algo salio mal al dar alta al usuario: " + error);
      return false;
    }
  }
}

export default aususis;
