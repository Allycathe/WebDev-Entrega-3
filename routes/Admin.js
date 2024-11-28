import { Router } from 'express';
import sql from '../db/neon.js';
import { AuthAdmin } from '../Middlewares/AuthAdmin.js';

export const AdminRouter = new Router();

AdminRouter.get('/admin/totalEarned', AuthAdmin, async (req, res) => {
  try {
    const lista = await sql(
      `SELECT Venta.id, Venta.idCliente, Venta.cantidad, Venta.costo, Venta.fecha, Cliente.nombre 
       FROM Venta 
       JOIN Cliente ON Cliente.id = Venta.idCliente`
    );
    res.json({ lista });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

AdminRouter.get('/admin/products', AuthAdmin, async (req, res) => {
  try {
    const lista = await sql('SELECT * FROM Productos');
    const venta = await sql('SELECT costo FROM Venta');
    let suma = 0;
    for (let i = 0; i < lista.length; i++) {
      if (venta[i]) {
        suma += venta[i].costo;
      }
    }
    res.json({ lista, suma });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

AdminRouter.post('/admin/products/', AuthAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen, stock } = req.body;
    const query =
      'INSERT INTO Productos (Nombre, Descripcion, Precio, Imagen, Stock) VALUES ($1, $2, $3, $4, $5)';
    await sql(query, [nombre, descripcion, precio, imagen, stock]);
    const productosActualizados = await sql(
      'SELECT * FROM Productos ORDER BY id DESC'
    );
    res.status(200).json({
      message: 'Producto agregado correctamente',
      productos: productosActualizados,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el producto' });
  }
});

AdminRouter.post('/admin/products/:id', AuthAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen, stock } = req.body;
    const id = req.params.id;
    await sql`UPDATE Productos SET nombre=${nombre}, descripcion=${descripcion}, precio=${precio}, imagen=${imagen}, stock=${stock} WHERE id=${id}`;
    res.status(200).json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    res.status(404).json({ error: 'Error al actualizar el producto' });
  }
});
AdminRouter.post('/admin/delete/:id', AuthAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await sql('DELETE FROM Productos where id=$1', [id]);
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(404).json({ error: 'Error al actualizar el producto' });
  }
});

/**
 * @swagger
 * /admin/totalEarned:
 *   get:
 *     tags:
 *       - admin
 *     summary: Monto total de ventas
 *     parameters:
 *       - name: token
 *         in: cookie
 *         description: "Distingue aun admin de un usuario"
 *         required: true
 *         explode: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: todo bien
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Total_ventas:
 *                     type: integer
 *                     example: 1000000
 *       '401':
 *         description: El usuario no esta autentificado
 *       '403':
 *         description: "El usuario no tiene permiso"
 */

/**
 * @swagger
 *  /admin/products/:
 *    get:
 *      tags:
 *        - admin
 *      summary: muestra todos los productos
 *      parameters:
 *        - name: token
 *          in: cookie
 *          description: "Distingue a un admin de un usuario"
 *          required: true
 *          explode: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: todo ok
 *    post:
 *      tags:
 *        - admin
 *      summary: "Permite a los admins crear productos"
 *      parameters:
 *        - name: token
 *          in: cookie
 *          description: "Distingue aun admin de un usuario"
 *          required: true
 *          explode: true
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                nombre:
 *                  type: string
 *                  description: "Nombre del producto"
 *                  example: "Cabaña en el bosque"
 *                descripcion:
 *                  type: string
 *                  description: "Descripcion del producto"
 *                  example: "Una linda cabaña en el bosque"
 *                stock:
 *                  type: integer
 *                  description: "Stock del producto"
 *                  example: "10"
 *                precio:
 *                  type: string
 *                  description: "Precio del producto"
 *                  example: "140000"
 *                url:
 *                  type: string
 *                  description: "URL imagen del producto"
 *                  example: "www.google.com"
 *      responses:
 *        "200":
 *          description: "Todo ok"
 *        "401":
 *          description: "Usuario esta autentificado"
 *        "403":
 *          description: "El usuario no tiene permiso de admin"
 */

/**
 * @swagger
 *  /admin/products/{id}:
 *    post:
 *      tags:
 *        - admin
 *      summary: Permite editar todos los prodcutos
 *      parameters:
 *        - name: id
 *          in: path
 *          description: "Permite distinguir el producto para editarlo"
 *          required: true
 *          explode: true
 *          schema:
 *            type: integer
 *        - name: token
 *          in: cookie
 *          description: "Distingue aun admin de un usuario"
 *          required: true
 *          explode: true
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                nombre:
 *                  type: string
 *                  description: "Nombre del producto"
 *                  example: "hola@1"
 *                descripcion:
 *                  type: string
 *                  description: "Descripción del producto"
 *                  example: "descripcion del producto"
 *                precio:
 *                  type: string
 *                  description: "Precio del producto"
 *                  example: "hola@1"
 *                stock:
 *                  type: string
 *                  description: "Stock del producto"
 *                  example: "1234"
 *                imagen:
 *                  type: string
 *                  description: "Url imagen del producto"
 *                  example: "www.google.com"
 *      responses:
 *        '200':
 *          description: Producto modificado exitosamente
 *        '401':
 *          description: El usuario no está autentificado
 *        '403':
 *          description: El usuario no tiene permisos de admin
 *        '404':
 *          description: El producto no existe en la base de datos
 *    delete:
 *      tags:
 *        - admin
 *      summary: "Permite eliminar un producto mediante su id"
 *      parameters:
 *        - name: id
 *          in: path
 *          description: "Permite distinguir el producto para eliminarlo"
 *          required: true
 *          explode: true
 *          schema:
 *            type: integer
 *        - name: token
 *          in: cookie
 *          description: "Distingue aun admin de un usuario"
 *          required: true
 *          explode: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: Todo OK
 *        '401':
 *          description: El usuario no esta autentificado
 *        '403':
 *          description: El usuario no tiene permisos de admin
 *        '404':
 *          description: El producto no existe en la base
 */

/**
 * @swagger
 *  /admin/products/{id}:
 *    post:
 *      tags:
 *        - admin
 *      summary: Permite editar todos los prodcutos
 *      parameters:
 *        - name: id
 *          in: path
 *          description: "Permite distinguir el producto para editarlo"
 *          required: true
 *          explode: true
 *          schema:
 *            type: integer
 *        - name: token
 *          in: cookie
 *          description: "Distingue aun admin de un usuario"
 *          required: true
 *          explode: true
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                nombre:
 *                  type: string
 *                  description: "Nombre del producto"
 *                  example: "hola@1"
 *                descripcion:
 *                  type: string
 *                  description: "Descripción del producto"
 *                  example: "descripcion del producto"
 *                precio:
 *                  type: string
 *                  description: "Precio del producto"
 *                  example: "hola@1"
 *                stock:
 *                  type: string
 *                  description: "Stock del producto"
 *                  example: "1234"
 *                imagen:
 *                  type: string
 *                  description: "Url imagen del producto"
 *                  example: "www.google.com"
 *      responses:
 *        '200':
 *          description: Producto modificado exitosamente
 *        '401':
 *          description: El usuario no está autentificado
 *        '403':
 *          description: El usuario no tiene permisos de admin
 *        '404':
 *          description: El producto no existe en la base de datos
 *    delete:
 *      tags:
 *        - admin
 *      summary: "Permite eliminar un producto mediante su id"
 *      parameters:
 *        - name: id
 *          in: path
 *          description: "Permite distinguir el producto para eliminarlo"
 *          required: true
 *          explode: true
 *          schema:
 *            type: integer
 *        - name: token
 *          in: cookie
 *          description: "Distingue aun admin de un usuario"
 *          required: true
 *          explode: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: Todo OK
 *        '401':
 *          description: El usuario no esta autentificado
 *        '403':
 *          description: El usuario no tiene permisos de admin
 *        '404':
 *          description: El producto no existe en la base
 */
