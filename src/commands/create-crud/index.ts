import { Request, Response } from "express";
import { FieldPacket, RowDataPacket } from "mysql2";

import { connection } from "../../config/database/mysql";
import FormatedData from "./FormatedData";
import { CreateInterface } from "./templates/CreateInterface";
import { CreateRouter } from "./templates/CreateRoute";
import { CreateController } from "./templates/CreateController";
import { CreateModel } from "./templates/CreateModel";
import { CreateProcedure } from "./templates/CreateProcedure";

import { DB_DATABASE } from "../../config/configPorts";

export class ResoursesCommandCrud {

  static async createCrud(table: string) {
    try {
      const [data]: [RowDataPacket[], FieldPacket[]] = await connection.query(`DESCRIBE ${table}`);
      let columns = Array.isArray(data) 
        ? data.map(row => { return { Field: row.Field, Type: row.Type }} ) 
        : [];

      const { 
        propertiesObj, lengthItems, dataItems, procedureParams, insertInto, values,
        propertiesColWithoutId, propertiesObjWithoutId, lengthItemsWithoutId, dataItemsWithoutId, 
        procedureParamsWithoutId, insertIntoWithoutId, valuesWithoutId, setValuesWithoutId,
        interfaceWithoutId
      } = FormatedData.propertiesDB(columns);


      new CreateInterface(table, interfaceWithoutId).createFile();
      new CreateRouter(table).createFile();
      new CreateController(table).createFile();
      new CreateModel(table).createFile();
      new CreateProcedure(table).createFile();

      return { msg: "se termino la creacion de archivos con exito" };
    } catch (error) {
      return { msg : "Ocurrio un error al crear los archivos de las tablas", error }
    }
  }

  static async oneTable(table: string) {
    try {
      return await ResoursesCommandCrud.createCrud(table)
    } catch (error) {
      return {msg : "pasaron cosas", error}
    }
  }

  static async allTables() {
    try {
      const [tables]: [RowDataPacket[], FieldPacket[]] = await connection.query(`SHOW FULL TABLES WHERE Table_Type = 'BASE TABLE'`);
      let allTables = Array.isArray(tables)
        ? tables.map(row => row[`Tables_in_${DB_DATABASE}`] ) 
        : [];

      if (allTables.length > 0) {
        allTables.forEach(async (table: string) => {
          await ResoursesCommandCrud.createCrud(table);
        });

        return { msg: "se termino la creacion de archivos con exito" };
      }

      return {msg : "no se encontraron tablas"};
    } catch (error) {
      return { msg : "Ocurrio un error al crear los archivos de las tablas", error };
    }
  }
}
