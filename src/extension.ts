import * as vscode from "vscode";
import * as FS from "fs";
import * as PATH from "path";
import dirTree from 'directory-tree';
import { DirectoryTree, DirectoryTreeOptions, DirectoryTreeCallback } from 'directory-tree';


// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log("Extension project-browser active");
  let disposable = vscode.commands.registerCommand("test.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from test!");
  });

  context.subscriptions.push(disposable);
  const projectsDataProvider = new ProjectsDataProvider("/");
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
        let nodeTree = readDirData(this.projectsRoots, 3);
        //var folderList = this.getDirectoryFolders(this.projectsRoots);
        return Promise.resolve([nodeTree]);
      } else {
        return Promise.resolve([]);
      }
    }
  }

}

class NodeItem extends vscode.TreeItem {
  private isFolder: boolean = true;
  constructor(
    public readonly label: string,
    public location: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Expanded,
    public children: NodeItem[] = [],
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.location}`;
    this.isFolder = this.label === this.location;
  }

  iconPath = new vscode.ThemeIcon(this.isFolder ? "folder" : "repo");
}


function readDirData(path: string, maxDepth: number, currentDepth: number = 0): NodeItem {
  let item = new NodeItem(PATH.basename(path), path);
  let dirData = safeReadDirSync(path);
  if (maxDepth > currentDepth + 1) {
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