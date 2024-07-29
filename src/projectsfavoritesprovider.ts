import * as vscode from "vscode";
import { PROJECT_FAVTORITES_KEY, retrieveMap } from "./extension";
import { ProjectTreeItem } from "./common";
import { ProjectTreeItemObject } from "./interfaces";



export class ProjectsFavoritesDataProvider implements vscode.TreeDataProvider<ProjectTreeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ProjectTreeItem | undefined | null | void> = 
      new vscode.EventEmitter<ProjectTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ProjectTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private favList: ProjectTreeItem[];

    constructor(context: vscode.ExtensionContext) {
      this.favList = this.getTreeData(context);
    }

    getTreeItem(element: ProjectTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: ProjectTreeItem | undefined): vscode.ProviderResult<ProjectTreeItem[]> {
        return Promise.resolve(this.favList);
    }

    getTreeData(context: vscode.ExtensionContext): ProjectTreeItem[] {
      var favMap = retrieveMap(context, PROJECT_FAVTORITES_KEY) as Map<string, ProjectTreeItemObject>;
      var favList = [];
      for (let item of favMap.values()) {
        favList.push(ProjectTreeItem.fromObject(item));
      };
      return favList;
    }

    refresh(context: vscode.ExtensionContext) {
      this.favList = this.getTreeData(context);
      this._onDidChangeTreeData.fire();
  }
}
