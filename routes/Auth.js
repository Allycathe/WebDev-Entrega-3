import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sql from '../db/neon.js';

const Clave = 'ME ECHE DESARROLLO WEB Y MOVIL';
const Cookie_name = 'Seguridad';

export const AuthRouter = new Router();

AuthRouter.get('/login', (req, res) => {
  const error = req.query.error;
  res.json({ message: 'Aqui deberia haber una vista de login' });
});

AuthRouter.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;
    const query = 'SELECT id, password, admin FROM Cliente WHERE correo=$1';
    const resultados = await sql(query, [correo]);
    if (resultados.length === 0) {
      res.status(404).json({ error: 'El usuario no esta registrado' });
      return;
    }
    const { id, admin, password: hash } = resultados[0];
    if (bcrypt.compareSync(password, hash)) {
      const expiracion = Math.floor(Date.now() / 1000) + 5 * 60;
      const token = jwt.sign({ id, admin, exp: expiracion }, Clave);
      res.cookie(Cookie_name, token, {
        maxAge: 60 * 5 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      });
      res.status(200).json({ message: 'Login successful', token });
      return;
    }
    res.status(401).json({ error: 'Unauthorized' });
  } catch (error) {
    res.status(500).json({ error: 'Error during login process' });
  }
});

AuthRouter.get('/signup', (req, res) => {
  res.json({ message: 'Aqui deberia ir una vista de registro' });
});

AuthRouter.post('/signup', async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;
    const hash = bcrypt.hashSync(password, 5);
    const query =
      'INSERT INTO Cliente (nombre, correo, password) VALUES ($1, $2, $3) RETURNING id, admin';
    const resultado = await sql(query, [nombre, correo, hash]);
    const { id, admin } = resultado[0];
    const expiracion = Math.floor(Date.now() / 1000) + 5 * 60;
    const token = jwt.sign({ id, admin, exp: expiracion }, Clave);
    res.cookie(Cookie_name, token, {
      maxAge: 60 * 5 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    });
    res.json({ message: 'Registro exitoso', token });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

/**
 * @swagger
 *  /login:
 *    post:
 *      tags:
 *        - user
 *      summary: "Ingresar los datos"
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                nombre:
 *                  type: string
 *                  description: "Nombre del usuario"
 *                  example: "hola@1"
 *                contrasena:
 *                  type: string
 *                  description: "Contraseña del ususario"
 *                  example: "1234"
 *      responses:
 *        '302':
 *          description: todo bien
 *          headers:
 *            Set-Cookie:
 *              description: Token de sesión para autenticación
 *              schema:
 *                type: string
 *                example: token=ercv8m923d4io3kmlf
 *            Location:
 *              description: URL de redirección después del inicio de sesión exitoso
 *              schema:
 *                type: string
 *                example: /home
 *        '401':
 *          description: el usuario o contraseña incorrectos
 *        '404':
 *          description: usuario no encontrado
 */

/**
 * @swagger
 *  /signup:
 *    get:
 *      tags:
 *        - user
 *      summary: "Vista de registro"
 *      responses:
 *        '200':
 *          description: "Todo bien"
 *    post:
 *      tags:
 *        - user
 *      summary: "Permite registrar al usuario"
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                nombre:
 *                  type: string
 *                  description: "Nombre del usuario"
 *                  example: "hola@1"
 *                contrasena:
 *                  type: string
 *                  description: "Contraseña del ususario"
 *                  example: "1234"
 *      responses:
 *        '302':
 *          description: todo bien
 *          headers:
 *            Set-Cookie:
 *              description: Token de sesión para autenticación
 *              schema:
 *                type: string
 *                example: token=hiekuhgitjewewl7342q
 *            Location:
 *              description: URL de redirección después del inicio de sesión exitoso
 *              schema:
 *                type: string
 *                example: /home
 *        '400':
 *          description: La cuenta ya está en uso
 */
