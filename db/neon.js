import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
/*Acceso a la base de datos*/
dotenv.config();

const sql= neon(process.env.DATABASE_URL);
export default sql;
