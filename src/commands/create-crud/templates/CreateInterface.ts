import CreateFile from "../CreateFile";
import { ContractCreateFile } from "../contract/CreateContractFile";

export class CreateInterface extends CreateFile implements ContractCreateFile {
  private tableNamePascal = '';
  private interfaceWithoutId = '';

  constructor(tableName: string, interfaceWithoutId: string){
    super(`/interfaces/${tableName}.d.ts`);
    this.tableNamePascal = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    this.interfaceWithoutId = interfaceWithoutId;
  }

  /**
   * define the content of the file
   * @returns string
   * @override ContractCreateFile createContent method
   * @returns string
   * 
  */
  createContent(){
    return `export interface TypeId${this.tableNamePascal} {
  id${this.tableNamePascal}: number | string;
};

export interface Type${this.tableNamePascal} extends TypeId${this.tableNamePascal} {
  ${this.interfaceWithoutId}
};
`;
  }

  /**
   * @override ContractCreateFile createFile method
   * @returns void
   */
  createFile(): void{
    super.createFile(this.createContent());
  }
}
