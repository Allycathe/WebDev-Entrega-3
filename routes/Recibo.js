import { Router } from 'express';
import sql from '../db/neon.js';
import { Auth } from '../Middlewares/AuthUser.js';

export const ReciboRouter = new Router();

ReciboRouter.get('/Recibo', Auth, async (req, res) => {
  try {
    const id = req.user.id;
    const lista = await sql(
      `SELECT Venta.id, Venta.costo, Venta.fecha FROM Venta WHERE idCliente=$1`,
      [id]
    );
    let suma = 0;
    for (let i = 0; i < lista.length; i++) {
      suma += lista[i].costo;
    }
    res.json({ lista, suma });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los recibos' });
  }
});

/**
 * @swagger
 * /Recibos:
 *    get:
 *      tags:
 *      - user
 *      summary: "Obtener los recibos del usuario"
 *      parameters:
 *        - name: id
 *          in: query
 *          description: "Mediante el id del usuario selecciona el/los recibos de la base de datos"
 *          required: true
 *          explode: true
 *          schema:
 *            type: integer
 *      responses:
 *        '200':
 *          description: "Todo bien"
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    idventa:
 *                      type: integer
 *                      example: 1
 *                    cantidad:
 *                      type: integer
 *                      example: 2
 *                    fecha:
 *                      type: string
 *                      example: "2024-10-26 01:27:13.4636"
 *                    costo:
 *                      type: integer
 *                      example: 12000
 */
