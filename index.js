import express from 'express';
import { profileEnd } from 'console';
import exp from 'constants';
import cookieParser from 'cookie-parser';

/*Swagger */
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/*Acceso a la base de datos*/
import sql from './db/neon.js';

/*Rutas*/
import { Router } from 'express';
import { AuthRouter } from './routes/Auth.js';
import { AdminRouter } from './routes/Admin.js';
import { CarroRouter } from './routes/Carro.js';
import { InicioRouter } from './routes/Inicio.js';
import { PerfilRouter } from './routes/Perfil.js';
import { ProductoRouter } from './routes/Producto.js';
import { ReciboRouter } from './routes/Recibo.js';
import { AuthAdmin } from './Middlewares/AuthAdmin.js';
import { Auth } from './Middlewares/AuthUser.js';

/*Configuración de express*/
const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/*Funcionamiento de Swagger */
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Arriendo´s API',
      version: '1.0.0',
      description:
        'Arriendo´s API, esta es la API de Arrie2, aquí se encontrará toda la información respecto a la página web y su funcionamiento',
    },
    servers: [
      {
        url: 'http://107.22.227.90',
      },
    ],
  },
  apis: [
    './routes/Auth.js',
    './routes/Admin.js',
    './routes/Carro.js',
    './routes/Inicio.js',
    './routes/Perfil.js',
    './routes/Producto.js',
    './routes/Recibo.js',
  ],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/Api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/*Funcionamiento página*/
app.get('/', async (req, res) => {
  res.redirect('/api/api-docs');
});

app.use('/api', AuthRouter);
app.use('/api', AdminRouter);
app.use('/api', CarroRouter);
app.use('/api', InicioRouter);
app.use('/api', PerfilRouter);
app.use('/api', ProductoRouter);
app.use('/api', ReciboRouter);

app.listen(3001, () => console.log('Me quiero matar2'));
