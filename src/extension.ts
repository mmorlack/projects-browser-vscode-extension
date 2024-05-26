import * as vscode from "vscode";
import * as FS from "fs";
import * as PATH from "path";

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log("Extension project-browser active");

  vscode.commands.registerCommand(
    'projectsBrowser.openInNewWindow',
    async (repo: NodeItem) => {
      if (repo) {
        await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(repo.location) , true);
      }
    }
  );

  const projectsDataProvider = new ProjectsDataProvider("/home/matteo/coding");
  vscode.window.registerTreeDataProvider("projectsBrowser", projectsDataProvider);

  vscode.commands.registerCommand('projectsBrowser.refresh', () =>
    projectsDataProvider.refresh()
  );

  vscode.commands.registerCommand('projectsBrowser.filter', async () => {
      const query = await vscode.window.showInputBox({ placeHolder: 'Type to filter' });
      projectsDataProvider.filter(query);
  });
  
}

// This method is called when your extension is deactivated
export function deactivate() {}

export class ProjectsDataProvider implements vscode.TreeDataProvider<NodeItem> {
  private treeData: NodeItem[];

  constructor(private projectsRoots: string) {
    this.projectsRoots = projectsRoots;
    this.treeData = this.getTreeData();
  }

  private _onDidChangeTreeData: vscode.EventEmitter<NodeItem | undefined | null | void> = new vscode.EventEmitter<NodeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<NodeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this.treeData = this.getTreeData();
    this._onDidChangeTreeData.fire();
  }

  filter(query: string | undefined) {
    if (query) {
      let filteredNodeTree = pruneTree(this.treeData[0], [query]);
      this.treeData = filteredNodeTree? [filteredNodeTree] : [];
    }
    this._onDidChangeTreeData.fire();
  }

  getTreeData(): NodeItem[] {
    console.log(`Retrieving data from folder ${this.projectsRoots}`);
    if (FS.existsSync(this.projectsRoots)) {
      let repoList: NodeItem[] = [];
      let nodeTree = readDirData(this.projectsRoots, 4, 0, repoList);
      let prunedNodeTree = pruneTree(nodeTree, repoList.map((r) => r.label));
      return prunedNodeTree ? [prunedNodeTree] : [];
    } else {
      return [];
    }
  };

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


class NodeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public location: string,
    public isRepo: boolean = false,
    public children: NodeItem[] = [],
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed,
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.location}`;
    this.iconPath = new vscode.ThemeIcon(!this.isRepo ? "folder" : "git-branch");
    this.contextValue = this.isRepo ? 'repository' : 'folder';
  }
}


function readDirData(path: string, maxDepth: number, currentDepth: number = 0, repoList: NodeItem[]): NodeItem {
  let dirData = safeReadDirSync(path);
  let item = new NodeItem(PATH.basename(path), path, dirData.find((c) => c.name === '.git') !== undefined);
  if (item.isRepo) {
    repoList.push(item);
  }
  if (maxDepth > currentDepth + 1 && !item.isRepo) {
    item.children = dirData.map(child => readDirData(PATH.join(child.path, child.name), maxDepth, currentDepth + 1, repoList));
  }
  return item;
}

function safeReadDirSync(path: string): FS.Dirent[] {
  try {
    let dirData = FS.readdirSync(path, {withFileTypes: true}).filter(i => i.isDirectory());
    return dirData;
  } catch(ex: any) {
    if (ex.code === "EACCES" || ex.code === "EPERM") {
      //User does not have permissions, ignore directory
      return [];
    }
    else {
      throw ex;
    }
  }
}

function pruneTree(root: NodeItem, nodeNames: string[]): NodeItem | null {
  function shouldKeepNode(node: NodeItem): boolean {
    if (!node.children) {
      return false;
    }
    node.children = node.children.map(child => pruneTree(child, nodeNames)).filter(Boolean) as NodeItem[];
    if (node.children.length === 0) {
      return nodeNames.includes(node.label);
    }
    return true;
  }
  return shouldKeepNode(root) ? root : null;
}