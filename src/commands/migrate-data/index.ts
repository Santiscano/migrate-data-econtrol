import { FieldPacket, RowDataPacket } from "mysql2";
import { Pool } from "mysql2/promise";

import { connectionPool } from "../../config/database/mysql";
import { ColumnsType, ConnectionPoolType, QueryRes } from "../../interfaces/sql2";

import { HelpersCommands } from '../helpers.command';
import { MigrateData } from "./migrate";

interface MigrateBulk {
  table: string;
  dbOrigin: ConnectionPoolType;
  dbTarget: ConnectionPoolType;
  columnsOrigin?: ColumnsType[];
  cleanTable: boolean;
  limit: number;
  offset: number;
}

interface MigrateAndCleanDataType {
  table: string;
  dataConnectionOrigin: ConnectionPoolType;
  dataConnectionTarget: ConnectionPoolType;
  key:string;
  limitDBOrigin: number;
  limitDBDestiny: number;
}

export class ResoursesCommandMigrateData {
  // *APIS
  static async oneTableMigrateDataBulk({ 
    cleanTable, columnsOrigin, dbOrigin, dbTarget, table, limit, offset 
  }: MigrateBulk) {
    try {
      console.log('se inicializa la migracion de datos');
      const { status, columnsOrigin  } = await HelpersCommands.configColumns({
        table, dataConnectionOrigin:dbOrigin, dataConnectionTarget:dbTarget
      });
      if (!columnsOrigin || !status) return { msg: "ocurrio un error al obtener las columnas", status: false }
      console.log('crear tabla y traer columnas terminado');

      const { origin, target } = await HelpersCommands.createConnections(dbOrigin, dbTarget);
      console.log('conexiones creadas');
      const bulkMigrate = await MigrateData.bulk({ 
        table, dbOrigin: origin, dbTarget: target, columnsOrigin, cleanTable,
        limit, offset
      });
      if (!bulkMigrate.status) return bulkMigrate;

      return { status: true, msg: "migracion de datos exitosa", bulkMigrate };
    } catch (error) {
      return { status: false, msg: "ocurrio un error al migrar los datos", error };
    }
  }

  static async oneTableMigrateDataBulkUpduplicated({ 
    cleanTable, columnsOrigin, dbOrigin, dbTarget, table, limit, offset 
  }: MigrateBulk) {
    try {
      console.log('se inicializa la migracion de datos');
      
    } catch (error) {
      return { status: false, msg: "ocurrio un error al migrar los datos", error };
    }
  }

  static async oneTableMigrateAndCleanData({
    table, key,
    dataConnectionOrigin, dataConnectionTarget, 
    limitDBOrigin, limitDBDestiny
  }: MigrateAndCleanDataType) {
    // *Configuracion de las columnas y conexiones
    const { status, columnsOrigin  } = await HelpersCommands.configColumns({table, dataConnectionOrigin, dataConnectionTarget});
    // *despues de tener las columnas se procede a migrar los datos de la tabla origen a la tabla destino
    if (!columnsOrigin || !status) {
      return { msg: "ocurrio un error al obtener las columnas", status: false };
    }
    const { origin, target } = await HelpersCommands.createConnections(dataConnectionOrigin, dataConnectionTarget);

    const migrateData = await MigrateData.migrateAndCleanData({
      table,
      dbOrigin: origin,
      dbDestiny: target,
      columnsOrigin,
      key,
      limitDBOrigin: limitDBOrigin,
      limitDBDestiny: limitDBDestiny,
    });
    if (!migrateData.status) return migrateData;

    return { msg: "migracion de datos exitosa", migrateData };
  }













  
  static async multipleTablesMigrateData(tables: string[]) {}

  static async allTablesMigrateData() {}
}
