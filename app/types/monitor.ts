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
  }>;
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
