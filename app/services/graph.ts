import type { ApiResponse } from "../types/auth";
import type {
  GraphDeleteCheck,
  GraphEntityDetail,
  GraphEntityListItem,
  GraphEntityOption,
  GraphEntityRelationSummary,
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
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
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

export function buildGraphTemplateUrl(templateType: "entity" | "relation") {
  const base = import.meta.env.VITE_API_BASE_URL ?? "";
  return `${base}/api/admin/graph/import/template?templateType=${templateType}`;
}

export function buildEntityExportUrl(params: Record<string, unknown>) {
  const base = import.meta.env.VITE_API_BASE_URL ?? "";
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });
  return `${base}/api/admin/graph/export/entities?${query.toString()}`;
}

export function buildRelationExportUrl(params: Record<string, unknown>) {
  const base = import.meta.env.VITE_API_BASE_URL ?? "";
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });
  return `${base}/api/admin/graph/export/relations?${query.toString()}`;
}
