import CreateFile from "../CreateFile";
import { ContractCreateFile } from "../contract/CreateContractFile";

export class CreateRouter extends CreateFile implements ContractCreateFile {
  
  constructor(tableName: string){
    super(`/routes/${tableName}.router.ts`);
  }

  /**
   * define the content of the file
   * @returns string
   */
  createContent(){
    return `aqui ira el router`;
  }

  /**
   * @override ContractCreateFile createFile method
   * @returns void
   */
  createFile(): void{
    super.createFile(this.createContent());
  }
}
