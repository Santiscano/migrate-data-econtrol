import { Request, Response } from "express";
import FirstMigrateBulkModel from "../models/firstMigrateBulk.model";

class FirstMigrateBulk {
  firstMigrateModel: FirstMigrateBulkModel;

  constructor() {
    this.firstMigrateModel = new FirstMigrateBulkModel();
  }

  oneTable = async (req: Request, res: Response) => {
    const { table, dbOrigin, dbTarget, cleanTable, limit, offset, key } = req.body;
    try {
      const resModel = await this.firstMigrateModel.oneTable({
        table, dbOrigin, dbTarget, cleanTable, limit, offset, key
      });
      if (!resModel.status) return res.status(401).json(resModel);
      if (resModel.status) return res.status(200).json(resModel);
    } catch (error) {
      res.status(500).json({ msg: "ocurrio un error", error });
    }
  }

  async allTables(req: Request, res: Response) {}
}

export default FirstMigrateBulk;
