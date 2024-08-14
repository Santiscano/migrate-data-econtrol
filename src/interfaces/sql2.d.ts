import { RowDataPacket, OkPacket, ResultSetHeader } from "mysql2";

type SQLResponse =
  FieldPacket[]
  | RowDataPacket[]
  | RowDataPacket[][]
  | OkPacket
  | OkPacket[]
  | ResultSetHeader[]
  | ProcedureCallPacket;

export default SQLResponse;

export type QueryRes = [RowDataPacket[], FieldPacket[]];

export interface ConnectionPoolType {
  host: string;
  user: string;
  database: string;
  port: number;
  password: string;
}

export interface ColumnsType {
  Field: string;
  Type: string;
}
