import jwt from 'jsonwebtoken';
import sql from '../db/neon.js';

const Clave = 'ME ECHE DESARROLLO WEB Y MOVIL';

export const AuthAdmin = (req, res, next) => {
  try {
    const decoded = jwt.verify(req.cookies.Seguridad, Clave);
    if (decoded) {
      req.user = decoded;
      const admin = req.user.admin;
      if (admin) {
        res.status(200).json({ message: 'Todo bien' });
        next();
      }
      return res
        .status()
        .json({ message: 'Usuario no tiene permisos de admin' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Usuario no autentificado' });
  }
};
