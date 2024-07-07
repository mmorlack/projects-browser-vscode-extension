import * as vscode from "vscode";
import * as fs from "fs";
import * as PATH from "path";
import { CustomIcons, ProjectsConfig, ProjectsPropertiesConfig } from "./interfaces";
import { ProjectTreeItem } from "./common";

export class ProjectsDataProvider implements vscode.TreeDataProvider<ProjectTreeItem> {
    private treeData: ProjectTreeItem[];
  
    constructor() {
      this.treeData = this.getTreeData();
    }
  
    private _onDidChangeTreeData: vscode.EventEmitter<ProjectTreeItem | undefined | null | void> = 
      new vscode.EventEmitter<ProjectTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ProjectTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;
  
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
  
    getTreeData(): ProjectTreeItem[] {
      let projectsRoots = vscode.workspace.getConfiguration("projectsBrowser").get("rootFolders") as ProjectsConfig[];
      let projects = [];
      for (var projectConfig of projectsRoots) {
        const {rootFolder, ...configs} = projectConfig;
        console.log(`Retrieving data from folder ${rootFolder}`);
        if (fs.existsSync(rootFolder)) {
          let repoList: ProjectTreeItem[] = [];
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
  
    getTreeItem(element: ProjectTreeItem): vscode.TreeItem {
      return element;
    }
  
    getChildren(element?: ProjectTreeItem): Thenable<ProjectTreeItem[]> {
      if (element) {
        return Promise.resolve(element.children);
      } else {
        return Promise.resolve(this.treeData);
      }
    }
  }

  function readDirData(
    path: string,
    currentDepth: number = 0,
    repoList: ProjectTreeItem[],
    configs: ProjectsPropertiesConfig
  ): ProjectTreeItem {
    let dirData = safeReadDirSync(path);
    let isProject = isProjectFactory(configs.projectsType || 'git')(dirData, configs);
    //let icon = getIcon(configs.customIcons || [], path, isProject);
    let item = new ProjectTreeItem(PATH.basename(path), path, isProject, configs.customIcons || []);
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
  
  function safeReadDirSync(path: string): fs.Dirent[] {
    try {
      let dirData = fs.readdirSync(path, { withFileTypes: true }).filter((i) => i.isDirectory());
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
  
  function pruneTree(root: ProjectTreeItem, nodeNames: string[]): ProjectTreeItem | null {
    function shouldKeepNode(node: ProjectTreeItem): boolean {
      if (!node.children) {
        return false;
      }
      node.children = node.children.map((child) => pruneTree(child, nodeNames)).filter(Boolean) as ProjectTreeItem[];
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
        return (dirData: fs.Dirent[], configs: ProjectsPropertiesConfig): boolean => 
          dirData.find((c) => c.name === ".git") !== undefined;
      case "vscode":
        return (dirData: fs.Dirent[], configs: ProjectsPropertiesConfig): boolean => 
          dirData.find((c) => c.name === ".vscode") !== undefined;
      case "idea":
        return (dirData: fs.Dirent[], configs: ProjectsPropertiesConfig): boolean => 
          dirData.find((c) => c.name === ".idea") !== undefined;
      default:
        throw new Error(`Unknown project type: ${projectType}`);
    }
  }
