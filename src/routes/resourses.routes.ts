import { Router } from "express";

// import { ResoursesCommandCrud } from "../commands/create-crud";
import { ResoursesCommands } from "../commands";
import MigUpdateTrackingPaqueteo from "../controllers/migrateUpdateTrackingPaqueteo.controller";

const route = Router();

// *Migrate update tracking paqueteo
const trackingPaqueteoController = new MigUpdateTrackingPaqueteo();
route.post("/migrate-update-tracking-paqueteo", trackingPaqueteoController.updateTrackingPaqueteo);
route.post("/cross-data-tracking-paqueteo", trackingPaqueteoController.crossDataTrackingPaqueteo); // !ejecutar este primero antes que updateTrackingPaqueteo















// *Create crud
route.post("/crud-one-table", ResoursesCommands.oneTableCrud);
route.post("/crud-all-tables", ResoursesCommands.allTablesCrud);

// *Migrate data
/**
 * Esta ruta se encarga de migrar todos los datos de una tabla origen a otra destino, con la posibilidad de limpiar la tabla destino antes de migrar los datos
 * @api {post} /migrate-one-table Migrate one table
 * @apiName Migrate one table
 * @param {string} table - table name
 * @param {boolean} cleanTable - clean table destiny previous to migrate data
 * @param {boolean} cleanDataOrigin - clean data origin after migrate data
 * @param {key} key - key to compare that already exists in the target table
 * @param {object} dataConnectionOrigin - connection to origin database
 * @param {object} dataConnectionTarget - connection to target database
 */
route.post(
  "/migrate-one-table-bulk",
  ResoursesCommands.oneTableMigrateDataBulk
);

/**
 * Esta ruta se encargara de migrar los datos de una tabla origen a una tabla destino, pero no duplicara los datos que ya existan en la tabla destino
 * @api {post} /migrate-one-table-bulk-unduplicated Migrate one table unduplicated
 * @apiName Migrate one table unduplicated
 * @param {string} table - table name
 * @param {boolean} cleanTable - clean table destiny previous to migrate data
 * @param {object} dataConnectionOrigin - connection to origin database
 * @param {object} dataConnectionTarget - connection to target database
 */
route.post(
  "/migrate-one-table-bulk-unduplicated", 
  ResoursesCommands.oneTableMigrateDataBulkUpduplicated
);

/**
 * Esta
 * @api {post} /migrate-one-table-and-clean Migrate one table and clean data
 * @apiName Migrate one table and clean data
 * @param {string} table - table name
 * @param {string} key - key to compare
 * @param {object} dataConnectionOrigin - connection to origin database
 * @param {object} dataConnectionTarget - connection to target database
 * @param {number} limitDBOrigin - limit of data to migrate
 */
route.post(
  "/migrate-one-table-and-clean-origin",
  ResoursesCommands.oneTableMigrateAndCleanData
);

route.post(
  "/migrate-multiple-tables",
  ResoursesCommands.multipleTablesMigrateData
);

route.post("/migrate-all-tables", ResoursesCommands.allTablesMigrateData);

export default route;
