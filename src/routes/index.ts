import { Router } from "express";

import ApiKeys from "../middlewares/apiKey";

import authRoutes from './auth.routes';
import exampleRoutes from './example.routes';
import resources from './resourses.routes';

const route = Router();

const api = new ApiKeys();

// list routes 
// route.use();


route.use( "/auth", api.validateApikey,  authRoutes );
route.use( "/example",  exampleRoutes );
route.use( "/resources", resources );

export default route;
