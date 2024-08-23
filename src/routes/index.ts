import { Router } from "express";

import ApiKeys from "../middlewares/apiKey";

import authRoutes from './auth.routes';
import exampleRoutes from './example.routes';
import resources from './resourses.routes';
import migrations from './migrations.routes';
import cloneDB from './cloneDB.routes';

const route = Router();

const api = new ApiKeys();

// list routes 
// route.use();


route.use( "/auth", api.validateApikey,  authRoutes );
route.use( "/example",  exampleRoutes );
route.use( "/migrations", migrations );
route.use( "/resources", resources );
route.use( "/cloneDB", cloneDB );


// ! return
import ReturnTracking from "../models/returnTracking.model";
import { Request, Response } from "express";

route.post("/return-migration",async (req: Request, res: Response) => {
  try {
    const returnTracking = new ReturnTracking();
    const resModel = await returnTracking.pre_liquidacion();
    if (!resModel.status) return res.status(401).json(resModel);
    if (resModel.status) return res.status(200).json(resModel);
  } catch (error) {
    return res.status(500).json({ message: "error", error });
  }
});
export default route;
