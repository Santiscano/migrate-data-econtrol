import { Router } from "express";

import { ResoursesCommand } from "../commands/create-crud";

const route = Router();

route.get("/one-table", ResoursesCommand.oneTable);

export default route;
