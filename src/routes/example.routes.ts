import { connection } from "../config/database/mysql";
import { Request, Response, Router } from "express";

const route = Router();

route.get("/all-tables", async (req: Request, res: Response) => {
  try {
    const [data] = await connection.query("SHOW FULL TABLES WHERE Table_Type = 'BASE TABLE'");

    return res.json({ msg: "se termino", data });
  } catch (error) {
    return res.status(400).json({msg : "pasaron cosas"})
  }
});

route.get("/one-table/:table", async (req: Request, res: Response) => {
  try {
    const { table } = req.params;
    const [data] = await connection.query(`DESCRIBE ${table}`);

    return res.json({ msg: "se termino", data });
  } catch (error) {
    return res.status(400).json({msg : "pasaron cosas"})
  }
});


export default route;
