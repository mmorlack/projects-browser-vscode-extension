import * as vscode from 'vscode';
import * as fs from 'fs';
import { CustomIcons, ProjectTreeItemObject } from './interfaces';

export class ProjectTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public tooltip: string,
    public isProject: boolean = false,
    public iconPath: vscode.Uri | vscode.ThemeIcon,
    public children: ProjectTreeItem[] = [],
  ) {
    super(label);
    this.tooltip = `${this.tooltip}`;
    this.contextValue = this.isProject ? 'project' : 'folder';
    this.collapsibleState = this.isProject
      ? vscode.TreeItemCollapsibleState.None
      : vscode.TreeItemCollapsibleState.Expanded;
    this.command = !this.isProject
      ? undefined
      : {
          title: 'vscode.open',
          command: 'projectsBrowser.openInCurrentWindow',
          arguments: [this],
        };
  }

  static fromObject(obj: ProjectTreeItemObject): ProjectTreeItem {
    var instance = new this(
      obj.label,
      obj.tooltip,
      obj.isProject,
      obj.icon.isCodicon ? new vscode.ThemeIcon(obj.icon.path) : vscode.Uri.parse(obj.icon.path),
    );
    return instance;
  }

  toObject(): ProjectTreeItemObject {
    return {
      label: this.label,
      tooltip: this.tooltip,
      isProject: this.isProject,
      icon: {
        isCodicon: this.iconPath instanceof vscode.ThemeIcon,
        path: this.iconPath instanceof vscode.ThemeIcon ? this.iconPath.id : this.iconPath.path,
      },
    };
  }
}
