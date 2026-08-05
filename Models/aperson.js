import pool from '../config/db.js'; 
import Xnumcor from './xnumcor.js';

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
            return resultado.rows.length > 0;
        } catch (error) {
            console.error("Error al verificar existencia en la tabla aperson:", error);
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
            console.error("Error al grabar una nueva persona:", error);
            return false;
        }
    }
}
export default aperson;
