import * as vscode from "vscode";


export async function openProject(path: string, newWindow: boolean) {
    await vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(path), newWindow);
}