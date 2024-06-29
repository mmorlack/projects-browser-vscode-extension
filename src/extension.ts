import * as vscode from "vscode";
import { NodeItem, ProjectsDataProvider } from "./projectsprovider";
import { FavoriteProject, ProjectsFavoritesDataProvider } from "./projectsfavoritesprovider";

export const PROJECT_FAVTORITES_KEY = 'projectsBrowser.favMap';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log("Extension project-browser active");
  context.globalState.update(PROJECT_FAVTORITES_KEY, undefined);

  const projectsDataProvider = new ProjectsDataProvider();
  vscode.window.registerTreeDataProvider("projectsBrowser", projectsDataProvider);

  const projectsFavoritesDataProvider = new ProjectsFavoritesDataProvider(context);
  vscode.window.registerTreeDataProvider("projectsBrowserFavorites", projectsFavoritesDataProvider);

  vscode.commands.registerCommand("projectsBrowser.openInNewWindow", async (proj: NodeItem) => {
    if (proj) {
      await vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(proj.location), true);
    }
  });

  vscode.commands.registerCommand("projectsBrowser.addToFavorites", async (proj: NodeItem) => {
    if (proj) {
      var favMap: Map<string, object> = retrieveMap(context, PROJECT_FAVTORITES_KEY);
      var favProj = new FavoriteProject(proj.label, proj.location, true, proj.icon);
      if (!favMap.has(proj.label)) {
        favMap.set(proj.label, favProj);
        storeMap(context, PROJECT_FAVTORITES_KEY, favMap);
        projectsFavoritesDataProvider.refresh(context);
      }
      console.log(retrieveMap(context, PROJECT_FAVTORITES_KEY));
    }
  });

  vscode.commands.registerCommand("projectsBrowser.clearFavorites", async (proj?: FavoriteProject) => {
    if (proj) {
      var favMap: Map<string, object> = retrieveMap(context, PROJECT_FAVTORITES_KEY);
      favMap.delete(proj.label);
      storeMap(context, PROJECT_FAVTORITES_KEY, favMap);
    } else {
      await context.globalState.update(PROJECT_FAVTORITES_KEY, undefined);
    }
    console.log(retrieveMap(context, PROJECT_FAVTORITES_KEY));
    projectsFavoritesDataProvider.refresh(context);
  });

  vscode.commands.registerCommand("projectsBrowser.refresh", () => projectsDataProvider.refresh());

  vscode.commands.registerCommand("projectsBrowser.filter", async () => {
    await vscode.commands.executeCommand("list.find");
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