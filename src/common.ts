import * as vscode from "vscode";
import { ProjectTreeItemObject } from "./interfaces";

export class ProjectTreeItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public tooltip: string,
        public isProject: boolean = false,
        public icon: vscode.Uri | vscode.ThemeIcon,
        public children: ProjectTreeItem[] = []
    ) {
        super(label);
        this.tooltip = `${this.tooltip}`;
        this.iconPath = this.icon;
        this.contextValue = this.isProject ? "project" : "folder";
        this.collapsibleState = this.isProject
            ? vscode.TreeItemCollapsibleState.None
            : vscode.TreeItemCollapsibleState.Expanded;
    }

    static fromObject(obj: ProjectTreeItemObject) {
        return new this(
            obj.label,
            obj.tooltip,
            obj.isProject,
            obj.icon.isCodicon ? 
            new vscode.ThemeIcon(obj.icon.path) : 
            vscode.Uri.parse(obj.icon.path)
        );
    }

    toObject(): ProjectTreeItemObject {
        return {
            label: this.label,
            tooltip: this.tooltip,
            isProject: this.isProject,
            icon: {
                isCodicon: this.icon instanceof vscode.ThemeIcon,
                path: this.icon instanceof vscode.ThemeIcon ?
                    this.icon.id :
                    this.icon.path
            }
        };
    }

}