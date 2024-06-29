import CreateFile from "../CreateFile";
import { ContractCreateFile } from "../contract/CreateContractFile";

export class CreateModel extends CreateFile implements ContractCreateFile {

  constructor(tableName: string){
    super(`/models/${tableName}.model.ts`);
  }

  /**
   * define the content of the file
   * @returns string
   */
  createContent(){
    return `aqui ira el modelo`;
  }

  /**
   * @override ContractCreateFile createFile method
   * @returns void
   */
  createFile(): void{
    super.createFile(this.createContent());
  }
}
