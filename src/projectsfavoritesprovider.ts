import * as vscode from "vscode";



export class ProjectsFavoritesDataProvider implements vscode.TreeDataProvider<FavoriteProject> {
    onDidChangeTreeData?: vscode.Event<void | FavoriteProject | FavoriteProject[] | null | undefined> | undefined;

    private favList: FavoriteProject[];

    constructor() {
        this.favList = [];
      }

    getTreeItem(element: FavoriteProject): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: FavoriteProject | undefined): vscode.ProviderResult<FavoriteProject[]> {
        return Promise.resolve(this.favList);
    }

}

class FavoriteProject extends vscode.TreeItem {
    constructor(
      public readonly label: string,
      public location: string,
      public isProject: boolean = true,
      public icon: vscode.Uri | vscode.ThemeIcon,
    ) {
      super(label);
      this.tooltip = `${this.location}`;
      this.iconPath = this.icon;
      this.contextValue = "project";
      this.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }
  }