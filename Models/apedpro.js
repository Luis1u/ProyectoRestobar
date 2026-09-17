import pool from "../config/db.js";

class apedpro {
  constructor() {
    const ahora = new Date();
    this.pappcodped = ""; // Código del pedido (PK)
    this.cappcanper = 0;  // Cantidad de personas
    this.capptipped = "LOCAL"; // Tipo de pedido
    this.cappfecped = ahora.toLocaleDateString('sv'); // Fecha del pedido
    this.capphorped = ahora.toLocaleTimeString('es-ES', { hour12: false }); // Hora del pedido
    this.cappestcoc = "ESPERA"; // Estado de Cocina (NUEVO)
    this.cappestbar = "ESPERA"; // Estado de Barra (NUEVO)
    this.capptotpag = 0;  // Total a pagar
    this.fappcodusu = null; // FK Usuario (Mesero / Atención)
    this.fappcodrep = null; // FK Repartidor
    this.fappcodmes = null; // FK Mesa
    this.fappcodcli = null; // FK Cliente
    this.fappcodcoc = null; // FK Cocinero
    this.fappcodbar = null; // FK Barista
    this.fappcodcaj = null; // FK Cajero
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
          cappestcoc, cappestbar, capptotpag, fappcodusu, fappcodrep, 
          fappcodmes, fappcodcli, fappcodcoc, fappcodbar, fappcodcaj
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        )
      `;

      const parametros = [
        this.pappcodped,
        this.cappcanper,
        this.capptipped,
        this.cappfecped,
        this.capphorped,
        this.cappestcoc,
        this.cappestbar,
        this.capptotpag,
        this.fappcodusu,
        this.fappcodrep,
        this.fappcodmes,
        this.fappcodcli,
        this.fappcodcoc,
        this.fappcodbar,
        this.fappcodcaj
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
          cappcanper, capptipped, cappfecped, capphorped, 
          cappestcoc, cappestbar, capptotpag, fappcodusu, 
          fappcodrep, fappcodmes, fappcodcli, fappcodcoc, 
          fappcodbar, fappcodcaj
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
        this.cappestcoc = row.cappestcoc;
        this.cappestbar = row.cappestbar;
        this.capptotpag = row.capptotpag;
        this.fappcodusu = row.fappcodusu;
        this.fappcodrep = row.fappcodrep;
        this.fappcodmes = row.fappcodmes;
        this.fappcodcli = row.fappcodcli;
        this.fappcodcoc = row.fappcodcoc;
        this.fappcodbar = row.fappcodbar;
        this.fappcodcaj = row.fappcodcaj;
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
          cappestcoc = $5,
          cappestbar = $6,
          capptotpag = $7,
          fappcodusu = $8,
          fappcodrep = $9,
          fappcodmes = $10,
          fappcodcli = $11,
          fappcodcoc = $12,
          fappcodbar = $13,
          fappcodcaj = $14
        WHERE pappcodped = $15
      `;

      await pool.query(sql, [
        this.cappcanper,
        this.capptipped,
        this.cappfecped,
        this.capphorped,
        this.cappestcoc,
        this.cappestbar,
        this.capptotpag,
        this.fappcodusu,
        this.fappcodrep,
        this.fappcodmes,
        this.fappcodcli,
        this.fappcodcoc,
        this.fappcodbar,
        this.fappcodcaj,
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
          cappestcoc, cappestbar, capptotpag, fappcodusu, fappcodrep, 
          fappcodmes, fappcodcli, fappcodcoc, fappcodbar, fappcodcaj
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

  // Cancelar / Anular un pedido (cambiar estados a CANCELADO)
  async eliminar() {
    try {
      const sql = `
        UPDATE apedpro 
        SET cappestcoc = 'CANCELADO', cappestbar = 'CANCELADO' 
        WHERE pappcodped = $1
      `;
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
      const sql = `
        UPDATE apedpro 
        SET cappestcoc = 'PENDIENTE', cappestbar = 'PENDIENTE' 
        WHERE pappcodped = $1
      `;
      await pool.query(sql, [this.pappcodped]);
      return true;
    } catch (error) {
      console.error('Algo salió mal al activar el pedido: ' + error);
      return false;
    }
  }
}

export default apedpro;