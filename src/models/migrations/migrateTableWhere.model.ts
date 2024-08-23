import { HelpersCommands } from './../../commands/helpers.command';
import { MigrateTableInterface } from './../../class/migrationImplement';
import { ConnectionPoolType } from './../../interfaces/sql2.d';

interface MigrateTableWhere {
  table: string;
  conditions: string;
  dbOrigin: ConnectionPoolType;
  dbTarget: ConnectionPoolType;
  cleanTable?: boolean;
  limit?: number;
  offset?: number;
  key?: string;
}

class MigrateTableWhereModel implements MigrateTableInterface{
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

  constructor(){}

  oneTable = async ({
    table, conditions, dbOrigin, dbTarget,  cleanTable, limit, offset, key
  }:MigrateTableWhere) => {
    try {
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
      const [data] = await origin.query(`SELECT * FROM ${this.table} ${conditions}`);
      const dataOrigin = Array.isArray(data) ? data : [];
      console.log('dataOrigin traida');
      if (dataOrigin.length === 0) return { msg: `No hay datos para migrar en la tabla ${this.table}`, status: true };


      return { msg: `ok`, status: true, table: this.table, dbOrigin: this.dbOrigin, dbTarget: this.dbTarget };
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

export default MigrateTableWhereModel;
