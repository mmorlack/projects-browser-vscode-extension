import * as vscode from "vscode";
import * as fs from "fs";
import { CustomIcons, ProjectTreeItemObject } from "./interfaces";


export class ProjectTreeItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public tooltip: string,
        public isProject: boolean = false,
        public iconConfigs: CustomIcons[] = [],
        public children: ProjectTreeItem[] = []
    ) {
        super(label);
        this.tooltip = `${this.tooltip}`;
        this.iconPath = this.setIcon(this.iconConfigs);
        this.contextValue = this.isProject ? "project" : "folder";
        this.collapsibleState = this.isProject
            ? vscode.TreeItemCollapsibleState.None
            : vscode.TreeItemCollapsibleState.Expanded;
        this.command = !this.isProject ? 
            undefined :
            {
                title: 'vscode.open',
                command: 'projectsBrowser.openInCurrentWindow',
                arguments: [this],
            };
    }

    static fromObject(obj: ProjectTreeItemObject): ProjectTreeItem {
        var instance = new this(
            obj.label,
            obj.tooltip,
            obj.isProject
        );
        instance.iconPath = obj.icon.isCodicon ?
            new vscode.ThemeIcon(obj.icon.path) :
            vscode.Uri.parse(obj.icon.path);
        return instance;
    }

    toObject(): ProjectTreeItemObject {
        return {
            label: this.label,
            tooltip: this.tooltip,
            isProject: this.isProject,
            icon: {
                isCodicon: this.iconPath instanceof vscode.ThemeIcon,
                path: 
                //TODO: fix this logic
                this.iconPath instanceof vscode.ThemeIcon ?
                    this.iconPath.id :
                        this.iconPath instanceof vscode.Uri ? this.iconPath.path : ''
            }
        };
    }

    setIcon(iconConfigs: CustomIcons[]) {
        const configs = vscode.workspace.getConfiguration("projectsBrowser");

        function _getIcon(icon: string): vscode.Uri | vscode.ThemeIcon {
            return fs.existsSync(icon) ? vscode.Uri.parse(icon) : new vscode.ThemeIcon(icon);
        }
        
        let pathType = this.isProject ? 'project' : 'folder';
            for (const iconConfig of iconConfigs){
                const regex = new RegExp(iconConfig.matcher);
                if (regex.test(this.tooltip) && pathType === iconConfig.applysTo) {
                    return _getIcon(iconConfig.icon);
            }
        }
        //const extSettings = vscode.workspace.getConfiguration("projectsBrowser");
        return this.isProject ?
            _getIcon(configs.get('defaultProjectIcon', 'git-branch')) :
            _getIcon(configs.get('defaultFolderIcon', 'folder'));
    }

}