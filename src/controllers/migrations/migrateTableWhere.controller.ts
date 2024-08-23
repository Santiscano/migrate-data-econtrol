import { Request, Response } from "express";
import MigrateTableWhereModel from "../../models/migrations/migrateTableWhere.model";

class MigrateTableWhere {
  migrateTableWhereModel: MigrateTableWhereModel;

  constructor(){
    this.migrateTableWhereModel = new MigrateTableWhereModel;
  }

  oneTable = async (req:Request, res:Response) => {
    const { table, dbOrigin, dbTarget, conditions, cleanTable, limit, offset, key } = req.body;
    try {
      const resModel = await this.migrateTableWhereModel.oneTable({
        table, dbOrigin, dbTarget, conditions, cleanTable, limit, offset, key
      });
      if (!resModel.status) return res.status(401).json(resModel);
      if (resModel.status) return res.status(200).json(resModel);
    } catch (error) {
      res.status(500).json({ msg: "ocurrio un error", error });
    }
  }
}

export default MigrateTableWhere;
