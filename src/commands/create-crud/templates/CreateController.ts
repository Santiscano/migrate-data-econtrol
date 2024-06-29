import CreateFile from "../CreateFile";
import { ContractCreateFile } from "../contract/CreateContractFile";

export class CreateController extends CreateFile implements ContractCreateFile {

  constructor(tableName: string){
    super(`/controllers/${tableName}.controller.ts`);
  }

  /**
   * define the content of the file
   * @returns string
   */
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
