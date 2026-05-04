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
  MonitorWorkflowDetail,
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
  // NLP 详情用于展示意图识别、实体抽取等问答前置处理结果。
  const response = await request.get<ApiResponse<MonitorNlpDetail>>(`/api/admin/monitor/requests/${requestId}/nlp`);
  return response.data.data;
}

export async function getMonitorGraphDetail(requestId: string) {
  // 图谱检索详情用于分析召回节点、边以及命中情况。
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
  // AI 调用详情用于排查模型耗时、返回状态和错误信息。
  const response = await request.get<ApiResponse<MonitorAiCallDetail>>(`/api/admin/monitor/requests/${requestId}/ai-call`);
  return response.data.data;
}

export async function getMonitorTimings(requestId: string) {
  // 耗时拆解接口用于把一次问答请求拆成多个阶段分析瓶颈。
  const response = await request.get<ApiResponse<MonitorTimingsDetail>>(`/api/admin/monitor/requests/${requestId}/timings`);
  return response.data.data;
}

export async function getMonitorWorkflowDetail(requestId: string) {
  // AI 编排轨迹来自 qa_orchestration_trace，用于补充传统链路监控看不到的编排阶段和工具调用。
  const response = await request.get<ApiResponse<MonitorWorkflowDetail>>(`/api/admin/monitor/requests/${requestId}/workflow`);
  return response.data.data;
}

export async function getMonitorTrend(params: Record<string, unknown>) {
  // 趋势接口按日期粒度返回统计点，用于页面自绘简化柱状图。
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
  // 异常摘要用于监控页右侧统计区，和异常列表筛选条件保持一致。
  const response = await request.get<ApiResponse<ExceptionSummary>>("/api/admin/exception-logs/summary", { params });
  return response.data.data;
}

// 异常日志虽然被合并到监控页展示，但后端仍保持独立模块接口。
export async function getExceptionLogs(params: Record<string, unknown>) {
  const response = await request.get<ApiResponse<MonitorPageResult<ExceptionLogItem>>>("/api/admin/exception-logs", { params });
  return response.data.data;
}

export async function getExceptionDetail(exceptionId: string) {
  // 异常详情按需加载堆栈和处理记录，避免列表接口返回过大文本。
  const response = await request.get<ApiResponse<ExceptionLogDetail>>(`/api/admin/exception-logs/${exceptionId}`);
  return response.data.data;
}

export async function updateExceptionHandleStatus(exceptionId: string, payload: { handleStatus: string; handleRemark?: string }) {
  // 单条处理接口用于详情抽屉内更新异常闭环状态和备注。
  const response = await request.put<ApiResponse<boolean>>(`/api/admin/exception-logs/${exceptionId}/handle-status`, payload);
  return response.data.data;
}

// 批量处理接口服务于表格勾选多条异常后的统一处理动作。
export async function batchUpdateExceptionHandleStatus(payload: { exceptionIds: string[]; handleStatus: string; handleRemark?: string }) {
  const response = await request.post<ApiResponse<{ successCount: number; failCount: number }>>("/api/admin/exception-logs/batch-handle-status", payload);
  return response.data.data;
}
