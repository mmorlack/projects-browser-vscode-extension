import * as vscode from "vscode";
import { NodeItem, ProjectsDataProvider } from "./projectsprovider";
import { ProjectsFavoritesDataProvider } from "./projectsfavoritesprovider";

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log("Extension project-browser active");

  vscode.commands.registerCommand("projectsBrowser.openInNewWindow", async (proj: NodeItem) => {
    if (proj) {
      await vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(proj.location), true);
    }
  });

  vscode.commands.registerCommand("projectsBrowser.addToFavorites", async (proj: NodeItem) => {
    if (proj) {
      console.log(proj);
      const globalState = context.globalState;
      var favList: NodeItem[] = globalState.get('projectsBrowser.favList') || [];
      favList.push(proj);
      globalState.update('projectsBrowser.favList', favList);
      console.log(globalState.get('projectsBrowser.favList'))
      //context.globalState.update()
    }
  });

  const projectsDataProvider = new ProjectsDataProvider();
  vscode.window.registerTreeDataProvider("projectsBrowser", projectsDataProvider);

  const projectsFavoritesDataProvider = new ProjectsFavoritesDataProvider();
  vscode.window.registerTreeDataProvider("projectsBrowserFavorites", projectsFavoritesDataProvider);

  vscode.commands.registerCommand("projectsBrowser.refresh", () => projectsDataProvider.refresh());

  vscode.commands.registerCommand("projectsBrowser.filter", async () => {
    await vscode.commands.executeCommand("list.find");
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
