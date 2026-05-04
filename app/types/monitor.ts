// 运行监控类型覆盖问答链路、AI 编排轨迹、性能统计和已合并的异常日志模块。
export type WorkflowStage =
  | "QUESTION_UNDERSTANDING"
  | "PLANNING"
  | "RETRIEVAL"
  | "RANKING"
  | "GENERATION"
  | "ARCHIVING";

export type WorkflowStatus =
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "PARTIAL_SUCCESS"
  | "INTERRUPTED"
  | "NEED_CLARIFICATION";

export interface MonitorPageResult<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export interface MonitorOverview {
  totalQaCount: number;
  successQaCount: number;
  failedQaCount: number;
  avgResponseTimeMs: number;
  aiCallCount: number;
  graphHitCount: number;
  graphHitRate: number;
  exceptionCount: number;
  onlineAdminUserCount: number;
  successRate: number;
}

export interface MonitorRequestItem {
  requestId: string;
  question: string;
  requestTime: string;
  requestSource: string;
  requestStatus: string;
  responseSummary: string;
  totalDurationMs: number;
  graphHit: boolean;
  aiCallStatus: string;
  exceptionFlag: boolean;
}

export interface MonitorRequestDetail extends MonitorRequestItem {
  finalAnswer: string;
  traceId: string;
  userId: string;
  userAccount: string;
  workflow?: MonitorWorkflowSummary | null;
}

export interface MonitorWorkflowSummary {
  archiveId: number;
  workflowStatus: WorkflowStatus | string;
  currentStage: WorkflowStage | string;
  stageCount: number;
  toolCallCount: number;
  // 以下质检字段仅用于兼容旧接口数据，新流程不再展示为独立阶段。
  qualityScore?: number | null;
  hallucinationRisk?: string | null;
}

export interface MonitorNlpDetail {
  requestId: string;
  tokenizeResult: string[];
  keywordList: string[];
  entityList: Array<{ name: string; typeCode: string }>;
  intent: string;
  confidence: number;
  durationMs: number;
  rawResult?: Record<string, unknown>;
}

export interface MonitorGraphRetrievalDetail {
  requestId: string;
  queryCondition: Record<string, unknown>;
  hitEntityList: Array<{ id: string; name: string; typeCode: string; typeName: string }>;
  hitRelationList: Array<{ id: string; relationTypeCode: string; relationTypeName: string }>;
  hitPropertySummary: string[];
  resultCount: number;
  validHit: boolean;
  durationMs: number;
}

export interface MonitorPromptDetail {
  requestId: string;
  originalQuestion: string;
  graphSummary: string;
  promptSummary: string;
  promptContent?: string;
  generatedTime: string;
  durationMs: number;
}

export interface MonitorAiCallDetail {
  requestId: string;
  modelName: string;
  provider: string;
  callTime: string;
  aiCallStatus: string;
  responseStatusCode: number;
  durationMs: number;
  resultSummary: string;
  errorMessage: string | null;
  retryCount: number;
}

export interface MonitorTimingsDetail {
  requestId: string;
  totalDurationMs: number;
  phases: Array<{
    phaseCode: string;
    phaseName: string;
    durationMs: number;
    success: boolean;
    source?: "monitor" | "workflow" | string;
  }>;
}

export interface MonitorWorkflowDetail {
  requestId: string;
  archiveId: number;
  workflowStatus: WorkflowStatus | string;
  currentStage: WorkflowStage | string;
  stages: Array<{
    stageCode: WorkflowStage | string;
    stageName: string;
    status: "PROCESSING" | "SUCCESS" | "FAILED" | string;
    durationMs: number;
    summary: string;
    errorMessage: string | null;
  }>;
  toolCalls: Array<{
    toolName: string;
    toolLabel: string;
    status: "PROCESSING" | "SUCCESS" | "FAILED" | string;
    durationMs: number;
    inputSummary: string;
    outputSummary: string;
    errorMessage: string | null;
  }>;
  questionUnderstanding?: Record<string, unknown>;
  planning?: Record<string, unknown>;
  evidence?: Array<Record<string, unknown>>;
  ranking?: Record<string, unknown>;
  generation?: Record<string, unknown>;
  // 历史质检扩展字段可能仍由旧数据返回，但当前前端不再渲染质检节点。
  quality?: Record<string, unknown> | null;
  timings?: Record<string, unknown>;
  errorMessage: string | null;
}

export interface MonitorTrendPoint {
  statDate: string;
  metricValue: number;
}

export interface MonitorTopQuestion {
  question: string;
  count: number;
}

export interface MonitorPerformance {
  avgResponseTimeMs: number;
  p95ResponseTimeMs: number;
  nlpAvgDurationMs: number;
  graphAvgDurationMs: number;
  promptAvgDurationMs: number;
  aiAvgDurationMs: number;
  successRate: number;
  graphHitRate: number;
  aiFailureRate: number;
}

export interface ExceptionLogItem {
  exceptionId: string;
  exceptionModule: string;
  exceptionLevel: string;
  exceptionType: string;
  exceptionMessage: string;
  requestId: string;
  traceId: string;
  occurredTime: string;
  handleStatus: string;
  handlerName: string | null;
  handledTime: string | null;
}

export interface ExceptionLogDetail extends ExceptionLogItem {
  stackTrace: string;
  requestUri: string;
  requestMethod: string;
  requestParamSummary: string;
  contextInfo: Record<string, unknown>;
  handleRemark: string | null;
  handlerId: string | null;
}

export interface ExceptionSummary {
  totalCount: number;
  unhandledCount: number;
  handlingCount: number;
  handledCount: number;
  ignoredCount: number;
  errorCount: number;
  fatalCount: number;
  topModuleList: Array<{ module: string; count: number }>;
}
