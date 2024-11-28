import { Router } from 'express';
import sql from '../db/neon.js';

export const ProductoRouter = new Router();

ProductoRouter.get('/products/:id', async (req, res) => {
  const producto = await sql`select * from Productos where id=${req.params.id}`;
  return res.json({ producto });
});
ProductoRouter.get('/products/', async (req, res) => {
  const producto = await sql`select * from Productos`;
  return res.json({ producto });
});

/**
 * @swagger
 * /products:
 *    get:
 *      tags:
 *        - productos
 *      summary: "Obtener todos los productos de la base de datos"
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
 *                    id:
 *                      type: integer
 *                      example: 1
 *                    nombre:
 *                      type: string
 *                      example: "cabaña"
 *                    descripcion:
 *                      type: string
 *                      example: "Una linda cabaña"
 *                    precio:
 *                      type: integer
 *                      example: 12000
 *                    stock:
 *                      type: integer
 *                      example: 2
 *                    imagen:
 *                      type: string
 *                      example: "www.google.com"
 */
