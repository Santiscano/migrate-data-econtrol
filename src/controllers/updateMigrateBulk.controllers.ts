import { Request, Response } from "express";
import UpdateMigrateBulkModel from "../models/updateMigrateBulk.model";

class UpdateMigrateBulk {
  updateMigrateModel: UpdateMigrateBulkModel;

  constructor() {
    this.updateMigrateModel = new UpdateMigrateBulkModel();
  }

  oneTable = async (req: Request, res: Response) => {
    const { table, dbOrigin, dbTarget, cleanTable, limit, offset, key, conditions } = req.body;
    try {
      const resModel = await this.updateMigrateModel.oneTable({
        table, dbOrigin, dbTarget, cleanTable, limit, offset, key, conditions
      });
      if (!resModel.status) return res.status(401).json(resModel);
      if (resModel.status) return res.status(200).json(resModel);
    } catch (error) {
      res.status(500).json({ msg: "ocurrio un error", error });
    }
  }
}

export default UpdateMigrateBulk;
