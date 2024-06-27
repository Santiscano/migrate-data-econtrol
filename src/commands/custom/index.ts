import { connection } from "../../config/database/mysql";
import { FieldPacket, RowDataPacket } from "mysql2";
import { Request, Response } from "express";
import fs from "fs";
import path from 'path';

class ResoursesCommand {
  
  static async oneTable(req: Request, res: Response) {
    try {
      const { table } = req.body;
      const [data]: [RowDataPacket[], FieldPacket[]] = await connection.query(`DESCRIBE ${table}`);
      let columns = Array.isArray(data) 
        ? data.map(row => { return { Field: row.Field, Type: row.Type }} ) 
        : [];

      const { 
        propertiesObj, lengthItems, dataItems, procedureParams, insertInto, values,
        propertiesColWithoutId, propertiesObjWithoutId, lengthItemsWithoutId, dataItemsWithoutId, 
        procedureParamsWithoutId, insertIntoWithoutId, valuesWithoutId, setValuesWithoutId
      } = FormatedData.propertiesDB(columns);

      new CreateController(table).createFile();

      return res.json({ msg: "se termino", columns });
      // let columns = [...data.map((row) => { return { Field: row.Field, Type: row.Type }})];
    } catch (error) {
      return res.status(400).json({msg : "pasaron cosas"})
    }
  } 
}

export default ResoursesCommand;

class FormatedData {
  static propertiesDB(columns: { Field: any; Type: any; }[]){
    const propertiesObj = columns.map((property) => property.Field).join(', ');
    const lengthItems = columns.map(() => '?').join(', ');
    const dataItems = columns.map((property) => `data.${property.Field}`).join(', ');
    const procedureParams = columns.map((property) => `IN _${property.Field} ${property.Type.toUpperCase()},`).join("\n    ");
    const insertInto = columns.map((property) => property.Field).join(', ');
    const values = columns.map((property) => `_${property.Field}`).join(', ');
    // properties without id
    const propertiesColWithoutId = columns.slice(1).map((property) =>`${property.Field}: ${property.Type.startsWith("varchar") ? "string" : property.Type === "int" ? "number" : "string"};`).join("\n  ");
    const propertiesObjWithoutId = columns.slice(1).map((property) => property.Field).join(', ');
    const lengthItemsWithoutId = columns.slice(1).map(() => '?').join(', ');
    const dataItemsWithoutId = columns.slice(1).map((property) => `data.${property.Field}`).join(', ');
    const procedureParamsWithoutId = columns.slice(1).map((property) => `IN _${property.Field} ${property.Type.toUpperCase()},`).join("\n    ");
    const insertIntoWithoutId = columns.slice(1).map((property) => property.Field).join(', ');
    const valuesWithoutId = columns.slice(1).map((property) => `_${property.Field}`).join(', ');
    const setValuesWithoutId = columns.slice(1).map((property, index, array) => {
      if (index === array.length - 1) {
        return `${property.Field} = _${property.Field}`;
      } else {
        return `${property.Field} = _${property.Field},`;
      }
    }).join('\n            ');
    return {
      propertiesObj,
      lengthItems,
      dataItems,
      procedureParams,
      insertInto,
      values,
      // sin id
      propertiesColWithoutId,
      propertiesObjWithoutId,
      lengthItemsWithoutId,
      dataItemsWithoutId,
      procedureParamsWithoutId,
      insertIntoWithoutId,
      valuesWithoutId,
      setValuesWithoutId,
    }
  }
}

class CreateFile {
  private tableName = '';

  constructor(tableName: string){
    this.tableName = tableName;
  }

  createFile(content: string){
    const filePath = path.join(__dirname, '../../', `${this.tableName}`);

    fs.writeFileSync(filePath, content);
  }
}

interface ContractCreateFile {
  createContent(): string;
  createFile(content: string): void;
}

class CreateController extends CreateFile implements ContractCreateFile {

  constructor(tableName: string){
    super(`controllers/${tableName}.controller.ts`);
  }

  createContent(){
    return `aqui ira el controlador`;
  }

  /**
   * @override ContractCreateFile createFile method
   * @returns void
   */
  createFile(): void{
    super.createFile(this.createContent());
  }
}
