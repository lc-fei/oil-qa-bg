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

// 图谱通用选项接口提供实体类型、关系类型等下拉数据。
export async function getGraphOptions() {
  const response = await request.get<ApiResponse<GraphOptions>>("/api/admin/graph/options");
  return response.data.data;
}

// 实体列表接口承载实体管理页的筛选、分页和表格展示。
export async function getEntityList(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<GraphPageResult<GraphEntityListItem>>>(
    "/api/admin/graph/entities",
    { params },
  );
  return response.data.data;
}

// 实体详情用于编辑回填和详情抽屉展示，包含列表中没有的扩展属性。
export async function getEntityDetail(id: string) {
  const response = await request.get<ApiResponse<GraphEntityDetail>>(
    `/api/admin/graph/entities/${id}`,
  );
  return response.data.data;
}

// 新增实体接口提交基础字段与扩展属性对象，实体 ID 由后端生成。
export async function createEntity(payload: Record<string, unknown>) {
  const response = await request.post<ApiResponse<{ id: string }>>(
    "/api/admin/graph/entities",
    payload,
  );
  return response.data.data;
}

// 更新实体接口按实体 ID 覆盖图谱节点资料，调用方负责保证属性 JSON 已解析。
export async function updateEntity(id: string, payload: Record<string, unknown>) {
  const response = await request.put<ApiResponse<{ id: string; updatedAt: string }>>(
    `/api/admin/graph/entities/${id}`,
    payload,
  );
  return response.data.data;
}

// 删除前校验接口用于判断实体是否仍存在关系引用，避免前端直接误删节点。
export async function deleteCheckEntity(id: string) {
  const response = await request.get<ApiResponse<GraphDeleteCheck>>(
    `/api/admin/graph/entities/${id}/delete-check`,
  );
  return response.data.data;
}

// 删除实体只在校验通过后调用，服务层保持单一删除职责。
export async function deleteEntity(id: string) {
  const response = await request.delete<ApiResponse<boolean>>(`/api/admin/graph/entities/${id}`);
  return response.data.data;
}

// 实体关联关系摘要用于详情抽屉展示节点周边关系和删除风险。
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

// 实体候选项接口服务于关系编辑和图谱可视化中的远程搜索下拉。
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

// 关系列表接口承载关系管理页的筛选、分页和表格展示。
export async function getRelationList(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<GraphPageResult<GraphRelationListItem>>>(
    "/api/admin/graph/relations",
    { params },
  );
  return response.data.data;
}

// 关系详情用于编辑时回填起点、终点、类型和扩展属性。
export async function getRelationDetail(id: string) {
  const response = await request.get<ApiResponse<GraphRelationDetail>>(
    `/api/admin/graph/relations/${id}`,
  );
  return response.data.data;
}

// 新增关系接口绑定起点实体、终点实体和关系类型。
export async function createRelation(payload: Record<string, unknown>) {
  const response = await request.post<ApiResponse<{ id: string }>>(
    "/api/admin/graph/relations",
    payload,
  );
  return response.data.data;
}

// 更新关系接口用于维护已有边的说明、状态和扩展属性。
export async function updateRelation(id: string, payload: Record<string, unknown>) {
  const response = await request.put<ApiResponse<boolean>>(
    `/api/admin/graph/relations/${id}`,
    payload,
  );
  return response.data.data;
}

// 删除关系是单边删除操作，不影响实体节点本身。
export async function deleteRelation(id: string) {
  const response = await request.delete<ApiResponse<boolean>>(
    `/api/admin/graph/relations/${id}`,
  );
  return response.data.data;
}

// 实体类型列表为实体录入、筛选和类型字典页提供标准枚举。
export async function getEntityTypeList(params: Record<string, unknown> = {}) {
  const response = await request.get<ApiResponse<GraphTypeItem[]>>(
    "/api/admin/graph/entity-types",
    { params },
  );
  return response.data.data;
}

// 新增实体类型用于扩展知识图谱节点分类体系。
export async function createEntityType(payload: Record<string, unknown>) {
  const response = await request.post<ApiResponse<boolean>>(
    "/api/admin/graph/entity-types",
    payload,
  );
  return response.data.data;
}

// 更新实体类型仅允许维护名称、描述、排序等元信息，编码通常由页面禁用编辑。
export async function updateEntityType(id: string | number, payload: Record<string, unknown>) {
  const response = await request.put<ApiResponse<boolean>>(
    `/api/admin/graph/entity-types/${id}`,
    payload,
  );
  return response.data.data;
}

// 实体类型启停使用独立接口，避免状态开关误覆盖其他类型配置。
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

// 关系类型列表为关系录入、筛选和类型字典页提供标准枚举。
export async function getRelationTypeList(params: Record<string, unknown> = {}) {
  const response = await request.get<ApiResponse<GraphTypeItem[]>>(
    "/api/admin/graph/relation-types",
    { params },
  );
  return response.data.data;
}

// 新增关系类型用于扩展知识图谱边语义。
export async function createRelationType(payload: Record<string, unknown>) {
  const response = await request.post<ApiResponse<boolean>>(
    "/api/admin/graph/relation-types",
    payload,
  );
  return response.data.data;
}

// 更新关系类型维护边类型的展示名称、说明和排序。
export async function updateRelationType(id: string | number, payload: Record<string, unknown>) {
  const response = await request.put<ApiResponse<boolean>>(
    `/api/admin/graph/relation-types/${id}`,
    payload,
  );
  return response.data.data;
}

// 关系类型启停使用独立接口，便于类型字典页即时切换状态。
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

// 图谱导入必须提交 FormData，调用方负责把文件放入后端要求的 file 字段。
export async function importGraphData(payload: FormData) {
  const response = await request.post<ApiResponse<{ taskId: number }>>(
    "/api/admin/graph/import",
    payload,
  );
  return response.data.data;
}

// 导入任务列表用于追踪批量导入的成功数、失败数和完成状态。
export async function getImportTaskList(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<GraphPageResult<GraphImportTask>>>(
    "/api/admin/graph/import/tasks",
    { params },
  );
  return response.data.data;
}

// 导入任务详情用于查看失败行原因，支撑管理员修正 CSV 后重新导入。
export async function getImportTaskDetail(taskId: number) {
  const response = await request.get<ApiResponse<GraphImportTaskDetail>>(
    `/api/admin/graph/import/tasks/${taskId}`,
  );
  return response.data.data;
}

// 版本列表用于记录导入批次或人工维护形成的阶段性图谱版本。
export async function getVersionList(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<GraphPageResult<GraphVersionItem>>>(
    "/api/admin/graph/versions",
    { params },
  );
  return response.data.data;
}

// 版本详情用于展示版本说明、创建人和创建时间等审计信息。
export async function getVersionDetail(id: number) {
  const response = await request.get<ApiResponse<GraphVersionItem>>(
    `/api/admin/graph/versions/${id}`,
  );
  return response.data.data;
}

// 手动创建版本记录用于补充批量导入之外的治理变更说明。
export async function createVersion(payload: Record<string, unknown>) {
  const response = await request.post<ApiResponse<boolean>>(
    "/api/admin/graph/versions",
    payload,
  );
  return response.data.data;
}

// 可视化接口按中心实体、类型和层级拉取子图数据。
export async function getVisualization(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<GraphVisualizationData>>(
    "/api/admin/graph/visualization",
    { params },
  );
  return response.data.data;
}

// 路径查询接口根据起点和终点实体生成可高亮展示的关系路径。
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

  // Blob 下载需要临时创建对象 URL，点击后立即释放，避免浏览器内存泄漏。
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

// 实体导出沿用下载封装，保证筛选参数和鉴权头同时生效。
export async function exportEntityData(params: Record<string, unknown>) {
  await downloadFile(
    "/api/admin/graph/export/entities",
    params,
    "图谱实体数据.xlsx",
  );
}

// 关系导出沿用下载封装，避免使用普通 a 标签导致 token 丢失。
export async function exportRelationData(params: Record<string, unknown>) {
  await downloadFile(
    "/api/admin/graph/export/relations",
    params,
    "图谱关系数据.xlsx",
  );
}
