import MissingData from '../helpers/missingData';
import { HelpersCommands } from "../commands/helpers.command";
import { ColumnsType, ConnectionPoolType } from "../interfaces/sql2";

interface MigrateBulk {
  table: string;
  dbOrigin: ConnectionPoolType;
  dbTarget: ConnectionPoolType;
  columnsOrigin?: ColumnsType[];
  cleanTable: boolean;
  limit: number;
  offset: number;
  key: string;
  conditions: string;
}


class UpdateMigrateBulkModel {
  table: string = "";
  dbOrigin: ConnectionPoolType = {
    user: "",
    password: "",
    database: "",
    host: "",
    port: 0,
  };
  dbTarget: ConnectionPoolType = {
    user: "",
    password: "",
    database: "",
    host: "",
    port: 0,
  };

  oneTable = async ({
    table, dbOrigin, dbTarget, cleanTable, limit, offset, key, conditions
  }: MigrateBulk) => {
    try {
      const missingData = MissingData.missingData({ table, cleanTable, key, conditions });
      if (missingData.error) return { msg: "missing data", status: false, missing: missingData.missing };

      this.setTable(table);
      this.setDBOrigin(dbOrigin);
      this.setDBTarget(dbTarget);
      // *1-traer columnas origen
      const { status, columnsOrigin } = await HelpersCommands.configColumns({
        table: this.table, 
        dataConnectionOrigin: this.dbOrigin, 
        dataConnectionTarget: this.dbTarget
      });
      if (!columnsOrigin || !status) return { msg: "ocurrio un error al obtener las columnas", status: false };

      // *2-crear conexiones
      const { origin, target } = await HelpersCommands.createConnections(this.dbOrigin, this.dbTarget);

      // *3.1- traer datos de la tabla origen
      const [data] = await origin.query(`SELECT * FROM ${this.table} WHERE ${conditions} limit 10 ORDER BY ${key} DESC`);
      const dataOrigin = Array.isArray(data) ? data : [];
      if (dataOrigin.length === 0) return { msg: `No hay datos para migrar en la tabla ${this.table}`, status: true };

      // *3.2- traer datos de tabla destino
      const [dataTar] = await target.query(`SELECT * FROM ${this.table} WHERE ${conditions} limit 10 ORDER BY ${key} DESC`);
      const dataTarget = Array.isArray(dataTar) ? dataTar : [];

      return { msg: "ok", status: true, dataOrigin, dataTarget };


      // *4- generar sentencia insert
      // const queryInsert = await HelpersCommands.createQueryInsert(columnsOrigin, dataOrigin, this.table);
      // const ids = dataOrigin.map((item) => item[key]);
      // let promises = queryInsert.map(async (sentence) => {
      //   return await target.query(sentence);
      // });
      // await Promise.all(promises);


    } catch (error) {
      return { msg: `ocurrio un error: ${error}`, status: false };
    }
  };

  crossOneTable = async ({
    table, dbOrigin, dbTarget, cleanTable, limit, offset, key
  }: MigrateBulk) => {
    try {
      const missingData = MissingData.missingData({ table, cleanTable, key });
      if (missingData.error) return { msg: "missing data", status: false, missing: missingData.missing };

      this.setTable(table);
      this.setDBOrigin(dbOrigin);
      this.setDBTarget(dbTarget);
      // *1-traer columnas origen
      const { status, columnsOrigin } = await HelpersCommands.configColumns({
        table: this.table, 
        dataConnectionOrigin: this.dbOrigin, 
        dataConnectionTarget: this.dbTarget
      });
      if (!columnsOrigin || !status) return { msg: "ocurrio un error al obtener las columnas", status: false };

      // *2-crear conexiones
      const { origin, target } = await HelpersCommands.createConnections(this.dbOrigin, this.dbTarget);

      // *3- traer datos de tabla destino
      const [dataTarget] = await target.query(`SELECT * FROM ${this.table} WHERE CODIGO_PK < 16648259`);
    } catch (error) {
      return { msg: `ocurrio un error: ${error}`, status: false };
    }
  };


  async setTable(table: string) {
    this.table = table;
  }

  async setDBOrigin({ user, password, database, host, port }: ConnectionPoolType) {
    this.dbOrigin = { user, password, database, host, port };
  }

  async setDBTarget({ user, password, database, host, port }: ConnectionPoolType) {
    this.dbTarget = { user, password, database, host, port };
  }
}

export default UpdateMigrateBulkModel;
