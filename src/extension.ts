import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
const dree = require('dree');

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "test" is now active!');
  let disposable = vscode.commands.registerCommand("test.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from test!");
  });

  context.subscriptions.push(disposable);
  const projectsDataProvider = new ProjectsDataProvider("/");
  vscode.window.registerTreeDataProvider("projectsBrowser", projectsDataProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}

export class ProjectsDataProvider implements vscode.TreeDataProvider<Repository> {
  constructor(private projectsRoots: string) {
    this.projectsRoots = projectsRoots;
  }

  getTreeItem(element: Repository): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Repository): Thenable<Repository[]> {
    if (element) {
      var folderList = this.getDirectoryFolders(element.location);
      return Promise.resolve(folderList);
    } else {
      console.log(this.projectsRoots);
      if (fs.existsSync(this.projectsRoots)) {
        var folderList = this.getDirectoryFolders(this.projectsRoots);
        return Promise.resolve(folderList);
      } else {
        return Promise.resolve([]);
      }
    }
  }

  getDirectoryFolders(baseFolder: string): Repository[] {
    var folderList: Repository[] = [];
    const options = {
      depth: 1
    };
    var tree = dree.scan('.', options);
    fs.readdirSync(baseFolder, {
      recursive: false,
      withFileTypes: true,
    })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) =>
        folderList.push(new Repository(dirent.name, path.join(dirent.path, dirent.name), vscode.TreeItemCollapsibleState.Collapsed))
      );
    return folderList;
  }
}

class Repository extends vscode.TreeItem {
  private isFolder: boolean = true;
  constructor(
    public readonly label: string,
    public location: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.location}`;
    this.isFolder = this.label === this.location;
  }

  iconPath = new vscode.ThemeIcon(this.isFolder ? "folder" : "repo");
}
