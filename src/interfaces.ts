
export interface ProjectsPropertiesConfig {
    maxDepth?: number; 
    customIcons?: CustomIcons[]; 
    recurseAfterFirstHit?: boolean 
    projectsType?: string
  }
  
export interface CustomIcons {
    matcher: string;
    icon: string;
    applysTo: string;
  }
  
export interface ProjectsConfig extends ProjectsPropertiesConfig {
    rootFolder: string;
  }

export interface NodeItemObject {
  label: string;
  tooltip: string;
  isProject: boolean;
  icon: {
    path: string;
    isCodicon: boolean;
  }
}
