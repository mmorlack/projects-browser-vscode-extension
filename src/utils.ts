import * as vscode from 'vscode';
import * as fs from 'fs';
import { CustomIcons, ProjectsPropertiesConfig } from './interfaces';
import { ProjectTreeItem } from './common';
import * as PATH from 'path';

export async function openProject(path: string, newWindow: boolean) {
  await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(path), newWindow);
}

export function isProjectFactory(projectType: string) {
  switch (projectType) {
    case 'git':
      return (dirData: fs.Dirent[], configs: ProjectsPropertiesConfig): boolean =>
        dirData.find((c) => c.name === '.git') !== undefined;
    case 'vscode':
      return (dirData: fs.Dirent[], configs: ProjectsPropertiesConfig): boolean =>
        dirData.find((c) => c.name === '.vscode') !== undefined;
    case 'idea':
      return (dirData: fs.Dirent[], configs: ProjectsPropertiesConfig): boolean =>
        dirData.find((c) => c.name === '.idea') !== undefined;
    default:
      throw new Error(`Unknown project type: ${projectType}`);
      console.log('test');
  }
}

export function readDirData(
  path: string,
  currentDepth: number = 0,
  projectList: ProjectTreeItem[],
  configs: ProjectsPropertiesConfig,
): ProjectTreeItem {
  let dirData = safeReadDirSync(path).filter(
    (p) => !configs.ignore?.some((matcher) => RegExp(matcher).test(PATH.join(p.path, p.name))),
  );
  let isProject = isProjectFactory(configs.projectsType || 'git')(dirData, configs);
  let iconPath = getIcon(path, configs.customIcons || [], isProject);
  let item = new ProjectTreeItem(PATH.basename(path), path, isProject, iconPath);
  if (item.isProject) {
    projectList.push(item);
    if (!configs.recurseAfterFirstHit) {
      return item;
    }
  }
  if ((configs.maxDepth || 4) > currentDepth + 1) {
    item.children = dirData.map((child) =>
      readDirData(PATH.join(child.path, child.name), currentDepth + 1, projectList, configs),
    );
  }
  return item;
}

export function safeReadDirSync(path: string): fs.Dirent[] {
  try {
    let dirData = fs.readdirSync(path, { withFileTypes: true }).filter((i) => i.isDirectory());
    return dirData;
  } catch (ex: any) {
    if (ex.code === 'EACCES' || ex.code === 'EPERM') {
      //User does not have permissions, ignore directory
      return [];
    } else {
      throw ex;
    }
  }
}

export function pruneTree(root: ProjectTreeItem, nodeNames: string[]): ProjectTreeItem | null {
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

export function getIcon(path: string, iconConfigs: CustomIcons[], isProject: boolean) {
  const configs = vscode.workspace.getConfiguration('projectsBrowser');

  function _getIcon(icon: string): vscode.Uri | vscode.ThemeIcon {
    return fs.existsSync(icon) ? vscode.Uri.parse(icon) : new vscode.ThemeIcon(icon);
  }

  let pathType = isProject ? 'project' : 'folder';
  for (const iconConfig of iconConfigs) {
    const regex = new RegExp(iconConfig.matcher);
    if (regex.test(path) && pathType === iconConfig.applysTo) {
      return _getIcon(iconConfig.icon);
    }
  }
  return isProject
    ? _getIcon(configs.get('defaultProjectIcon', 'git-branch'))
    : _getIcon(configs.get('defaultFolderIcon', 'folder'));
}
