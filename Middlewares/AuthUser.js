import jwt from 'jsonwebtoken';
import sql from '../db/neon.js';
const Clave = 'ME ECHE DESARROLLO WEB Y MOVIL';

export const Auth = (req, res, next) => {
  try {
    const decoded = jwt.verify(req.cookies.Seguridad, Clave);
    if (decoded) {
      req.user = decoded;
      next();
    }
  } catch (error) {
    res.status(401).json({ message: 'Usuario no autentificado' });
  }
};
