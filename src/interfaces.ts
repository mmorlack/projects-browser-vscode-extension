
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