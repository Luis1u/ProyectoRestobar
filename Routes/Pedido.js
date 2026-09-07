import { Router } from "express";
import path from "path";
import Xnumcor from "../Models/xnumcor.js";
import Aproduc from "../Models/aproduc.js";
import Acatpro from "../Models/acatpro.js";
import pool from "../config/db.js";
const router = Router();

router.post('/guardar', async (req, res) => {
    try {
        // Rescatamos los atributos que vienen desde el cliente
        const { items, total } = req.body;

        // Validar que el pedido no llegue vacío
        if (!items || items.length === 0) {
            return res.status(400).json({ 
                exito: false, 
                mensaje: 'El pedido no contiene productos.' 
            });
        }

        // Recorrer los productos rescatados
        items.forEach(item => {
            console.log(`Producto ID: ${item.idProducto}`);
            console.log(`Cantidad: ${item.cantidad}`);
            console.log(`Precio U.: ${item.precioUnitario}`);
            console.log(`Nota: ${item.nota}`);
        });

        // TODO: Insertar cabecera (Mesa/Total) y detalle (Items) en la Base de Datos

        return res.json({
            exito: true,
            mensaje: 'Pedido guardado correctamente'
        });

    } catch (error) {
        console.error('Error al guardar pedido:', error);
        return res.status(500).json({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
});
export default router;