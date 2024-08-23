import { Router } from "express";

import CloneDBController from "../controllers/cloneDB.controller";

const cloneDBController = new CloneDBController();
const router = Router();

router.post("/migrate-schema", cloneDBController.migrateSchema);
router.post("/migrate-db-data", cloneDBController.migrateSchemaData);

export default router;
