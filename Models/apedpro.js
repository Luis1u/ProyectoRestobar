import pool from "../config/db.js";

class apedpro {
  constructor() {
    const ahora = new Date();
    this.pappcodped = ""; // Código del pedido (PK)
    this.cappcanper = 0;  // Cantidad de personas
    this.capptipped = ""; // Tipo de pedido
    this.cappfecped = ahora.toLocaleDateString('sv');; // Fecha del pedido
    this.capphorped = ahora.toLocaleTimeString('es-ES', { hour12: false }); // Hora del pedido
    this.cappestped = "PENDIENTE"; // Estado del pedido
    this.capptotpag = 0;  // Total a pagar
    this.fappcodusu = ""; // FK Usuario
    this.fappcodrep = ""; // FK Repartidor
    this.fappcodmes = ""; // FK Mesa
    this.fappcodcli = ""; // FK Cliente
  }

  // Verificar si existe un pedido por su código primario
  async verificarExistencia() {
    try {
      const sql = `
        SELECT 1 
        FROM apedpro 
        WHERE pappcodped = $1 
        LIMIT 1
      `;
      const resultado = await pool.query(sql, [this.pappcodped]);
      return resultado.rowCount > 0;
    } catch (error) {
      console.error("Error al verificar existencia en apedpro:", error);
      return false;
    }
  }

  // Grabar / Registrar un nuevo pedido
  async grabar() {
    try {
      if (await this.verificarExistencia()) {
        return false;
      }

      const sql = `
        INSERT INTO apedpro (
          pappcodped, cappcanper, capptipped, cappfecped, capphorped,
          cappestped, capptotpag, fappcodusu, fappcodrep, fappcodmes, fappcodcli
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
      `;

      const parametros = [
        this.pappcodped,
        this.cappcanper,
        this.capptipped,
        this.cappfecped,
        this.capphorped,
        this.cappestped,
        this.capptotpag,
        this.fappcodusu,
        this.fappcodrep,
        this.fappcodmes,
        this.fappcodcli
      ];

      await pool.query(sql, parametros);
      return true;
    } catch (error) {
      console.error("Error al grabar un nuevo pedido:", error);
      return false;
    }
  }

  // Obtener los datos de un pedido por su código (pappcodped)
  async obtenerDatos(where = "") {
    try {
      let sql = `
        SELECT 
          cappcanper, capptipped, cappfecped, capphorped, cappestped,
          capptotpag, fappcodusu, fappcodrep, fappcodmes, fappcodcli
        FROM apedpro 
        WHERE pappcodped = $1
      `;

      if (where !== "") {
        sql += ` ${where}`;
      }

      const resultado = await pool.query(sql, [this.pappcodped]);

      if (resultado.rowCount > 0) {
        const row = resultado.rows[0];
        this.cappcanper = row.cappcanper;
        this.capptipped = row.capptipped;
        this.cappfecped = row.cappfecped;
        this.capphorped = row.capphorped;
        this.cappestped = row.cappestped;
        this.capptotpag = row.capptotpag;
        this.fappcodusu = row.fappcodusu;
        this.fappcodrep = row.fappcodrep;
        this.fappcodmes = row.fappcodmes;
        this.fappcodcli = row.fappcodcli;
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error al intentar obtener datos del pedido:", error);
      return false;
    }
  }

  // Modificar la información de un pedido existente
  async modificar() {
    try {
      const sql = `
        UPDATE apedpro SET 
          cappcanper = $1,
          capptipped = $2,
          cappfecped = $3,
          capphorped = $4,
          cappestped = $5,
          capptotpag = $6,
          fappcodusu = $7,
          fappcodrep = $8,
          fappcodmes = $9,
          fappcodcli = $10
        WHERE pappcodped = $11
      `;

      await pool.query(sql, [
        this.cappcanper,
        this.capptipped,
        this.cappfecped,
        this.capphorped,
        this.cappestped,
        this.capptotpag,
        this.fappcodusu,
        this.fappcodrep,
        this.fappcodmes,
        this.fappcodcli,
        this.pappcodped
      ]);

      return true;
    } catch (error) {
      console.error("Error al modificar el pedido en la base de datos:", error);
      return false;
    }
  }

  // Listar todos los pedidos
  async lista() {
    try {
      const sql = `
        SELECT 
          pappcodped, cappcanper, capptipped, cappfecped, capphorped,
          cappestped, capptotpag, fappcodusu, fappcodrep, fappcodmes, fappcodcli
        FROM apedpro
      `;

      const resultado = await pool.query(sql);

      if (resultado.rowCount > 0) {
        return resultado.rows;
      } else {
        console.log('No se encontraron registros de pedidos');
        return [];
      }
    } catch (error) {
      console.error("Error al listar pedidos: " + error);
      return false;
    }
  }

  // Cancelar / Anular un pedido (cambiar estado)
  async eliminar() {
    try {
      const sql = "UPDATE apedpro SET cappestped = 'CANCELADO' WHERE pappcodped = $1";
      await pool.query(sql, [this.pappcodped]);
      return true;
    } catch (error) {
      console.error('Algo salió mal al cancelar el pedido: ' + error);
      return false;
    }
  }

  // Reactivar o Dar de alta un pedido
  async darAlta() {
    try {
      const sql = "UPDATE apedpro SET cappestped = 'ACTIVO' WHERE pappcodped = $1";
      await pool.query(sql, [this.pappcodped]);
      return true;
    } catch (error) {
      console.error('Algo salió mal al activar el pedido: ' + error);
      return false;
    }
  }
}

export default apedpro;