import * as vscode from "vscode";
import { ProjectsDataProvider } from "./projectsprovider";
import { ProjectsFavoritesDataProvider } from "./projectsfavoritesprovider";
import { ProjectTreeItem } from "./common";
import { openProject } from "./utils";
import { TreeItemCollapsibleState } from "vscode";

export const PROJECT_FAVTORITES_KEY = 'projectsBrowser.favMap';


// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {


  console.log("Extension project-browser active");
  //context.globalState.update(PROJECT_FAVTORITES_KEY, undefined);

  const projectsDataProvider = new ProjectsDataProvider();
  vscode.window.registerTreeDataProvider("projectsBrowser", projectsDataProvider);

  const projectsFavoritesDataProvider = new ProjectsFavoritesDataProvider(context);
  vscode.window.registerTreeDataProvider("projectsBrowserFavorites", projectsFavoritesDataProvider);

  vscode.commands.registerCommand("projectsBrowser.openInNewWindow", async (proj: ProjectTreeItem) => {
    if (proj) {
      await openProject(proj.tooltip, true);
    }
  });

  vscode.commands.registerCommand("projectsBrowser.openInCurrentWindow", async (proj: ProjectTreeItem) => {
    if (proj) {
      const configs = vscode.workspace.getConfiguration("projectsBrowser");
      configs.get('promptOpenConfirmation', true) ? 
        vscode.window
        .showInformationMessage("Open project in current window?", "Yes", "No")
        .then(async answer => {
          if (answer === "Yes") {
            await openProject(proj.tooltip, false);
          }
        }) :
        await openProject(proj.tooltip, false);
    }
  });


  vscode.commands.registerCommand("projectsBrowser.addToFavorites", async (proj: ProjectTreeItem) => {
    if (proj) {
      var favMap: Map<string, object> = retrieveMap(context, PROJECT_FAVTORITES_KEY);
      if (!favMap.has(proj.label)) {
        favMap.set(proj.label, proj.toObject());
        storeMap(context, PROJECT_FAVTORITES_KEY, favMap);
        projectsFavoritesDataProvider.refresh(context);
      }
      console.log(retrieveMap(context, PROJECT_FAVTORITES_KEY));
    }
  });

  vscode.commands.registerCommand("projectsBrowser.clearFavorite", async (proj: ProjectTreeItem) => {
    var favMap: Map<string, object> = retrieveMap(context, PROJECT_FAVTORITES_KEY);
    favMap.delete(proj.label);
    storeMap(context, PROJECT_FAVTORITES_KEY, favMap);
    console.log(retrieveMap(context, PROJECT_FAVTORITES_KEY));
    projectsFavoritesDataProvider.refresh(context);
  });

  vscode.commands.registerCommand("projectsBrowser.clearFavorites", () => {
    context.globalState.update(PROJECT_FAVTORITES_KEY, undefined);
    projectsFavoritesDataProvider.refresh(context);
  });

  vscode.commands.registerCommand("projectsBrowser.refresh", () => {
    projectsDataProvider.refresh();
    var favMap: Map<string, object> = retrieveMap(context, PROJECT_FAVTORITES_KEY);
    projectsDataProvider.projectsData.forEach(
      proj => {
          if (favMap.has(proj.label)) {
            favMap.set(proj.label, proj.toObject());
        }
      }
    );
    storeMap(context, PROJECT_FAVTORITES_KEY, favMap);
    projectsFavoritesDataProvider.refresh(context);
  });

  vscode.commands.registerCommand("projectsBrowser.filter", async () => {
    await vscode.commands.executeCommand("list.find");
  });

  vscode.commands.registerCommand("projectsBrowser.openSettings", async () => {
    await vscode.commands.executeCommand('workbench.action.openSettings', '@ext:matteo-morlack.projects-browser');
  });

  vscode.commands.registerCommand("projectsBrowser.collapseAll", async () => {
    await vscode.commands.executeCommand('workbench.actions.treeView.projectsBrowser.collapseAll');
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}

export function retrieveMap(context: vscode.ExtensionContext, key: string): Map<string, any> {
  const mapJson = context.globalState.get<string>(key);
  if (mapJson) {
    const mapArray: [string, any][] = JSON.parse(mapJson);
    return new Map(mapArray);
  }
  return new Map();
}

export function storeMap(context: vscode.ExtensionContext, key: string, map: Map<string, any>): void {
  const mapArray = Array.from(map.entries());
  context.globalState.update(key, JSON.stringify(mapArray));
}