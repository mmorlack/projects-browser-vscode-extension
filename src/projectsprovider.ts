import * as vscode from 'vscode';
import * as fs from 'fs';
import { ProjectsConfig } from './interfaces';
import { ProjectTreeItem } from './common';
import { pruneTree, readDirData } from './utils';

export class ProjectsDataProvider implements vscode.TreeDataProvider<ProjectTreeItem> {
  public treeData: ProjectTreeItem[] = [];
  public projectsData: ProjectTreeItem[] = [];

  constructor() {
    this.treeData = this.getTreeData();
  }

  private _onDidChangeTreeData: vscode.EventEmitter<ProjectTreeItem | undefined | null | void> =
    new vscode.EventEmitter<ProjectTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ProjectTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

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
    let configs = vscode.workspace.getConfiguration('projectsBrowser');
    let projectsRoots: ProjectsConfig[] = configs.get('rootFolders') || [];
    let globalIgnore: string[] = configs.get('globalIgnore') || [];
    let projects = [];
    for (var projectConfig of projectsRoots) {
      const { rootFolder, ...configs } = projectConfig;
      configs.ignore = (configs.ignore || []).concat(globalIgnore);
      console.log(`Retrieving data from folder ${rootFolder}`);
      if (fs.existsSync(rootFolder)) {
        let projectList: ProjectTreeItem[] = [];
        let nodeTree = readDirData(rootFolder, 0, projectList, configs);
        this.projectsData.push(...projectList);
        let prunedNodeTree = pruneTree(
          nodeTree,
          projectList.map((r) => r.label),
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
