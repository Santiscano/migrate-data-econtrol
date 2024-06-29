import { Request, Response } from "express";
import { FieldPacket, RowDataPacket } from "mysql2";

import { connection } from "../../config/database/mysql";
import FormatedData from "./FormatedData";
import { CreateInterface } from "./templates/CreateInterface";
import { CreateRouter } from "./templates/CreateRoute";
import { CreateController } from "./templates/CreateController";
import { CreateModel } from "./templates/CreateModel";
import { CreateProcedure } from "./templates/CreateProcedure";

export class ResoursesCommand {
  static async oneTable(req: Request, res: Response) {
    try {
      const { table } = req.body;
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
      // new CreateRouter(table).createFile();
      // new CreateController(table).createFile();
      // new CreateModel(table).createFile();
      // new CreateProcedure(table).createFile();

      return res.json({ msg: "se termino", columns });
    } catch (error) {
      return res.status(500).json({msg : "pasaron cosas"})
    }
  }
}
