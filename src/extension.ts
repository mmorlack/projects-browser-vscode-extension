import * as vscode from "vscode";
import { NodeItem, ProjectsDataProvider } from "./projectsprovider";
import { FavoriteProject, ProjectsFavoritesDataProvider } from "./projectsfavoritesprovider";

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log("Extension project-browser active");

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
      var favList: FavoriteProject[] = context.globalState.get('projectsBrowser.favList') || [];
      favList = favList.map(item => new FavoriteProject(item.label, item.location, true, item.icon));
      var favProj = new FavoriteProject(proj.label, proj.location, true, proj.icon);
      if (!favList.includes(favProj)) {
        favList.push(favProj);
        context.globalState.update('projectsBrowser.favList', favList);
        projectsFavoritesDataProvider.refresh(context);
      }
      console.log(context.globalState.get('projectsBrowser.favList'));
    }
  });


  vscode.commands.registerCommand("projectsBrowser.refresh", () => projectsDataProvider.refresh());

  vscode.commands.registerCommand("projectsBrowser.filter", async () => {
    await vscode.commands.executeCommand("list.find");
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
