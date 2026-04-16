export interface GraphPageResult<T> {
  list: T[];
  pageNum: number;
  pageSize: number;
  total: number;
}

export interface GraphOptionItem {
  value: string;
  label: string;
}

export interface GraphEntityListItem {
  id: string;
  name: string;
  typeCode: string;
  typeName: string;
  description: string;
  source: string;
  status: number;
  relationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GraphEntityDetail extends GraphEntityListItem {
  properties: Record<string, string>;
  createdBy?: string;
}

export interface GraphEntityRelationSummary {
  id: string;
  relationTypeCode: string;
  relationTypeName: string;
  sourceEntityId: string;
  sourceEntityName: string;
  targetEntityId: string;
  targetEntityName: string;
  description: string;
  status?: number;
  updatedAt?: string;
}

export interface GraphDeleteCheck {
  canDelete: boolean;
  relationCount: number;
  message: string;
}

export interface GraphRelationListItem {
  id: string;
  relationTypeCode: string;
  relationTypeName: string;
  sourceEntityId: string;
  sourceEntityName: string;
  targetEntityId: string;
  targetEntityName: string;
  description: string;
  status: number;
  updatedAt: string;
}

export interface GraphRelationDetail extends GraphRelationListItem {
  properties: Record<string, string>;
}

export interface GraphTypeItem {
  id: number | string;
  typeCode: string;
  typeName: string;
  description: string;
  status: number;
  sortNo?: number;
  createdAt?: string;
}

export interface GraphOptions {
  entityTypes: GraphOptionItem[];
  relationTypes: GraphOptionItem[];
}

export interface GraphEntityOption {
  value: string;
  label: string;
  typeCode: string;
  typeName: string;
}

export interface GraphImportTask {
  taskId: number;
  importType: string;
  fileName: string;
  status: string;
  totalCount?: number;
  successCount?: number;
  failCount?: number;
  versionNo?: string;
  createdBy?: string;
  createdAt: string;
  finishedAt?: string | null;
}

export interface GraphImportTaskDetail extends GraphImportTask {
  errorRows: Array<{
    rowNum: number;
    reason: string;
  }>;
}

export interface GraphVersionItem {
  id: number;
  versionNo: string;
  versionRemark: string;
  createdBy: string;
  createdAt: string;
}

export interface GraphVisualizationNode {
  id: string;
  name: string;
  typeCode: string;
  typeName: string;
  status: number;
  properties: Record<string, string>;
}

export interface GraphVisualizationEdge {
  id: string;
  source: string;
  target: string;
  relationTypeCode: string;
  relationTypeName: string;
  description: string;
}

export interface GraphVisualizationData {
  centerEntityId: string;
  nodes: GraphVisualizationNode[];
  edges: GraphVisualizationEdge[];
}

export interface GraphPathData {
  nodes: GraphVisualizationNode[];
  edges: GraphVisualizationEdge[];
}
