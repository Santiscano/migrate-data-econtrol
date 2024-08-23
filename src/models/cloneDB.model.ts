import { HelpersCommands } from "../commands/helpers.command";
import MissingData from "../helpers/missingData";
import { ConnectionPoolType } from "../interfaces/sql2";

class CloneDBModel {
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

  migrateSchema = async (
    dbOrigin: ConnectionPoolType,
    dbTarget: ConnectionPoolType,
  ): Promise<{ status: boolean; msg?: string, missing?: string[] | undefined, data?:any[]}> => {
    // *0-validar que lleguen los datos requeridos y set db y table
    const missingData = MissingData.missingData({
      ...dbOrigin,
      ...dbTarget,
    });
    if (missingData.error) {
      return {
        msg: "missing data",
        status: false,
        missing: missingData.missing,
      };
    }
    this.setDBOrigin(dbOrigin);
    this.setDBTarget(dbTarget);

    // *1- crear conexiones
    const { origin, target } = await HelpersCommands.createConnections(this.dbOrigin, this.dbTarget);
    
    // *2- traer tablas origen
    const [tablesOrigin] = await origin.query("SHOW TABLES");
    const tablesOriginArray = Array.isArray(tablesOrigin) ? tablesOrigin : [];
    // *2.1- traer estructura de cada tabla origen
    const tablesOriginStructure = await Promise.all(
      tablesOriginArray.map(async (table:string) => {
        const [columns] = await origin.query(`DESCRIBE ${table}`);
        return { table, columns };
      })
    );
    return { status: true, msg: "ok", data: [
      tablesOriginStructure
    ] };

    // *3- crear tablas en db target
    return { status: true };
  };

  migrateSchemaData = async (
    dbOrigin: string,
    dbTarget: string
  ): Promise<{ status: boolean }> => {
    console.log("migrateSchemaData");
    return { status: true };
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

export default CloneDBModel;
