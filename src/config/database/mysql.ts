import * as mysql from "mysql2/promise";
import "dotenv/config";
import { DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_DATABASE } from "../configPorts";
import SQLResponse from "../../interfaces/sql2";
import { ConnectionPoolType } from "../../interfaces/sql2";

// @ts-ignore
export const conn = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  database: DB_DATABASE,
  port: DB_PORT,
  password: DB_PASSWORD,
})

export class connection {
  static async query(query:string, params?:any[] | any): Promise<SQLResponse> {
    let connection;
    try {
      connection = await conn.getConnection();
      const [result, affectedRows] = await connection.query(query, params);
      return [result, affectedRows];
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  static async execute(query:string, params?:any[] | any): Promise<SQLResponse> {
    let connection;
    try {
      connection = await conn.getConnection();
      const [result, affectedRows] = await connection.execute(query, params);
      return [result, affectedRows];
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
}

export class connectionPool {
  private connection: mysql.Pool;

  // constructor (host: string, user: string, database: string, port: number, password: string) {
  constructor ({ host, user, database, port, password }: ConnectionPoolType) {
    this.connection = mysql.createPool({
      host,
      user,
      database,
      port,
      password,
    })
  }

  async query(query:string, params?:any[] | any): Promise<SQLResponse> {
    let connection;
    try {
      connection = await this.connection.getConnection();
      const [result, affectedRows] = await connection.query(query, params);
      return [result, affectedRows];
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  async execute(query:string, params?:any[] | any): Promise<SQLResponse> {
    let connection;
    try {
      connection = await this.connection.getConnection();
      const [result, affectedRows] = await connection.execute(query, params);
      return [result, affectedRows];
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
}




// *====================== validateConnection ====================== //
(async function validateConnection() {
  try {
    const [rows] = await connection.query('SELECT 1');
    console.log('Connection to the database is successful:', rows);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
})();
