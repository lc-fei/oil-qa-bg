import type { ApiResponse } from "../types/auth";
import type {
  GraphDeleteCheck,
  GraphEntityDetail,
  GraphEntityListItem,
  GraphEntityOption,
  GraphEntityRelationSummary,
  GraphImportType,
  GraphImportTask,
  GraphImportTaskDetail,
  GraphOptions,
  GraphPageResult,
  GraphPathData,
  GraphRelationDetail,
  GraphRelationListItem,
  GraphTypeItem,
  GraphVersionItem,
  GraphVisualizationData,
} from "../types/graph";
import { request } from "./request";

export async function getGraphOptions() {
  const response = await request.get<ApiResponse<GraphOptions>>("/api/admin/graph/options");
  return response.data.data;
}

export async function getEntityList(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<GraphPageResult<GraphEntityListItem>>>(
    "/api/admin/graph/entities",
    { params },
  );
  return response.data.data;
}

export async function getEntityDetail(id: string) {
  const response = await request.get<ApiResponse<GraphEntityDetail>>(
    `/api/admin/graph/entities/${id}`,
  );
  return response.data.data;
}

export async function createEntity(payload: Record<string, unknown>) {
  const response = await request.post<ApiResponse<{ id: string }>>(
    "/api/admin/graph/entities",
    payload,
  );
  return response.data.data;
}

export async function updateEntity(id: string, payload: Record<string, unknown>) {
  const response = await request.put<ApiResponse<{ id: string; updatedAt: string }>>(
    `/api/admin/graph/entities/${id}`,
    payload,
  );
  return response.data.data;
}

export async function deleteCheckEntity(id: string) {
  const response = await request.get<ApiResponse<GraphDeleteCheck>>(
    `/api/admin/graph/entities/${id}/delete-check`,
  );
  return response.data.data;
}

export async function deleteEntity(id: string) {
  const response = await request.delete<ApiResponse<boolean>>(`/api/admin/graph/entities/${id}`);
  return response.data.data;
}

export async function getEntityRelations(
  id: string,
  params: { direction?: string; pageNum?: number; pageSize?: number } = {},
) {
  const response = await request.get<ApiResponse<GraphPageResult<GraphEntityRelationSummary>>>(
    `/api/admin/graph/entities/${id}/relations`,
    { params },
  );
  return response.data.data;
}

export async function getEntityOptions(params: {
  keyword: string;
  typeCode?: string;
  limit?: number;
}) {
  const response = await request.get<ApiResponse<GraphEntityOption[]>>(
    "/api/admin/graph/entities/options",
    { params },
  );
  return response.data.data;
}

export async function getRelationList(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<GraphPageResult<GraphRelationListItem>>>(
    "/api/admin/graph/relations",
    { params },
  );
  return response.data.data;
}

export async function getRelationDetail(id: string) {
  const response = await request.get<ApiResponse<GraphRelationDetail>>(
    `/api/admin/graph/relations/${id}`,
  );
  return response.data.data;
}

export async function createRelation(payload: Record<string, unknown>) {
  const response = await request.post<ApiResponse<{ id: string }>>(
    "/api/admin/graph/relations",
    payload,
  );
  return response.data.data;
}

export async function updateRelation(id: string, payload: Record<string, unknown>) {
  const response = await request.put<ApiResponse<boolean>>(
    `/api/admin/graph/relations/${id}`,
    payload,
  );
  return response.data.data;
}

export async function deleteRelation(id: string) {
  const response = await request.delete<ApiResponse<boolean>>(
    `/api/admin/graph/relations/${id}`,
  );
  return response.data.data;
}

export async function getEntityTypeList(params: Record<string, unknown> = {}) {
  const response = await request.get<ApiResponse<GraphTypeItem[]>>(
    "/api/admin/graph/entity-types",
    { params },
  );
  return response.data.data;
}

export async function createEntityType(payload: Record<string, unknown>) {
  const response = await request.post<ApiResponse<boolean>>(
    "/api/admin/graph/entity-types",
    payload,
  );
  return response.data.data;
}

export async function updateEntityType(id: string | number, payload: Record<string, unknown>) {
  const response = await request.put<ApiResponse<boolean>>(
    `/api/admin/graph/entity-types/${id}`,
    payload,
  );
  return response.data.data;
}

export async function updateEntityTypeStatus(
  id: string | number,
  payload: { status: number },
) {
  const response = await request.put<ApiResponse<boolean>>(
    `/api/admin/graph/entity-types/${id}/status`,
    payload,
  );
  return response.data.data;
}

export async function getRelationTypeList(params: Record<string, unknown> = {}) {
  const response = await request.get<ApiResponse<GraphTypeItem[]>>(
    "/api/admin/graph/relation-types",
    { params },
  );
  return response.data.data;
}

export async function createRelationType(payload: Record<string, unknown>) {
  const response = await request.post<ApiResponse<boolean>>(
    "/api/admin/graph/relation-types",
    payload,
  );
  return response.data.data;
}

export async function updateRelationType(id: string | number, payload: Record<string, unknown>) {
  const response = await request.put<ApiResponse<boolean>>(
    `/api/admin/graph/relation-types/${id}`,
    payload,
  );
  return response.data.data;
}

export async function updateRelationTypeStatus(
  id: string | number,
  payload: { status: number },
) {
  const response = await request.put<ApiResponse<boolean>>(
    `/api/admin/graph/relation-types/${id}/status`,
    payload,
  );
  return response.data.data;
}

export async function importGraphData(payload: FormData) {
  const response = await request.post<ApiResponse<{ taskId: number }>>(
    "/api/admin/graph/import",
    payload,
  );
  return response.data.data;
}

export async function getImportTaskList(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<GraphPageResult<GraphImportTask>>>(
    "/api/admin/graph/import/tasks",
    { params },
  );
  return response.data.data;
}

export async function getImportTaskDetail(taskId: number) {
  const response = await request.get<ApiResponse<GraphImportTaskDetail>>(
    `/api/admin/graph/import/tasks/${taskId}`,
  );
  return response.data.data;
}

export async function getVersionList(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<GraphPageResult<GraphVersionItem>>>(
    "/api/admin/graph/versions",
    { params },
  );
  return response.data.data;
}

export async function getVersionDetail(id: number) {
  const response = await request.get<ApiResponse<GraphVersionItem>>(
    `/api/admin/graph/versions/${id}`,
  );
  return response.data.data;
}

export async function createVersion(payload: Record<string, unknown>) {
  const response = await request.post<ApiResponse<boolean>>(
    "/api/admin/graph/versions",
    payload,
  );
  return response.data.data;
}

export async function getVisualization(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<GraphVisualizationData>>(
    "/api/admin/graph/visualization",
    { params },
  );
  return response.data.data;
}

export async function getPathData(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<GraphPathData>>(
    "/api/admin/graph/path",
    { params },
  );
  return response.data.data;
}

// 下载接口必须走 axios 实例，确保 Authorization 请求头由拦截器统一注入。
async function downloadFile(
  url: string,
  params: Record<string, unknown>,
  fallbackFilename: string,
) {
  const response = await request.get<Blob>(url, {
    params,
    responseType: "blob",
  });
  const disposition = response.headers["content-disposition"];
  const filename = resolveDownloadFilename(disposition, fallbackFilename);
  const objectUrl = window.URL.createObjectURL(response.data);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(objectUrl);
}

// 后端可能通过 Content-Disposition 返回中文文件名，这里兼容 filename* 和 filename 两种格式。
function resolveDownloadFilename(disposition: string | undefined, fallbackFilename: string) {
  if (!disposition) {
    return fallbackFilename;
  }

  const utf8Filename = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plainFilename = disposition.match(/filename="?([^";]+)"?/i)?.[1];

  try {
    return decodeURIComponent(utf8Filename || plainFilename || fallbackFilename);
  } catch {
    return utf8Filename || plainFilename || fallbackFilename;
  }
}

export async function downloadGraphTemplate(templateType: GraphImportType) {
  // 模板类型与文件名保持一处映射，避免实体/关系模板入口写散。
  const templateFilenameMap = {
    entity: "实体导入模板.csv",
    relation: "关系导入模板.csv",
  };

  await downloadFile(
    "/api/admin/graph/import/template",
    { templateType },
    templateFilenameMap[templateType],
  );
}

export async function exportEntityData(params: Record<string, unknown>) {
  await downloadFile(
    "/api/admin/graph/export/entities",
    params,
    "图谱实体数据.xlsx",
  );
}

export async function exportRelationData(params: Record<string, unknown>) {
  await downloadFile(
    "/api/admin/graph/export/relations",
    params,
    "图谱关系数据.xlsx",
  );
}
