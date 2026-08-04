import pool from '../config/db.js'; 
import Xnumcor from './xnumcor.js';

class arepart {
    constructor() {
        this.papscodper = "";
        this.capsnumcid = "";
        this.capsnomper = "";
        this.capsapemat = "";
        this.capsapepat = "";
        this.capsfecing = "";
        this.capssueper = "";
        this.capsnumcel = "";
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
                FROM aperson 
                WHERE papscodper = $1 
                LIMIT 1
            `;
            const resultado = await pool.query(sql, [this.papscodper]);
            
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
                INSERT INTO aperson (
                    papscodper, capsnumcid, capsnomper, capsapemat, capsapepat, 
                    capsfecing, capssueper, capsnumcel
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
            console.error("Error al grabar repartidor:", error);
            return false;
        }
    }

    // 3. MODIFICAR (ACTUALIZAR)
    async modificar() {
        try {
            const existe = await this.verificarExistencia();
            if (!existe) {
                return false; // No se puede modificar porque no existe
            }

            // Actualiza los 10 campos restantes usando papscodper como condición del WHERE ($11)
            const sql = `
                UPDATE aperson SET 
                    capsnumcid = $1, 
                    capsnomper = $2, 
                    capsapemat = $3, 
                    capsapepat = $4, 
                    capsfecing = $5, 
                    capssueper = $6, 
                    capsnumcel = $7, 
                    paracodrep = $8, 
                    faracodper = $9, 
                    caraestrep = $10
                WHERE papscodper = $11
            `;

            const parametros = [
                this.capsnumcid, // $1
                this.capsnomper, // $2
                this.capsapemat, // $3
                this.capsapepat, // $4
                this.capsfecing, // $5
                this.capssueper, // $6
                this.capsnumcel, // $7
                this.paracodrep, // $8
                this.faracodper, // $9
                this.caraestrep, // $10
                this.papscodper  // $11 (Condición WHERE)
            ];

            await pool.query(sql, parametros);
            return true;

        } catch (error) {
            console.error("Error al modificar repartidor:", error);
            return false;
        }
    }
    async lista(where = "") {
        try {
            // El arreglo vacío que reemplaza a List<aperson>
            let listaResultado = [];

            let sql = `
                SELECT 
                    papscodper, capsnumcid, capsnomper, capsapemat, capsapepat, 
                    capsfecing, capssueper, capsnumcel, paracodrep, faracodper, 
                    caraestrep
                FROM aperson
            `;

            // Validación del string WHERE equivalente al Replace y comparación de C#
            if (where.trim() !== "") {
                sql += ` WHERE ${where}`;
            }

            // Ejecutamos la consulta
            const resultado = await pool.query(sql);

            if (resultado && resultado.rows.length > 0) {
                // El bucle "while (Read())" de C# se simplifica recorriendo las filas con un bucle for...of
                for (const fila of resultado.rows) {
                    
                    // Creamos una nueva instancia de Repartidor pasándole los datos de la fila
                    const auxiliar = new Repartidor({
                        papscodper: fila.papscodper,
                        capsnumcid: fila.capsnumcid,
                        capsnomper: fila.capsnomper,
                        capsapemat: fila.capsapemat,
                        capsapepat: fila.capsapepat,
                        capsfecing: fila.capsfecing,
                        capssueper: fila.capssueper,
                        capsnumcel: fila.capsnumcel,
                        paracodrep: fila.paracodrep,
                        faracodper: fila.faracodper,
                        caraestrep: fila.caraestrep
                    });

                    // Agregamos el objeto al arreglo (equivalente a .Add() en C#)
                    listaResultado.push(auxiliar);
                }
            }

            return listaResultado;

        } catch (error) {
            console.error("Error al listar los repartidores:", error);
            return []; // Devolvemos un arreglo vacío si ocurre un fallo
        }
    }
}
export default arepart;
