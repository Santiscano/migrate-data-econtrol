import { connection } from "../config/database/mysql";
import { Request, Response, Router } from "express";

const route = Router();

route.get("/", async (req: Request, res: Response) => {
  // consulta sql
  const [data] = await connection.query("SELECT * FROM TB_PAQUETEOS LIMIT 2");
  return res.json({ msg: "se termino", data });
});

export default route;
