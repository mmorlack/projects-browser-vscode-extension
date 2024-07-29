import * as vscode from "vscode";
import * as fs from "fs";
import * as PATH from "path";
import { ProjectsConfig, ProjectsPropertiesConfig } from "./interfaces";
import { ProjectTreeItem } from "./common";
import { isProjectFactory, pruneTree, readDirData } from "./utils";

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
          let projectList: ProjectTreeItem[] = [];
          let nodeTree = readDirData(rootFolder, 0, projectList, configs);
          let prunedNodeTree = pruneTree(
            nodeTree,
            projectList.map((r) => r.label)
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
