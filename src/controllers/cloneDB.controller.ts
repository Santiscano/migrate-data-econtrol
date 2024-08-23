import { Request, Response } from "express";

import CloneDBModel from './../models/cloneDB.model';

class CloneDB {
  cloneDBModel: CloneDBModel;

  constructor() {
    this.cloneDBModel = new CloneDBModel();
  }

  migrateSchema = async (req: Request, res: Response) => {
    const { dbOrigin, dbTarget } = req.body;
    try {
      const resModel = await this.cloneDBModel.migrateSchema(dbOrigin, dbTarget);
      if (!resModel.status) return res.status(401).json(resModel);
      if (resModel.status) return res.status(200).json(resModel);
    } catch (error) {
      res.status(500).json({ msg: "ocurrio un error", error });
    }
  };

  migrateSchemaData = async (req: Request, res: Response) => {};
}

export default CloneDB;
