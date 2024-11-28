import { Router } from 'express';
import sql from '../db/neon.js';
import { Auth } from '../Middlewares/AuthUser.js';

export const CarroRouter = new Router();

CarroRouter.get('/shoppingcart', Auth, async (req, res) => {
  try {
    const id = req.user.id;
    const lista = await sql(
      `SELECT Carro.idproducto, Productos.nombre, Productos.descripcion, Productos.precio, Cliente.dinero, Productos.imagen, Carro.cantidad
      FROM Carro 
      JOIN Productos ON Carro.idproducto = Productos.id 
      JOIN Cliente ON Carro.idcliente = Cliente.id 
      WHERE idCliente = $1`,
      [id]
    );
    let suma = 0;
    for (let i = 0; i < lista.length; i++) {
      suma += lista[i].precio * lista[i].cantidad;
    }
    const dinero = await sql(`SELECT dinero FROM Cliente WHERE id=$1`, [id]);
    const dinero1 = dinero[0].dinero;
    res.json({ lista, dinero1, suma });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los datos del carro' });
  }
});

CarroRouter.post('/shoppingcart/:id', Auth, async (req, res) => {
  try {
    const idp = req.params.id;
    const id = req.user.id;
    const lista = await sql(
      `SELECT Productos.stock, Productos.id FROM Productos WHERE id=$1`,
      [idp]
    );
    const lista2 = await sql(
      'SELECT * FROM Carro WHERE idcliente=$1 AND idproducto=$2',
      [id, idp]
    );
    if (lista2.length >= 1) {
      await sql(
        'UPDATE Carro SET cantidad = cantidad + 1 WHERE idcliente=$1 AND idproducto=$2',
        [id, idp]
      );
      await sql`UPDATE Productos SET stock = stock - 1 WHERE id = ${idp}`;
      res.json({ message: 'Producto agregado al carro' });
      return;
    }
    const query =
      'INSERT INTO Carro (idcliente, idproducto, cantidad) VALUES ($1,$2,$3)';
    await sql(query, [id, idp, 1]);
    await sql`UPDATE Productos SET stock = stock - 1 WHERE id = ${idp}`;
    res.json({ message: 'Producto agregado al carro' });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el producto al carro' });
  }
});

CarroRouter.post('/shoppingcart/delete/:id', Auth, async (req, res) => {
  try {
    const idp = req.params.id;
    const id = req.user.id;
    const lista = await sql(
      'SELECT idproducto, idcliente, Carro.cantidad FROM Carro WHERE idcliente=$1 AND idproducto=$2 ORDER BY idproducto DESC',
      [id, idp]
    );
    const producto = lista[0];
    if (lista[0].cantidad > 1) {
      await sql(
        'UPDATE Carro SET cantidad = cantidad - 1 WHERE idproducto=$1 AND idcliente=$2',
        [producto.idproducto, producto.idcliente]
      );
      await sql('UPDATE Productos SET stock = stock + 1 WHERE id=$1', [idp]);
      res.json({ message: 'Producto eliminado del carro' });
      return;
    }
    await sql('DELETE FROM Carro WHERE idcliente=$1 AND idproducto=$2', [
      id,
      idp,
    ]);
    await sql('UPDATE Productos SET stock = stock + 1 WHERE id=$1', [idp]);
    res.json({ message: 'Producto eliminado del carro' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto del carro' });
  }
});

CarroRouter.post('/pucharse', Auth, async (req, res) => {
  try {
    const id = req.user.id;
    const lista = await sql(
      `SELECT Productos.id, Productos.nombre, Productos.descripcion, Productos.precio, Cliente.dinero, Productos.stock 
      FROM Carro 
      JOIN Productos ON Carro.idproducto = Productos.id 
      JOIN Cliente ON Carro.idcliente = Cliente.id 
      WHERE idCliente = $1`,
      [id]
    );
    let suma = 0;
    for (let i = 0; i < lista.length; i++) {
      suma += lista[i].precio;
    }
    const cantidad = lista.length;
    await sql(
      'INSERT INTO Venta (idcliente, cantidad, costo) VALUES ($1, $2, $3)',
      [id, cantidad, suma]
    );
    const dinero = await sql`SELECT dinero FROM Cliente WHERE id=${id}`;
    let dinero1 = dinero[0].dinero;

    if (lista.length === 0) {
      res.status(400).json({ error: 'Carro vacío' });
      return;
    }
    if (dinero1 > suma) {
      dinero1 -= suma;
      await sql`UPDATE Cliente SET dinero=${dinero1} WHERE id=${id}`;
      await sql('DELETE FROM Carro WHERE idcliente=$1', [id]);
      const user = await sql(
        'SELECT Cliente.nombre, Venta.fecha FROM Cliente JOIN Venta ON Venta.idcliente = Cliente.id WHERE Cliente.id=$1',
        [id]
      );
      const cliente = user[0].nombre;
      const fecha = user[0].fecha;
      res.json({ cantidad, cliente, suma, fecha });
      return;
    }
    if (dinero1 < suma) {
      res.status(400).json({ error: 'Fondos insuficientes' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error durante el proceso de pago' });
  }
});

/**
 * @swagger
 *  /shoppingcart:
 *    get:
 *      tags:
 *       - user
 *      summary: "Acceder a los productos del carro"
 *      parameters:
 *        - name: token
 *          in: cookie
 *          description: "Uusario autentifiacdo"
 *          required: true
 *          explode: true
 *          schema:
 *            type: string
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
 *                    cantidad:
 *                      type: integer
 *                      example: 2
 *                    imagen:
 *                      type: string
 *                      example: "www.google.com"
 *        '401':
 *          description: El usuario no esta autentificado
 */

/**
 * @swagger
 *   /shoppingcart/{id}:
 *    post:
 *      tags:
 *        - user
 *      summary: "Agregar productos al carro por su id"
 *      parameters:
 *        - name: id
 *          in: path
 *          description: "Permite distinguir el producto para agregarlo al carro"
 *          required: true
 *          explode: true
 *          schema:
 *            type: integer
 *        - name: token
 *          in: cookie
 *          description: "Uusario autentifiacdo"
 *          required: true
 *          explode: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: todo ok
 *        '400':
 *          description: el producto no existe en la base de datos
 *        '401':
 *          description: El usuario no esta autentificado
 *
 */

/**
 * @swagger
 *  /shoppingcart/delete/{id}:
 *    delete:
 *      tags:
 *        - user
 *      summary: "Eliminar productos"
 *      parameters:
 *        - name: id
 *          in: path
 *          description: "Permite distinguir el producto para agregarlo al carro"
 *          required: true
 *          explode: true
 *          schema:
 *            type: integer
 *        - name: token
 *          in: cookie
 *          description: "Uusario autentifiacdo"
 *          required: true
 *          explode: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: "Todo ok"
 *        '400':
 *          description: "El producto no existe en el carro"
 *        '401':
 *          description: "El usuario no esta autentificado"
 *
 */

/**
 * @swagger
 * /pucharse:
 *    post:
 *      tags:
 *        - user
 *      summary: "Comprar los productos del carrito"
 *      parameters:
 *        - name: token
 *          in: cookie
 *          description: "Uusario autentifiacdo"
 *          required: true
 *          explode: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: "Todo ok"
 *        '400':
 *          description: "El carro esta vacio"
 *        '401':
 *          description: "El usuario no esta autentificado"
 *
 */
