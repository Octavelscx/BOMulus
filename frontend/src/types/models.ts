export interface Comparison {
  v1: string;
  v2: string;
}

export interface WorkspaceInfos {
  name: string;
  path: string;
  createdAt: string;
  last_opened: string;
  production_quantity: string;
  last_comparison: Comparison;
}

export interface Workspace {
  workspace_infos: WorkspaceInfos;
}

export interface APIKeys {
  mouser_api_key: string;
  bomulus_api_key: string;
  dk_client_id: string;
  dk_secret: string;
}

export type FileInfo = any;
export type Component = any;
export type AnalysisStatus = any;
export type PriceCalculationResult = any;
export type Designator = any;
