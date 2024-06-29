import * as vscode from "vscode";
import { PROJECT_FAVTORITES_KEY, retrieveMap } from "./extension";



export class ProjectsFavoritesDataProvider implements vscode.TreeDataProvider<FavoriteProject> {
    private _onDidChangeTreeData: vscode.EventEmitter<FavoriteProject | undefined | null | void> = 
      new vscode.EventEmitter<FavoriteProject | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<FavoriteProject | undefined | null | void> = this._onDidChangeTreeData.event;

    private favList: FavoriteProject[];

    constructor(context: vscode.ExtensionContext) {
      this.favList = this.getTreeData(context);
    }

    getTreeItem(element: FavoriteProject): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: FavoriteProject | undefined): vscode.ProviderResult<FavoriteProject[]> {
        return Promise.resolve(this.favList);
    }

    getTreeData(context: vscode.ExtensionContext): FavoriteProject[] {
      var favMap = retrieveMap(context, PROJECT_FAVTORITES_KEY) as Map<string, FavoriteProject>;
      var favList = [];
      for (let item of favMap.values()) {
        favList.push(new FavoriteProject(item.label, item.location, true, item.icon));
      };
      return favList;
    }

    refresh(context: vscode.ExtensionContext) {
      this.favList = this.getTreeData(context);
      this._onDidChangeTreeData.fire();
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
