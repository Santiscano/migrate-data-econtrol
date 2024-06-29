import CreateFile from "../CreateFile";
import { ContractCreateFile } from "../contract/CreateContractFile";

export class CreateProcedure extends CreateFile implements ContractCreateFile {

  constructor(tableName: string){
    super(`/SQL/${tableName}.procedure.sql`);
  }

  /**
   * define the content of the file
   * @returns string
   */
  createContent(){
    return `aqui ira el procedimiento almacenado`;
  }

  /**
   * @override ContractCreateFile createFile method
   * @returns void
   */
  createFile(): void{
    super.createFile(this.createContent());
  }
}
