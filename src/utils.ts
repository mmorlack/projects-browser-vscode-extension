import * as FS from "fs";
import * as PATH from "path";

interface NodeItem {
    name: string;
    children?: NodeItem[]
    parent?: NodeItem
}

export class Repository {
  constructor (
    public name: string,
    //public directoryNode: NodeItem 
  ) {

  }
}

export function readDirData2(path: string, maxDepth: number, currentDepth: number = 0, repoList: Repository[]): NodeItem {
    let dirData = safeReadDirSync(path);
    let isGitDir = dirData.find((c) => c.name === '.git') !== undefined;
    let item: NodeItem = { name: PATH.basename(path) };
    if (isGitDir) {
      repoList.push(new Repository(PATH.basename(path)));
    }
    if (maxDepth > currentDepth + 1 && !isGitDir) {
      item.children = dirData.map(child => readDirData2(PATH.join(child.path, child.name), maxDepth, currentDepth + 1, repoList));
      item.children.map(child => child.parent = item);
    }
    return item;
  }
  
  function safeReadDirSync(path: string): FS.Dirent[] {
    try {
      let dirData = FS.readdirSync(path, {withFileTypes: true}).filter(i => i.isDirectory());
      return dirData;
    } catch(ex: any) {
      if (ex.code === "EACCES" || ex.code === "EPERM") {
        //User does not have permissions, ignore directory
        return [];
      }
      else {
        throw ex;
      }
    }
  }