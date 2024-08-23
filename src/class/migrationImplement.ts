import { ConnectionPoolType } from "../interfaces/sql2";

export interface MigrateTableInterface {
  table: string;
  dbOrigin: ConnectionPoolType;
  dbTarget: ConnectionPoolType;

  setTable: (table: string) => void;
  setDBOrigin: (data: ConnectionPoolType) => void;
  setDBTarget: (data: ConnectionPoolType) => void;
}
