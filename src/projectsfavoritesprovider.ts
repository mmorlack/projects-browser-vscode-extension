import * as vscode from "vscode";



export class ProjectsFavoritesDataProvider implements vscode.TreeDataProvider<FavoriteProject> {
    onDidChangeTreeData?: vscode.Event<void | FavoriteProject | FavoriteProject[] | null | undefined> | undefined;

    private favList: FavoriteProject[];

    constructor(context: vscode.ExtensionContext) {
        this.favList = context.globalState.get('projectsBrowser.favList') || [];
        this.favList = this.favList.map(item => new FavoriteProject(item.label, item.location, true, item.icon));
      }

    getTreeItem(element: FavoriteProject): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: FavoriteProject | undefined): vscode.ProviderResult<FavoriteProject[]> {
        return Promise.resolve(this.favList);
    }

}

export class FavoriteProject extends vscode.TreeItem {
    constructor(
      public readonly label: string,
      public location: string,
      public isProject: boolean = true,
      public icon: vscode.Uri | vscode.ThemeIcon,
    ) {
      super(label);
      this.tooltip = `${this.location}`;
      this.iconPath = new vscode.ThemeIcon('git-branch');
      this.contextValue = "project";
      this.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }
    
  }