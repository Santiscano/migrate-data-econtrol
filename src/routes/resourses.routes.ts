import { Router } from "express";

import { ResoursesCommand } from "../commands/create-crud";

const route = Router();

route.post("/one-table", ResoursesCommand.oneTable);
route.post("/all-tables", ResoursesCommand.allTables);

export default route;
