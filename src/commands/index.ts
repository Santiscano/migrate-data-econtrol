import { Request, Response } from "express";

// Resourses of commands
import { ResoursesCommandCrud } from "./create-crud";
import { ResoursesCommandMigrateData } from "./migrate-data";

export class ResoursesCommands {
  
  // *===================================CRUDS=================================== //
  // *create-crud
  static async oneTableCrud(req: Request, res: Response) {
    try {
      const { table } = req.body;
      const result = await ResoursesCommandCrud.oneTable(table);
      return res.status(200)
        .json({
          msg: "creacion de crud exitoso",
          result
        })
    } catch (error) {}
  }

  static async allTablesCrud(req: Request, res: Response) {
    try {
      const result = await ResoursesCommandCrud.allTables();
      return res.status(200).json(result)
    } catch (error) {
      return res.status(500).json({ msg: "ocurrio un error", error })
    }
  }

  // *===================================Migrations=================================== //
  // *ONE TABLE
  // *=========migrate-data one table
  static async oneTableMigrateDataBulk(req: Request, res: Response) {
    try {
      const { table, cleanTable, dataConnectionOrigin, dataConnectionTarget, limit, offset  } = req.body;
      const result = await ResoursesCommandMigrateData.oneTableMigrateDataBulk({
        table, dbOrigin: dataConnectionOrigin, dbTarget: dataConnectionTarget, cleanTable, limit, offset
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ msg: "ocurrio un error", error });
    }
  }

  static async oneTableMigrateDataBulkUpduplicated(req:Request, res:Response){
    try {
      const { table, cleanTable, dataConnectionOrigin, dataConnectionTarget, limit, offset } = req.body;
      const result = await ResoursesCommandMigrateData
    } catch (error) {
      return res.status(500).json({ msg: "ocurrio un error", error });
    }
  }
  
  // *migrate one table and clean data
  static async oneTableMigrateAndCleanData(req: Request, res: Response) {
    try {
      const { table, key, dataConnectionOrigin, dataConnectionTarget, limitDBOrigin, limitDBDestiny } = req.body;
      const result = await ResoursesCommandMigrateData.oneTableMigrateAndCleanData({
        table, key, dataConnectionOrigin, dataConnectionTarget, 
        limitDBOrigin, limitDBDestiny
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(512).json({ msg: "ocurrio un error", error });
    }
  }

  // *MULTI TABLES
  // *=========migrate-data multiple tables
  static async multipleTablesMigrateData(req: Request, res: Response) {}

  // *=========migrate-data all tables
  static async allTablesMigrateData(req: Request, res: Response) {}
}
