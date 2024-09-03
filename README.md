# Projects Browser

VS Code extension to show all your projects in a dedicated side bar. Inspired from:

- [Repositories](https://marketplace.visualstudio.com/items?itemName=mohitsingh.repo)
- [Project Manager](https://marketplace.visualstudio.com/items?itemName=alefragnani.project-manager)

## Features

- Define via [settings](#extension-settings) a list of folders to scan for projects
- Supports [different](#supported-projects-types) type of projects
- Display found projects in a tree view
- Customize the icons used to display folders and projects
- Add selected projects to a dedicated favorites subview
- Open projects in current window or new window

## Supported projects types

- Git: identified by presence of `.git` folder inside project folder
- VS Code: identified by presence of `.vscode` folder inside project folder
- Idea: identified by presence of `.idea` folder inside project folder

## Extension Settings

| Command                                  | Description                                                                                    | Default Value        |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------- |
| `projectsBrowser.defaultProjectIcon`     | Default icon to use for projects                                                               | Codicon `git-branch` |
| `projectsBrowser.defaultFolderIcon`      | Default icon to use for folders                                                                | Codicon `folder`     |
| `projectsBrowser.promptOpenConfirmation` | Confermation pop up when opening in current window                                             | `true`               |
| `projectsBrowser.rootFolders`            | Configuration Json for folders in which to look for projects, see section for complete example | `[]`                 |

### Projects Folders

Projects folders need to be configured via `settings.json` and have the following structure:

```json
{
  "projectsBrowser.rootFolders": [
    {
      "rootFolder": "path/to/projects/root",
      "recurseAfterFirstHit": false,
      "maxDepth": 1,
      "projectsType": "git|vscode|idea",
      "customIcons": [
        {
          "matcher": "regex to match, applys to full path",
          "icon": "icon codicon name or path to custom icon",
          "applysTo": "folder|project"
        }
      ]
    }
  ]
}
```

## Release Notes

### 0.0.1

Initial release
