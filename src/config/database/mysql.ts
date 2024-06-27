import * as mysql from "mysql2/promise";
import "dotenv/config";
import { DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_DATABASE } from "../configPorts";

// @ts-ignore
export const connection = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  database: DB_DATABASE,
  port: DB_PORT,
  password: DB_PASSWORD,
})

async function validateConnection() {
  try {
    const [rows] = await connection.query('SELECT 1');
    console.log('Connection to the database is successful:', rows);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

validateConnection();
