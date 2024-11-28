import { Router } from 'express';
import sql from '../db/neon.js';
import { Auth } from '../Middlewares/AuthUser.js';


const Clave = 'ME ECHE DESARROLLO WEB Y MOVIL';
const Cookie_name = 'Seguridad';

export const PerfilRouter = new Router();

PerfilRouter.get('/profile', Auth, async (req, res) => {
  const user = await sql(
    `SELECT nombre, correo, dinero, id FROM Cliente WHERE id=$1`,
    [req.user.id]
  );
  return res.json(user[0]);
});

PerfilRouter.post('/Wallet', Auth, async (req, res) => {
  try {
    const dinero = req.body.money;
    const id = req.user.id;
    await sql`UPDATE Cliente SET dinero = dinero + ${dinero} WHERE id = ${id}`;
    res.json({ message: 'Dinero agregado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar dinero a la wallet' });
  }
});

PerfilRouter.get('/Logout', (req, res) => {
  res.cookie(Cookie_name, ' ', { maxAge: 0 });
  res.json({ message: 'Logout exitoso' });
});
/**
 * @swagger
 *  /profile:
 *    get:
 *      tags:
 *        - user
 *      summary: "Comprar los productos del carrito"
 *      parameters:
 *        - name: token
 *          in: cookie
 *          required: true
 *          schema:
 *            type: string
 *            example: tywerht5i4uyl34nl435
 *      responses:
 *        '200':
 *          description: "Todo ok"
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    nombre:
 *                      type: string
 *                      example: "Eulisterio"
 *                    correo:
 *                      type: string
 *                      example: "elulisterio@mail"
 *                    dinero:
 *                      type: integer
 *                      example: 3000000
 *        '401':
 *          description: "No se encontro el usuario"
 */

/**
 * @swagger
 * /Logout:
 *   get:
 *     tags:
 *      - user
 *     summary: Cerrar sesión del usuario
 *     description: Permite al usuario autenticado cerrar sesión.
 *     responses:
 *       200:
 *         description: Logout exitoso.
 */

/**
 * @swagger
 *  /Wallet:
 *    post:
 *      tags:
 *        - user
 *      summary: "Permite agregar dinero a la wallet"
 *      parameters:
 *        - name: id
 *          in: query
 *          description: "Permite distinguir al usario que está agregando dinero"
 *          required: true
 *          explode: true
 *          schema:
 *            type: integer
 *      responses:
 *        '200':
 *          description: todo bien
 */
