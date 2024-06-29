import * as vscode from "vscode";
import * as FS from "fs";
import * as PATH from "path";
import { CustomIcons, ProjectsConfig, ProjectsPropertiesConfig } from "./interfaces";


export class ProjectsDataProvider implements vscode.TreeDataProvider<NodeItem> {
    private treeData: NodeItem[];
  
    constructor() {
      this.treeData = this.getTreeData();
    }
  
    private _onDidChangeTreeData: vscode.EventEmitter<NodeItem | undefined | null | void> = 
      new vscode.EventEmitter<NodeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<NodeItem | undefined | null | void> = this._onDidChangeTreeData.event;
  
    refresh(): void {
      this.treeData = this.getTreeData();
      this._onDidChangeTreeData.fire();
    }
  
    filter(query: string | undefined) {
      if (query) {
        let filteredNodeTree = pruneTree(this.treeData[0], [query]);
        this.treeData = filteredNodeTree ? [filteredNodeTree] : [];
      }
      this._onDidChangeTreeData.fire();
    }
  
    getTreeData(): NodeItem[] {
      let projectsRoots = vscode.workspace.getConfiguration("projectsBrowser").get("rootFolders") as ProjectsConfig[];
      let projects = [];
      for (var projectConfig of projectsRoots) {
        const {rootFolder, ...configs} = projectConfig;
        console.log(`Retrieving data from folder ${rootFolder}`);
        if (FS.existsSync(rootFolder)) {
          let repoList: NodeItem[] = [];
          let nodeTree = readDirData(rootFolder, 0, repoList, configs);
          let prunedNodeTree = pruneTree(
            nodeTree,
            repoList.map((r) => r.label)
          );
          if (prunedNodeTree) {
            projects.push(prunedNodeTree);
          }
        }
      }
      return projects;
    }
  
    getTreeItem(element: NodeItem): vscode.TreeItem {
      return element;
    }
  
    getChildren(element?: NodeItem): Thenable<NodeItem[]> {
      if (element) {
        return Promise.resolve(element.children);
      } else {
        return Promise.resolve(this.treeData);
      }
    }
  }
  
  export class NodeItem extends vscode.TreeItem {
    constructor(
      public readonly label: string,
      public location: string,
      public isProject: boolean = false,
      public icon: vscode.Uri | vscode.ThemeIcon,
      public children: NodeItem[] = []
    ) {
      super(label);
      this.tooltip = `${this.location}`;
      this.iconPath = this.icon;
      this.contextValue = this.isProject ? "project" : "folder";
      this.collapsibleState = this.isProject
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Expanded;
    }
  }
  
  function readDirData(
    path: string,
    currentDepth: number = 0,
    repoList: NodeItem[],
    configs: ProjectsPropertiesConfig
  ): NodeItem {
    let dirData = safeReadDirSync(path);
    let isProject = isProjectFactory(configs.projectsType || 'git')(dirData, configs);
    let icon = getIcon(configs.customIcons || [], path, isProject);
    let item = new NodeItem(PATH.basename(path), path, isProject, icon);
    if (item.isProject) {
      repoList.push(item);
      if (!configs.recurseAfterFirstHit) {
        return item;
      }
    }
    if ((configs.maxDepth || 4) > currentDepth + 1) {
      item.children = dirData.map((child) =>
        readDirData(PATH.join(child.path, child.name), currentDepth + 1, repoList, configs)
      );
    }
    return item;
  }
  
  function safeReadDirSync(path: string): FS.Dirent[] {
    try {
      let dirData = FS.readdirSync(path, { withFileTypes: true }).filter((i) => i.isDirectory());
      return dirData;
    } catch (ex: any) {
      if (ex.code === "EACCES" || ex.code === "EPERM") {
        //User does not have permissions, ignore directory
        return [];
      } else {
        throw ex;
      }
    }
  }
  
  function pruneTree(root: NodeItem, nodeNames: string[]): NodeItem | null {
    function shouldKeepNode(node: NodeItem): boolean {
      if (!node.children) {
        return false;
      }
      node.children = node.children.map((child) => pruneTree(child, nodeNames)).filter(Boolean) as NodeItem[];
      if (node.children.length === 0) {
        return nodeNames.includes(node.label);
      }
      return true;
    }
    return shouldKeepNode(root) ? root : null;
  }
  
  function isProjectFactory(projectType: string) {
    switch (projectType) {
      case "git":
        return (dirData: FS.Dirent[], configs: ProjectsPropertiesConfig): boolean => dirData.find((c) => c.name === ".git") !== undefined;
      default:
        throw new Error(`Unknown project type: ${projectType}`);
    }
  }
  
  function getIcon(iconConfigs: CustomIcons[], path: string, isProject: boolean): vscode.Uri | vscode.ThemeIcon {
  
    function _getIcon(icon: string): vscode.Uri | vscode.ThemeIcon {
      return FS.existsSync(icon) ? vscode.Uri.parse(icon) : new vscode.ThemeIcon(icon);
    }
  
    let pathType = isProject ? 'project' : 'folder';
    for (const iconConfig of iconConfigs){
      const regex = new RegExp(iconConfig.matcher);
      if (regex.test(path) && pathType === iconConfig.applysTo) {
        return _getIcon(iconConfig.icon);
      }
    }
    // defaults
    // TODO: move this to settings
    if (isProject) {
      return _getIcon('git-branch');
    }
    return _getIcon('folder');
  }