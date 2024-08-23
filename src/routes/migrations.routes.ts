import { Router } from "express";

import FirstMigrateBulk  from './../controllers/firstMigrateBulk.controller';
import UpdateMigrateBulk from './../controllers/updateMigrateBulk.controllers';
import MigrateTableWhere from "./../controllers/migrations/migrateTableWhere.controller";


const route = Router();

// *====================== Instancias de los controladores
const firstMigrateBulk = new FirstMigrateBulk();
const updateMigrateBulk = new UpdateMigrateBulk();
const migrateTableWhere = new MigrateTableWhere();


// *====================== Rutas

// *Migrar
/**
 * *Migra todos los datos de una tabla origen a una tabla destino.
 * *Esta es util en particular cuando se hace la migracion por primera vez y esta migra en tandas de 20.000 registros.
 * @api {post} /first-migrate-one-table-bulk First migrate one table bulk
 * @apiName First migrate one table bulk
 * @param {string} table - table name
 * @param {boolean} cleanTable - clean table destiny previous to migrate data
 * @param {string} key - key to identify the primary key of the table or the key to compare that already exists in the target table
 * @param {object} dbOrigin - connection to origin database
 * @param {object} dbTarget - connection to target database
 */
route.post("/first-migrate-one-table-bulk", firstMigrateBulk.oneTable);

/**
 * *Migra todos los datos de una tabla origen a una tabla destino.
 * *Esta es util en particular cuando puede que existan datos repetidos en la tabla destino, 
 * *por lo que se debe comparar los datos antes de insertarlos segun una key indicada. ""
 * @api {post} /update-migrate-one-table-bulk Update migrate one table bulk
 * @apiName Update migrate one table bulk
 */
route.post("/update-migrate-one-table-bulk", updateMigrateBulk.oneTable);

/**
 * *Migrar todos los datos de una tabla origen a una tabla destino segun condiciones.
 * *Esta es util en particular cuando se necesita migrar datos de una tabla origen a una tabla destino segun condiciones WHERE.
 * @api {post} /migrate-one-table-where Migrate one table where
 * @apiName Migrate one table where
 * @param {string} table - table name
 * @param {string} conditions - conditions to filter data
 * @param {object} dbOrigin - connection to origin database
 * @param {object} dbTarget - connection to target database
 * 
 * @param {boolean} cleanTable - clean table destiny previous to migrate data
 * @param {string} key - key to identify the primary key of the table or the key to compare that already exists in the target table
 */
route.post("/migrate-one-table-where", migrateTableWhere.oneTable);

export default route;
