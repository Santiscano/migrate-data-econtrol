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
}


class FirstMigrateBulkModel {
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

  async oneTable({
    table, dbOrigin, dbTarget, cleanTable, limit, offset, key
  }: MigrateBulk) {
    try {
      // *0-validar que lleguen los datos requeridos y set db y table
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

      // *3-traer datos de la tabla origen y generar query
      // const [data] = await origin.query(`SELECT * FROM ${this.table} WHERE ${key} > 16648258 LIMIT 10000`);
      const [data] = await origin.query(`SELECT * FROM ${this.table} WHERE ${key} > 17214498 LIMIT 5000`);
      const dataOrigin = Array.isArray(data) ? data : [];
      console.log('dataOrigin traida');
      if (dataOrigin.length === 0) return { msg: `No hay datos para migrar en la tabla ${this.table}`, status: true };

      // *4-insertar datos en la tabla destino
      const queryInsert = await HelpersCommands.createQueryInsert(columnsOrigin, dataOrigin, this.table);
      console.log('sentencias insert generadas');
      const ids = dataOrigin.map((item) => item[key]);
      let promises = queryInsert.map(async (sentence) => {
        return await target.query(sentence);
      });
      console.log('promesas insert generated');
      const insertsPromises = await Promise.all(promises);

      // *4.1- consultar los ids que se insertaron para validar que si existan estos registros
      const [dataInserted] = await target.query(`SELECT ${key} FROM ${this.table} WHERE ${key} IN (${ids.join(",")})`);
      const idsInserted = Array.isArray(dataInserted) ? dataInserted.map((item) => item[key]) : [];
      console.log('ids insertados consultados');

      // !5- Eliminar los registros que ya existen en la tabla destino
      if (idsInserted.length === 0) return { msg: `No se insertaron datos en la tabla ${this.table}`, status: true };
      const deleted = await origin.query(`DELETE FROM ${this.table} WHERE ${key} IN (${idsInserted.join(",")})`); 
      console.log('registros eliminados');

      return { 
        msg: "one table", status: true, 
        idsInserted: idsInserted.length, deleted, insertsPromises
      };
    } catch (error) {
      return { msg: `ocurrio un error: ${error}`, status: false };
    }
  }


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

export default FirstMigrateBulkModel;
