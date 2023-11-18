import {neon, neonConfig} from '@neondatabase/serverless' ;
import {drizzle} from 'drizzle-orm/neon-http' ;


neonConfig.fetchConnectionCache = true; //it will cache the connection means it will not create the connection again and again

if(!process.env.DATABASE_URL)
{
  throw new Error('❌ DATABASE_URL is not found in .env file');

}


const sql = neon(process.env.DATABASE_URL);//it will create the connection to the database


export const db = drizzle(sql);//it will create the drizzle instance whcih will be used to query the database