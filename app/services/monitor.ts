import type { ApiResponse } from "../types/auth";
import type {
  ExceptionLogDetail,
  ExceptionLogItem,
  ExceptionSummary,
  MonitorAiCallDetail,
  MonitorGraphRetrievalDetail,
  MonitorNlpDetail,
  MonitorOverview,
  MonitorPageResult,
  MonitorPerformance,
  MonitorPromptDetail,
  MonitorRequestDetail,
  MonitorRequestItem,
  MonitorTimingsDetail,
  MonitorTopQuestion,
  MonitorTrendPoint,
} from "../types/monitor";
import { request } from "./request";

// 监控总览接口用于填充运行监控页顶部指标卡。
export async function getMonitorOverview(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<MonitorOverview>>("/api/admin/monitor/overview", { params });
  return response.data.data;
}

// 请求列表是监控页面的主表格数据源，支持条件筛选和分页。
export async function getMonitorRequests(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<MonitorPageResult<MonitorRequestItem>>>("/api/admin/monitor/requests", { params });
  return response.data.data;
}

// 详情接口作为链路抽屉的主入口，返回基础请求信息。
export async function getMonitorRequestDetail(requestId: string) {
  const response = await request.get<ApiResponse<MonitorRequestDetail>>(`/api/admin/monitor/requests/${requestId}`);
  return response.data.data;
}

// NLP、图谱、Prompt、AI、耗时接口分别对应链路详情里的分区展示。
export async function getMonitorNlpDetail(requestId: string) {
  const response = await request.get<ApiResponse<MonitorNlpDetail>>(`/api/admin/monitor/requests/${requestId}/nlp`);
  return response.data.data;
}

export async function getMonitorGraphDetail(requestId: string) {
  const response = await request.get<ApiResponse<MonitorGraphRetrievalDetail>>(`/api/admin/monitor/requests/${requestId}/graph-retrieval`);
  return response.data.data;
}

export async function getMonitorPromptDetail(requestId: string) {
  // 监控页默认直接拉取完整 Prompt，便于链路详情抽屉一次展开查看。
  const response = await request.get<ApiResponse<MonitorPromptDetail>>(`/api/admin/monitor/requests/${requestId}/prompt`, {
    params: { includeFullText: 1 },
  });
  return response.data.data;
}

export async function getMonitorAiDetail(requestId: string) {
  const response = await request.get<ApiResponse<MonitorAiCallDetail>>(`/api/admin/monitor/requests/${requestId}/ai-call`);
  return response.data.data;
}

export async function getMonitorTimings(requestId: string) {
  const response = await request.get<ApiResponse<MonitorTimingsDetail>>(`/api/admin/monitor/requests/${requestId}/timings`);
  return response.data.data;
}

export async function getMonitorTrend(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<MonitorTrendPoint[]>>("/api/admin/monitor/statistics/trend", { params });
  return response.data.data;
}

// 高频问题和性能统计用于监控页的分析卡片区域。
export async function getMonitorTopQuestions(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<MonitorTopQuestion[]>>("/api/admin/monitor/statistics/top-questions", { params });
  return response.data.data;
}

export async function getMonitorPerformance(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<MonitorPerformance>>("/api/admin/monitor/statistics/performance", { params });
  return response.data.data;
}

export async function getExceptionSummary(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<ExceptionSummary>>("/api/admin/exception-logs/summary", { params });
  return response.data.data;
}

// 异常日志虽然被合并到监控页展示，但后端仍保持独立模块接口。
export async function getExceptionLogs(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<MonitorPageResult<ExceptionLogItem>>>("/api/admin/exception-logs", { params });
  return response.data.data;
}

export async function getExceptionDetail(exceptionId: string) {
  const response = await request.get<ApiResponse<ExceptionLogDetail>>(`/api/admin/exception-logs/${exceptionId}`);
  return response.data.data;
}

export async function updateExceptionHandleStatus(exceptionId: string, payload: { handleStatus: string; handleRemark?: string }) {
  const response = await request.put<ApiResponse<boolean>>(`/api/admin/exception-logs/${exceptionId}/handle-status`, payload);
  return response.data.data;
}

// 批量处理接口服务于表格勾选多条异常后的统一处理动作。
export async function batchUpdateExceptionHandleStatus(payload: { exceptionIds: string[]; handleStatus: string; handleRemark?: string }) {
  const response = await request.post<ApiResponse<{ successCount: number; failCount: number }>>("/api/admin/exception-logs/batch-handle-status", payload);
  return response.data.data;
}
