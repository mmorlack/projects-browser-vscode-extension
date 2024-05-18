import * as vscode from "vscode";
import * as FS from "fs";
import * as PATH from "path";
import dirTree from 'directory-tree';
import { DirectoryTree, DirectoryTreeOptions, DirectoryTreeCallback } from 'directory-tree';
import { readDirData2, Repository } from "./utils";

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log("Extension project-browser active");
  let disposable = vscode.commands.registerCommand("test.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from test!");
  });

  context.subscriptions.push(disposable);
  const projectsDataProvider = new ProjectsDataProvider("/home/matteo/coding");
  vscode.window.registerTreeDataProvider("projectsBrowser", projectsDataProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}

export class ProjectsDataProvider implements vscode.TreeDataProvider<NodeItem> {
  constructor(private projectsRoots: string) {
    this.projectsRoots = projectsRoots;
  }

  getTreeItem(element: NodeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: NodeItem): Thenable<NodeItem[]> {
    if (element) {
      return Promise.resolve(element.children);
    } else {
      console.log(this.projectsRoots);
      if (FS.existsSync(this.projectsRoots)) {
        let nodeTree = readDirData(this.projectsRoots, 4);
        let gitList: Repository[] = [];
        let nodeTree2 = readDirData2(this.projectsRoots, 4, 0, gitList);
        //var folderList = this.getDirectoryFolders(this.projectsRoots);
        return Promise.resolve([nodeTree]);
      } else {
        return Promise.resolve([]);
      }
    }
  }

}

class NodeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public location: string,
    public isRepo: boolean = false,
    public children: NodeItem[] = [],
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed,
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.location}`;
    this.iconPath = new vscode.ThemeIcon(!this.isRepo ? "folder" : "git-branch");
  }
}


function readDirData(path: string, maxDepth: number, currentDepth: number = 0): NodeItem {
  let dirData = safeReadDirSync(path);
  let isGitDir = dirData.find((c) => c.name === '.git') !== undefined;
  let item = new NodeItem(PATH.basename(path), path, isGitDir);
  if (maxDepth > currentDepth + 1 && !item.isRepo) {
    item.children = dirData.map(child => readDirData(PATH.join(child.path, child.name), maxDepth, currentDepth + 1));
  }
  return item;
}

function safeReadDirSync(path: string): FS.Dirent[] {
  try {
    let dirData = FS.readdirSync(path, {withFileTypes: true}).filter(i => i.isDirectory());
    return dirData;
  } catch(ex: any) {
    if (ex.code == "EACCES" || ex.code == "EPERM") {
      //User does not have permissions, ignore directory
      return [];
    }
    else {
      throw ex;
    }
  }
}