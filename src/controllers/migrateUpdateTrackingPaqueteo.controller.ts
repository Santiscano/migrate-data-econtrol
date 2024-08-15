import { Request, Response } from 'express';
import MigUpdateTrackingPaqueteoModel from '../models/migUpdateTrackingPaqueteo.model';

class MigUpdateTrackingPaqueteo {
  trackingPaqueteoModel: MigUpdateTrackingPaqueteoModel;
  constructor() {
    this.trackingPaqueteoModel = new MigUpdateTrackingPaqueteoModel();
  }

  updateTrackingPaqueteo = async (req: Request, res: Response) => {
    try {
      console.log("Entering updateTrackingPaqueteo");
      const resModel = await this.trackingPaqueteoModel.updateTrackingPaqueteo();
      if (!resModel.status) return res.status(401).json(resModel);
      if (resModel.status) return res.status(200).json(resModel);
    } catch (error) {
      console.log("Error en updateTrackingPaqueteo", error);
      return res.status(500).json({ msg: "Error en updateTrackingPaqueteo", status: false });
    }
  }

  crossDataTrackingPaqueteo = async (req: Request, res: Response) => {
    try {
      console.log("Entering crossDataTrackingPaqueteo");
      const resModel = await this.trackingPaqueteoModel.crossDataTrackingPaqueteo();
      if (!resModel.status) return res.status(401).json(resModel);
      if (resModel.status) return res.status(200).json(resModel);
    } catch (error) {
      console.log("Error en crossDataTrackingPaqueteo", error);
      return res.status(500).json({ msg: "Error en crossDataTrackingPaqueteo", status: false });
    }
  }
}


export default MigUpdateTrackingPaqueteo;
