import fs from "fs";

import { HelpersCommands } from "../commands/helpers.command";

class MigUpdateTrackingPaqueteoModel {
  table;
  dbOrigin;
  dbTarget 

  constructor() {
    this.table = 'TB_TRACKING_PAQUETEO';
    this.dbOrigin = {
      host: '154.56.49.210',
      database: 'u804519145_enviexpress',
      user: 'u804519145_enviexpress',
      password: '2vW@sQTJi5>C',
      port: 3306
    };
    this.dbTarget = {
      host: '85.31.230.199',
      database: 'e-control',
      user: 'e-control',
      password: 'SsO8GhSi28vFE6vZzFbQ',
      port: 3306
    };
  }

  // !ejecutar este despues de crossDataTrackingPaqueteo
  async updateTrackingPaqueteo() {
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
    const [data] = await origin.query(`SELECT * FROM ${this.table} WHERE id`);
    const dataOrigin = Array.isArray(data) ? data : [];
    if (dataOrigin.length === 0) return { msg: `No hay datos para migrar en la tabla ${this.table}`, status: false };
    
    const queryInsert = await HelpersCommands.createQueryInsert(columnsOrigin, dataOrigin, this.table);
    const ids = dataOrigin.map((item) => item.id);

    // *4-insertar datos en la tabla destino
    let promises = queryInsert.map(async (sentence) => {
      return await target.query(sentence);
    });
    await Promise.allSettled(promises);

    // *4-1-consultar los id que se insertaron para validar que si existan estos registros
    const [dataInserted] = await target.query(`SELECT id FROM ${this.table} WHERE id IN (${ids.join(",")})`);
    const idsInserted = Array.isArray(dataInserted) ? dataInserted.map((item) => item.id) : [];

    // *5-eliminar los registros que ya existen en la tabla destino
    const deleted = await target.query(`DELETE FROM ${this.table} WHERE id IN (${idsInserted.join(",")})`);

    return { msg: "migracion de datos exitosa", status: true, idsInserted, deleted };
  }

  // eliminara todo lo de tabla origen que ya exista en la tabla destino
  async crossDataTrackingPaqueteo(): Promise<{ msg:string, status:boolean, data?: any }> {
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
    const [dataTarget] = await target.query(`SELECT * FROM ${this.table} WHERE id BETWEEN 1512813 AND 1525436`);
    const dataTargetOrigin = Array.isArray(dataTarget) ? dataTarget : [];
    if (dataTargetOrigin.length === 0) return { msg: `No hay datos para migrar en la tabla ${this.table}`, status: false };

    // *4- generar sentencia delete con where in - de los datos que ya existen en la tabla destino
    const conditions = dataTargetOrigin.map(row => 
      `(id = ${row.id} AND guide = "${row.guide}" AND status = ${row.status} AND date = "${row.date}")`
    ).join(' OR ');
    const queryDelete = await HelpersCommands.createQueryDelete(this.table, conditions);
    const deleteQuery = await origin.query(queryDelete);

    return { msg: "crossDataTrackingPaqueteo", status: true, data: deleteQuery };
  }
}

export default MigUpdateTrackingPaqueteoModel;
