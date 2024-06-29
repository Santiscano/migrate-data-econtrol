import fs from "fs";
import path from 'path';

class CreateFile {
  private pathFile = '';

  constructor(pathFile: string){
    this.pathFile = pathFile;
  }

  createFile(content: string){
    const filePath = path.join(__dirname, '../../', `${this.pathFile}`);
    console.log('filePath: ', filePath);

    fs.writeFileSync(filePath, content);
  }
}

export default CreateFile;
