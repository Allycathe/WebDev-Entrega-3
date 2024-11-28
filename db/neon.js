import { neon } from '@neondatabase/serverless';
/*Acceso a la base de datos*/
const sql = neon(
  'postgresql://Arrie2_owner:ZSkPphwz80cg@ep-long-dream-a5gfxn72.us-east-2.aws.neon.tech/Arrie2?sslmode=require'
);
export default sql;
