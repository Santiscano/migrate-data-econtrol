import MissingData from '../helpers/missingData';
import { HelpersCommands } from "../commands/helpers.command";
import { ColumnsType, ConnectionPoolType } from "../interfaces/sql2";


class ReturnTracking {
  table = "TB_PRE_LIQUIDACION_TMP_HISTORICO";
  key = "CODIGO_PK";
  dbOrigin: ConnectionPoolType = {
    host: "85.31.230.199",
    user: "e-control",
    database: "e-control",
    port: 3306,
    password: "SsO8GhSi28vFE6vZzFbQ"
  };
  dbTarget: ConnectionPoolType = {
    host: "154.56.49.210",
    user: "u804519145_enviexpress",
    database: "u804519145_enviexpress",
    port: 3306,
    password: "2vW@sQTJi5>C"
  };

  async pre_liquidacion(){

    // *1-traer columnas origen
    const { status, columnsOrigin } = await HelpersCommands.configColumns({
      table: this.table, 
      dataConnectionOrigin: this.dbOrigin, 
      dataConnectionTarget: this.dbTarget
    });
    if (!columnsOrigin || !status) return { msg: "ocurrio un error al obtener las columnas", status: false };

    // *2-crear conexiones
    const { origin, target } = await HelpersCommands.createConnections(this.dbOrigin, this.dbTarget);

    // *3.0.1- traer consecutivos de tabla TB_NUMERACIONES_COMPROBANTES_GENERADOS con estado 3
    const [dataConsecutivos] = await target.query(`SELECT CONSECUTIVO FROM TB_NUMERACIONES_COMPROBANTES_GENERADOS WHERE ESTADO IN (3);`);
    const consecutivos = Array.isArray(dataConsecutivos) ? dataConsecutivos.map((item) => item.CONSECUTIVO) : [];

    // *3-traer datos de la tabla origen
    const [data] = await origin.query(`SELECT * FROM ${this.table} WHERE PRE_LIQUIDACION IN (${consecutivos.join(",")})`);
    const dataOrigin = Array.isArray(data) ? data : [];
    if (dataOrigin.length === 0) return { msg: `No hay datos para migrar en la tabla ${this.table}`, status: true };

    // *4-crear query para insertar datos
    const queryInsert = await HelpersCommands.createQueryInsert(columnsOrigin, dataOrigin, this.table);
    const ids = dataOrigin.map((item) => item[this.key]);
    let promises = queryInsert.map(async (sentence) => {
      return await target.query(sentence);
    });
    const insertsPromises = await Promise.all(promises);

    // *4.1- consultar los ids que se insertaron para validar que si existan estos registros
    const [dataInserted] = await target.query(`SELECT ${this.key} FROM ${this.table} WHERE ${this.key} IN (${ids.join(",")})`);
    const idsInserted = Array.isArray(dataInserted) ? dataInserted.map((item) => item[this.key]) : [];

    // !5- Eliminar los registros que ya existen en la tabla destino
    if (idsInserted.length === 0) return { msg: `No se insertaron datos en la tabla ${this.table}`, status: true };
    const deleted = await origin.query(`DELETE FROM ${this.table} WHERE ${this.key} IN (${idsInserted.join(",")})`);

    return { 
      msg: "one table", status: true, 
      idsInserted: idsInserted.length, deleted, insertsPromises
    };
  }
}

export default ReturnTracking;
