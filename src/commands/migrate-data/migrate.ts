import { connectionPool } from "../../config/database/mysql";
import { ColumnsType, QueryRes } from "../../interfaces/sql2";

import { HelpersCommands } from '../helpers.command';

interface MigrateBulk {
  table: string;
  dbOrigin: connectionPool;
  dbTarget: connectionPool;
  columnsOrigin: ColumnsType[];
  cleanTable: boolean;
  limit: number;
  offset: number;
}
interface MigrateAndCleanDataType {
  table: string;
  dbOrigin: connectionPool;
  dbDestiny: connectionPool;
  columnsOrigin: ColumnsType[];
  key:string;
  limitDBOrigin: number;
  limitDBDestiny: number;
}

export class MigrateData {

  async firstBulk({ table, dbOrigin, dbTarget }: MigrateBulk){
    
  }

  async updateBulk(){}



  static async bulk({ table, dbOrigin, dbTarget, columnsOrigin, cleanTable, limit, offset }: MigrateBulk) {
    try {
      console.log('se traeran los datos de origen');
      // *1- traer datos de la tabla origen
      const [data]: QueryRes = await dbOrigin.query(`SELECT * FROM ${table} WHERE guide = '230161210-001' LIMIT ${limit} OFFSET ${offset}`);
      const dataOrigin = Array.isArray(data) ? data : [];
      console.log('se obtienen todos los datos de origen');

      // *2- insertar los datos en la tabla destino
      if (dataOrigin.length === 0) {
        return { msg: `No hay datos para migrar en la tabla ${table}` };
      }
      // if (cleanTable) {
      //   await dbTarget.query(`DELETE FROM ${table}`);
      // }
      
      const queryInsert = await HelpersCommands.createQueryInsert(columnsOrigin, dataOrigin, table);
      console.log('super query creada', queryInsert);
      // let totalResponse: any[] = [];
      // let promises = queryInsert.map(async(query) => {
      //   return await dbTarget.query(query);
      // });
      // console.log('promesas creadas');
      // totalResponse = await Promise.all(promises);
      console.log('promesas resueltas');

      return { 
        status: true, queryInsert, select: dataOrigin
        // totalResponse, promises
      };
    } catch (error) {
      return { status: false, error }
    }
  }

  static async cleanAndBulk({ table, dbOrigin, dbTarget, columnsOrigin }: MigrateBulk) {
    try {
      // *1- traer datos de la tabla origen
      const [data]: QueryRes = await dbOrigin.query(`SELECT * FROM ${table}`);
      const dataOrigin = Array.isArray(data) ? data : [];

      // *2- si tiene datos, limpiar la tabla destino
      if (dataOrigin.length > 0) {
        await dbTarget.query(`DELETE FROM ${table}`);
      }
      // *3- insertar los datos en la tabla destino
      const queryInsert = await HelpersCommands.createQueryInsert(columnsOrigin, dataOrigin, table);
      // await dbTarget.query(queryInsert);

      return { status: true, msg: "migracion de datos exitosa" };
    } catch (error) {
      return { status: false, error }
    }
  }


  static async withLimit() {}


  static async migrateAndCleanData({ table, dbOrigin, dbDestiny, columnsOrigin,
    key, limitDBOrigin }: MigrateAndCleanDataType) {
    try {
      // *0- contar la cantidad de datos en la tabla origen
      const [count]: QueryRes = await dbOrigin.query(`SELECT COUNT(*) AS cantidad FROM ${table}`);
      const totalRows = count[0].cantidad;
      // *0.1- si la cantidad es la indicada o menos, no se hace nada
      if (totalRows <= limitDBOrigin) return { msg: `No se necesita migrar la tabla ${table}` };

      // *1- traer datos de la tabla origen
      const limit = totalRows - limitDBOrigin;
      const [data]: QueryRes = await dbOrigin.query(`SELECT * FROM ${table} LIMIT ?`, [limit]);
      const dataOrigin = Array.isArray(data) ? data : [];
      // *2.1- validar si la tabla destino tiene los datos y filtrarlos
      const [dataTarget]: QueryRes = await dbDestiny.query(`SELECT * FROM ${table}`);
      const dataTargetExist = Array.isArray(dataTarget) ? dataTarget : [];

      // *2.1.1- comparar data para filtrar la que ya existe y no insertarla
      const { dataFiltered, keysToInsert } = await HelpersCommands.compareKeysAndDelete( dataOrigin, dataTargetExist, key);
      // *2.2- insertar los datos en la tabla destino
      if (dataFiltered.length === 0) {
        return { msg: `No hay datos para migrar en la tabla ${table}` };
      }
      const queryInsert = await HelpersCommands.createQueryInsert(columnsOrigin, dataFiltered, table);
      // await dbDestiny.execute(queryInsert);
      
      // *3- validar si se insertaron y eliminar los datos de la tabla origen
      const [ dataTargetUpdate ] = await dbDestiny.query(`SELECT ${key} FROM ${table} WHERE ${key} IN (${keysToInsert.join(',')})`);
      const keysInserted = dataTargetUpdate.map((row:any) => row[key]);
      await dbOrigin.query(`DELETE FROM ${table} WHERE ${key} IN (${keysInserted.join(',')})`);

      // *4- retornar mensaje de exito o error
      return { status: true }
    } catch (error) {
      return { status: false, error }
    }
  }
}
