export interface ContractCreateFile {
  createContent(): string;
  createFile(content: string): void;
}
