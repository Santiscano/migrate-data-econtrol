import { FieldPacket, RowDataPacket } from "mysql2";
import { Pool } from "mysql2/promise";

import { connectionPool } from "../config/database/mysql";
import { ColumnsType, ConnectionPoolType } from "../interfaces/sql2";



export class HelpersCommands {

  /**
   * Crea una conexion a la base de datos
   * @param dataCredentials credenciales de la base de datos
   * @returns conexion a la base de datos
   * @example
   * ```ts
   * const dataCredentials = {
   *  host: 'localhost',
   *  user: 'root',
   *  database: 'test',
   *  port: 3306,
   *  password: 'root'
   * }
   * const connection = createPool(dataCredentials);
   * ```
  */
  static createPool (dataCredentials: ConnectionPoolType) {
    const conn = new connectionPool({
      host: dataCredentials.host,
      user: dataCredentials.user,
      database: dataCredentials.database,
      port: dataCredentials.port,
      password: dataCredentials.password
    });
    return conn;
  }

  /**
   * Obtiene las columnas de una tabla
   * @param table nombre de la tabla
   * @param connection conexion a la base de datos
   * @returns columnas de la tabla
   * @example
   * ```ts
   * const columns = await getColumns('users', connection);
   * columns => [{ Field: 'id', Type: 'int(11)' }, { Field: 'name', Type: 'varchar(255)' }]
   * ```
  */
  static async getColumns(table: string, connection: connectionPool) {
    try {
      const [data]: [RowDataPacket[], FieldPacket[]] = await connection.query(`DESCRIBE ${table}`);
      const Columns = Array.isArray(data) 
        ? data.map(row => { return { Field: row.Field, Type: row.Type }} ) 
        : [];

      return { status: true, columns: Columns };
    } catch (error) {
      const err = (error as any).code;
      if (err === 'ER_NO_DB_ERROR')         return { msg: "la base de datos no existe", error };
      if (err === 'ER_NO_SUCH_TABLE')       return { msg: "la tabla no existe", error };
      if (err === 'ER_ACCESS_DENIED_ERROR') return { msg: "acceso denegado a la base de datos", error };
      
      return { msg: "ocurrio un error no identificado", error };
    }
  }

  /**
   * Crea una tabla en la base de datos
   * @param table nombre de la tabla
   * @param columns columnas de la tabla
   * @param connection conexion a la base de datos
   * @returns mensaje de exito o error
   * @example
   * ```ts
   * const columns = [{ Field: 'id', Type: 'int(11)' }, { Field: 'name', Type: 'varchar(255)' }];
   * const result = await createTable('users', columns, connection);
   * result => { status: true, result, table: 'users' }
   * ```
  */
  static async createTable(table:string, columns: ColumnsType[], connection: connectionPool) {
    try {
      // parsear el array de columnas cuando sea date a varchar(40);
      const columnsParse = columns.map(column => {
        if (column.Type === 'date' || column.Type === 'datetime' || column.Type === 'timestamp') {
          column.Type = 'varchar(100)';
        }
        return column;
      });

      const columnsCreate = columnsParse.map(column => `${column.Field} ${column.Type.toUpperCase()}`).join(', ');
      const query = `CREATE TABLE ${table} ( ${columnsCreate} )`;

      const result = await connection.execute(query);
      return { status: true, result, table };
    } catch (error) {
      return { status: false, error };
    }
  }

  /**
   * Verifica si las columnas de la tabla origen existen en la tabla destino
   * @param columnsOrigin columnas de la tabla origen
   * @param columnsTarget columnas de la tabla destino
   * @returns columnas que no existen en la tabla destino
   * @example
   * ```ts
   * const columnsOrigin = [{ Field: 'id', Type: 'int(11)' }, { Field: 'name', Type: 'varchar(255)' }];
   * const columnsTarget = [{ Field: 'id', Type: 'int(11)' }];
   * const columnsNotExist = await doNotExist(columnsOrigin, columnsTarget);
   * columnsNotExist => [{ Field: 'name', Type: 'varchar(255)' }]
   * ```
   */
  static async doNotExist(columnsOrigin: ColumnsType[], columnsTarget: ColumnsType[]) {
    return columnsOrigin.filter(column => {
      return !columnsTarget.some(col => col.Field === column.Field);
    });
  }

  /**
   * Crea las columnas que no existen en la tabla destino
   * @param table nombre de la tabla
   * @param columnsNotExist columnas que no existen en la tabla destino
   * @param db conexion a la base de datos
   * @returns mensaje de exito o error
   * @example
   * ```ts
   * const columnsNotExist = [{ Field: 'name', Type: 'varchar(255)' }];
   * const result = await createColumnsDoNotExist('users', columnsNotExist, connection);
   * result => { status: true, result }
   * ```
   */
  static async createColumnsDoNotExist(table:string, columnsNotExist: ColumnsType[], db: connectionPool) {
    try {
      const columnsCreate = columnsNotExist.map(column => `ADD COLUMN ${column.Field} ${column.Type.toUpperCase()}`).join(', ');
  
      const query = `ALTER TABLE ${table} ${columnsCreate}`;
      const [result] = await db.execute(query);
      return { status: true, result };
    } catch (error) {
      return { status: false, error };
    }
  }

  static async createConnections(dataConnectionOrigin: ConnectionPoolType, dataConnectionTarget: ConnectionPoolType) {
    const origin = this.createPool(dataConnectionOrigin);
    const target = this.createPool(dataConnectionTarget);
    return { origin, target };
  }

  static async configColumnsTest(
    { table, dataConnectionOrigin, dataConnectionTarget }: 
    {table: string, dataConnectionOrigin: ConnectionPoolType, dataConnectionTarget: ConnectionPoolType 
  }) {
    try {
      // *SE CREA LA CONEXION DE AMBAS BASES DE DATOS
      const { origin, target } = await this.createConnections(dataConnectionOrigin, dataConnectionTarget);
      // *OBTENER LAS COLUMNAS DE AMBAS TABLAS
      const columnsOrigin = await this.getColumns(table, origin); // *se obtienen las columnas de la tabla origen
      if (!columnsOrigin.status) return columnsOrigin;  // *si la tabla origen no existe se retorna un mensaje

      let columnsTarget = await this.getColumns(table, target); // *se obtienen las columnas de la tabla destino
      if (!columnsTarget.status) { // *si la tabla destino no existe se crea
        if ((columnsTarget.error as any).code === 'ER_NO_SUCH_TABLE') { // *si la tabla no existe
          let newTableCreate = await this.createTable(table, columnsOrigin.columns, target); // *se crea la tabla
          if (!newTableCreate.status) return { msg: "ocurrio un error al crear la tabla destino", error: newTableCreate.error }; // *si ocurrio un error al crear la tabla se retorna un mensaje
          columnsTarget = await this.getColumns(table, target); // *se obtienen las columnas de la tabla destino creada
        } else { // *si ocurrio un error al obtener las columnas de la tabla destino
          return columnsTarget;
        }
      }

      // *SE COMPARA QUE LA TABLA DESTINO TENGA TODAS LAS COLUMNAS DE LA TABLA ORIGEN, SI NO SE CREAN
      const columnsNotExist = await this.doNotExist(columnsOrigin.columns, columnsTarget.columns as ColumnsType[]);
      // *SI EXISTEN COLUMNAS QUE NO ESTAN EN LA TABLA DESTINO SE CREAN
      if (columnsNotExist.length > 0) {
        const columnsCreated = await this.createColumnsDoNotExist(table, columnsNotExist, target);
        if (!columnsCreated.status) return { msg: "ocurrio un error al crear las columnas en la tabla destino", error: columnsCreated.error };
        columnsTarget = await this.getColumns(table, target);
      }

      return { 
        status: true, 
        columnsOrigin: columnsOrigin.columns, 
      };
    } catch (error) {
      return { status: false, error };
    }
  }

  static async configColumns({
    table, dataConnectionOrigin, dataConnectionTarget
  }: { 
    table: string, 
    dataConnectionOrigin: ConnectionPoolType, 
    dataConnectionTarget: ConnectionPoolType 
  }
  ): Promise<{
    status?: boolean,
    columnsOrigin?: ColumnsType[],
    origin?: connectionPool,
    target?: connectionPool,
    error?: any,
    msg?: string
  }> {
    try {
      // *SE CREA LA CONEXION DE AMBAS BASES DE DATOS
      const { origin, target } = await this.createConnections(dataConnectionOrigin, dataConnectionTarget);
      // *OBTENER LAS COLUMNAS DE AMBAS TABLAS
      const columnsOrigin = await this.getColumns(table, origin); // *se obtienen las columnas de la tabla origen
      if (!columnsOrigin.status) return columnsOrigin;  // *si la tabla origen no existe se retorna un mensaje
  
      let columnsTarget = await this.getColumns(table, target); // *se obtienen las columnas de la tabla destino
      if (!columnsTarget.status) { // *si la tabla destino no existe se crea
        if ((columnsTarget.error as any).code === 'ER_NO_SUCH_TABLE') { // *si la tabla no existe
          let newTableCreate = await this.createTable(table, columnsOrigin.columns, target); // *se crea la tabla
          if (!newTableCreate.status) return { msg: "ocurrio un error al crear la tabla destino", error: newTableCreate.error }; // *si ocurrio un error al crear la tabla se retorna un mensaje
          columnsTarget = await this.getColumns(table, target); // *se obtienen las columnas de la tabla destino creada
        } else { // *si ocurrio un error al obtener las columnas de la tabla destino
          return columnsTarget;
        }
      }
  
      // *SE COMPARA QUE LA TABLA DESTINO TENGA TODAS LAS COLUMNAS DE LA TABLA ORIGEN, SI NO SE CREAN
      const columnsNotExist = await this.doNotExist(columnsOrigin.columns, columnsTarget.columns as ColumnsType[]);
      // *SI EXISTEN COLUMNAS QUE NO ESTAN EN LA TABLA DESTINO SE CREAN
      if (columnsNotExist.length > 0) {
        const columnsCreated = await this.createColumnsDoNotExist(table, columnsNotExist, target);
        if (!columnsCreated.status) return { msg: "ocurrio un error al crear las columnas en la tabla destino", error: columnsCreated.error };
        columnsTarget = await this.getColumns(table, target);
      }
  
      return { status: true, columnsOrigin: columnsOrigin.columns };
    } catch (error) {
      return { status: false, error };
    }
  }

  static async compareKeysAndDelete(dataOrigin:RowDataPacket[], dataTarget:RowDataPacket[], key:string) {
    // *3- validar si se insertaron y eliminar los datos de la tabla origen
    const dataFiltered = dataOrigin.filter((row) => 
      !dataTarget.some((rowTarget) =>  row[key] === rowTarget[key])
    )
    const keysToInsert = dataFiltered.map(row => row[key]);

    return { 
      dataFiltered, keysToInsert
    };
  }

  static formatDate(date: Date) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }
  static formatTime(date: Date) {
    return date.toISOString().split('T')[1].split('.')[0]; // HH:MM:SS
  }

  static async createQueryInsertOne(columnsOrigin: ColumnsType[], dataOrigin: RowDataPacket[], table: string) {
    const columns = columnsOrigin.map(column => column.Field).join(', ');
    const values = dataOrigin.map(row => {
      const rowValues = columnsOrigin.map(column => {
        let value = row[column.Field];
        let typeVal = column.Type;
        if (typeVal == 'date') {
          value = this.formatDate(value);
        } else if (typeVal == 'datetime' || typeVal == 'timestamp') {
          const date = this.formatDate(value); // YYYY-MM-DD
          const timeFormat = this.formatDate(value); // HH:MM:SS
          value = `${date}${timeFormat}`;
        }

        return value !== null && value !== undefined ? `'${value}'` : 'NULL'; // Manejar valores null o undefined
      }).join(', ');
      return `(${rowValues})`;
    }).join(', ');
    
    return `INSERT IGNORE INTO \`${table}\` (${columns}) VALUES ${values};`;
  }

  static async createQueryInsert(columnsOrigin: ColumnsType[], dataOrigin: RowDataPacket[], table: string) {
    // *dividir los datos en lotes
    const queries: string[] = [];
    // dividir array dataOrigin en lotes de 30000
    const dataOriginLength = dataOrigin.length;
    const limit = 500;

    for (let i = 0; i < dataOriginLength; i += limit) {
      const data = dataOrigin.slice(i, i + limit);
      const query = await this.createQueryInsertOne(columnsOrigin, data, table);
      queries.push(query);
    }
    return queries;
  }

  static async createQueryDelete(table:string, conditions:string) {
    return `DELETE FROM \`${table}\` WHERE ${conditions} `;
  }

}
