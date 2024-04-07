import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "test" is now active!');
  let disposable = vscode.commands.registerCommand("test.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from test!");
  });

  context.subscriptions.push(disposable);
  const projectsDataProvider = new ProjectsDataProvider("/");
  vscode.window.registerTreeDataProvider(
    "projectsBrowser",
    projectsDataProvider
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}

export class ProjectsDataProvider
  implements vscode.TreeDataProvider<Repository>
{
  constructor(private projectsRoots: string) {
    this.projectsRoots = projectsRoots;
  }

  getTreeItem(element: Repository): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Repository): Thenable<Repository[]> {
    if (element) {
      console.log(element);
      return Promise.resolve([]);
    } else {
      console.log(this.projectsRoots);
      if (fs.existsSync(this.projectsRoots)) {
        var folderList: Repository[] = [];
        fs.readdirSync(this.projectsRoots, {
          recursive: false,
          withFileTypes: true,
        })
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) =>
            folderList.push(
              new Repository(
                dirent.name,
                dirent.path,
                vscode.TreeItemCollapsibleState.None
              )
            )
          );
        return Promise.resolve(folderList);
      } else {
        console.log(this.projectsRoots);
        return Promise.resolve([]);
      }
    }
  }
}

class Repository extends vscode.TreeItem {
  private isFolder: boolean = true;
  constructor(
    public readonly label: string,
    private location: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.location}`;
    this.isFolder = this.label === this.location;
  }

  iconPath = new vscode.ThemeIcon(this.isFolder ? "folder" : "repo");
}
