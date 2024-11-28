import { Router } from 'express';
import sql from '../db/neon.js';

export const InicioRouter = new Router();

InicioRouter.get('/', async (req, res) => {
  const productos = await sql(
    'SELECT id, nombre, descripcion, precio, stock FROM Productos order by id asc'
  );
  res.json({ productos });
});

/**
 * @swagger
 * /products/{id}:
 *     get:
 *      tags:
 *        - productos
 *      summary: "Obtener un producto en especifico los productos de la base de datos"
 *      parameters:
 *        - name: id
 *          in: path
 *          description: "Mediante el id selecciona el producto de la base de datos"
 *          required: true
 *          explode: true
 *          example: 1
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
 *        '404':
 *          description: "producto no encontrado"
 */
