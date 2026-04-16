import {
  AlertOutlined,
  CheckCircleOutlined,
  ClusterOutlined,
  DashboardOutlined,
  ExceptionOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";

import type { Route } from "./+types/monitor";
import {
  batchUpdateExceptionHandleStatus,
  getExceptionDetail,
  getExceptionLogs,
  getExceptionSummary,
  getMonitorAiDetail,
  getMonitorGraphDetail,
  getMonitorNlpDetail,
  getMonitorOverview,
  getMonitorPerformance,
  getMonitorPromptDetail,
  getMonitorRequestDetail,
  getMonitorRequests,
  getMonitorTimings,
  getMonitorTopQuestions,
  getMonitorTrend,
  updateExceptionHandleStatus,
} from "../services/monitor";
import type {
  ExceptionLogDetail,
  ExceptionLogItem,
  ExceptionSummary,
  MonitorAiCallDetail,
  MonitorGraphRetrievalDetail,
  MonitorNlpDetail,
  MonitorOverview,
  MonitorPerformance,
  MonitorPromptDetail,
  MonitorRequestDetail,
  MonitorRequestItem,
  MonitorTimingsDetail,
  MonitorTopQuestion,
  MonitorTrendPoint,
} from "../types/monitor";

export function meta({}: Route.MetaArgs) {
  return [{ title: "运行监控 | 油井工程智能问答系统" }];
}

const requestStatusOptions = [
  "SUCCESS",
  "FAILED",
  "PROCESSING",
  "PARTIAL_SUCCESS",
  "TIMEOUT",
].map((value) => ({ label: value, value }));

const requestSourceOptions = [
  "CLIENT_WEB",
  "ADMIN_DEBUG",
  "OPEN_API",
  "SCHEDULE_TASK",
  "UNKNOWN",
].map((value) => ({ label: value, value }));

const exceptionLevelOptions = ["INFO", "WARN", "ERROR", "FATAL"].map((value) => ({
  label: value,
  value,
}));

const handleStatusOptions = ["UNHANDLED", "HANDLING", "HANDLED", "IGNORED"].map((value) => ({
  label: value,
  value,
}));

// 百分比在多个统计卡和性能区重复使用，统一在这里格式化。
function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export default function MonitorPage() {
  const [requestForm] = Form.useForm();
  const [exceptionForm] = Form.useForm();
  const [handleForm] = Form.useForm();
  const [overview, setOverview] = useState<MonitorOverview | null>(null);
  const [performance, setPerformance] = useState<MonitorPerformance | null>(null);
  const [trend, setTrend] = useState<MonitorTrendPoint[]>([]);
  const [topQuestions, setTopQuestions] = useState<MonitorTopQuestion[]>([]);
  const [exceptionSummary, setExceptionSummary] = useState<ExceptionSummary | null>(null);
  const [requestQuery, setRequestQuery] = useState({ pageNum: 1, pageSize: 10 });
  const [exceptionQuery, setExceptionQuery] = useState({ pageNum: 1, pageSize: 10 });
  const [requestLoading, setRequestLoading] = useState(false);
  const [exceptionLoading, setExceptionLoading] = useState(false);
  const [requestList, setRequestList] = useState<MonitorRequestItem[]>([]);
  const [requestTotal, setRequestTotal] = useState(0);
  const [exceptionList, setExceptionList] = useState<ExceptionLogItem[]>([]);
  const [exceptionTotal, setExceptionTotal] = useState(0);
  const [selectedExceptionIds, setSelectedExceptionIds] = useState<string[]>([]);

  const [requestDrawerOpen, setRequestDrawerOpen] = useState(false);
  const [requestDetail, setRequestDetail] = useState<MonitorRequestDetail | null>(null);
  const [nlpDetail, setNlpDetail] = useState<MonitorNlpDetail | null>(null);
  const [graphDetail, setGraphDetail] = useState<MonitorGraphRetrievalDetail | null>(null);
  const [promptDetail, setPromptDetail] = useState<MonitorPromptDetail | null>(null);
  const [aiDetail, setAiDetail] = useState<MonitorAiCallDetail | null>(null);
  const [timingsDetail, setTimingsDetail] = useState<MonitorTimingsDetail | null>(null);

  const [exceptionDrawerOpen, setExceptionDrawerOpen] = useState(false);
  const [exceptionDetail, setExceptionDetail] = useState<ExceptionLogDetail | null>(null);
  const [handleModalOpen, setHandleModalOpen] = useState(false);

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    void loadRequests(requestQuery);
  }, [requestQuery]);

  useEffect(() => {
    void loadExceptions(exceptionQuery);
  }, [exceptionQuery]);

  // 首页摘要、趋势、性能、高频问题和异常摘要需要同时刷新，适合并行请求。
  async function loadDashboard() {
    try {
      const [overviewData, trendData, topData, performanceData, summaryData] = await Promise.all([
        getMonitorOverview({ rangeType: "today" }),
        getMonitorTrend({
          metricType: "qaCount",
          granularity: "day",
          startDate: "2026-04-10",
          endDate: "2026-04-16",
        }),
        getMonitorTopQuestions({ topN: 6 }),
        getMonitorPerformance({}),
        getExceptionSummary({}),
      ]);
      setOverview(overviewData);
      setTrend(trendData);
      setTopQuestions(topData);
      setPerformance(performanceData);
      setExceptionSummary(summaryData);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "监控概览加载失败");
    }
  }

  // 请求列表是监控主表格，单独维护 loading 和分页状态。
  async function loadRequests(params: Record<string, unknown>) {
    setRequestLoading(true);
    try {
      const data = await getMonitorRequests(params);
      setRequestList(data.list);
      setRequestTotal(data.total);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "请求列表加载失败");
    } finally {
      setRequestLoading(false);
    }
  }

  // 异常区域既要显示列表，也要同步更新顶部摘要，因此这里并行拉取两份数据。
  async function loadExceptions(params: Record<string, unknown>) {
    setExceptionLoading(true);
    try {
      const [listData, summaryData] = await Promise.all([
        getExceptionLogs(params),
        getExceptionSummary(params),
      ]);
      setExceptionList(listData.list);
      setExceptionTotal(listData.total);
      setExceptionSummary(summaryData);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "异常日志加载失败");
    } finally {
      setExceptionLoading(false);
    }
  }

  // 链路详情抽屉需要一次性拿齐多个阶段接口，避免用户切 Tab 时重复等待。
  async function openRequestDetail(requestId: string) {
    try {
      const [base, nlp, graph, prompt, ai, timings] = await Promise.all([
        getMonitorRequestDetail(requestId),
        getMonitorNlpDetail(requestId),
        getMonitorGraphDetail(requestId),
        getMonitorPromptDetail(requestId),
        getMonitorAiDetail(requestId),
        getMonitorTimings(requestId),
      ]);
      setRequestDetail(base);
      setNlpDetail(nlp);
      setGraphDetail(graph);
      setPromptDetail(prompt);
      setAiDetail(ai);
      setTimingsDetail(timings);
      setRequestDrawerOpen(true);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "链路详情加载失败");
    }
  }

  // 异常详情抽屉按需加载大文本字段，避免在列表查询时传输堆栈内容。
  async function openExceptionDetail(exceptionId: string) {
    try {
      const data = await getExceptionDetail(exceptionId);
      setExceptionDetail(data);
      setExceptionDrawerOpen(true);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "异常详情加载失败");
    }
  }

  const trendMax = useMemo(
    // 柱状图高度按当前数据最大值归一化，避免出现 0 高度导致不可见。
    () => Math.max(...trend.map((item) => item.metricValue), 1),
    [trend],
  );

  const requestColumns: ColumnsType<MonitorRequestItem> = [
    { title: "请求编号", dataIndex: "requestId", width: 160 },
    {
      title: "问题内容",
      dataIndex: "question",
      render: (value: string, record) => (
        <button className="graph-link" type="button" onClick={() => void openRequestDetail(record.requestId)}>
          {value}
        </button>
      ),
    },
    { title: "请求时间", dataIndex: "requestTime", width: 170 },
    { title: "来源", dataIndex: "requestSource", width: 130 },
    {
      title: "状态",
      dataIndex: "requestStatus",
      width: 120,
      render: (value: string) => <Tag color={value === "SUCCESS" ? "green" : value === "FAILED" ? "red" : "blue"}>{value}</Tag>,
    },
    { title: "总耗时(ms)", dataIndex: "totalDurationMs", width: 120 },
    {
      title: "图谱命中",
      dataIndex: "graphHit",
      width: 100,
      render: (value: boolean) => (value ? <Tag color="green">命中</Tag> : <Tag>未命中</Tag>),
    },
    {
      title: "异常",
      dataIndex: "exceptionFlag",
      width: 100,
      render: (value: boolean) => (value ? <Tag color="red">有异常</Tag> : <Tag color="green">正常</Tag>),
    },
  ];

  const exceptionColumns: ColumnsType<ExceptionLogItem> = [
    {
      title: "异常编号",
      dataIndex: "exceptionId",
      width: 170,
      render: (value: string, record) => (
        <button className="graph-link" type="button" onClick={() => void openExceptionDetail(record.exceptionId)}>
          {value}
        </button>
      ),
    },
    { title: "模块", dataIndex: "exceptionModule", width: 110 },
    {
      title: "级别",
      dataIndex: "exceptionLevel",
      width: 100,
      render: (value: string) => <Tag color={value === "FATAL" ? "red" : value === "ERROR" ? "volcano" : value === "WARN" ? "gold" : "blue"}>{value}</Tag>,
    },
    { title: "异常类型", dataIndex: "exceptionType", width: 180 },
    { title: "异常摘要", dataIndex: "exceptionMessage", ellipsis: true },
    { title: "请求编号", dataIndex: "requestId", width: 160 },
    {
      title: "处理状态",
      dataIndex: "handleStatus",
      width: 120,
      render: (value: string) => <Tag color={value === "HANDLED" ? "green" : value === "HANDLING" ? "blue" : value === "IGNORED" ? "default" : "red"}>{value}</Tag>,
    },
    { title: "发生时间", dataIndex: "occurredTime", width: 170 },
  ];

  return (
    <Card className="page-card" bordered={false}>
      <section className="page-hero">
        <div className="page-hero__content">
          <div>
            <span className="page-hero__eyebrow">OBSERVABILITY CENTER</span>
            <h1>运行监控</h1>
            <p>将系统稳定性大盘、问答链路监控和异常日志处理合并到同一页面，统一支撑排障、演示和论文说明。</p>
          </div>
          <div className="page-hero__tags">
            <Tag color="gold" bordered={false}>链路可观测</Tag>
            <Tag color="blue" bordered={false}>异常闭环</Tag>
            <Tag color="green" bordered={false}>统一大盘</Tag>
          </div>
        </div>
      </section>

      <section className="monitor-page">
        {overview ? (
          <div className="monitor-metrics">
            <div className="metric-card">
              <span>问答总次数</span>
              <strong>{overview.totalQaCount}</strong>
              <em>{percent(overview.successRate)} 成功率</em>
            </div>
            <div className="metric-card">
              <span>图谱命中</span>
              <strong>{overview.graphHitCount}</strong>
              <em>{percent(overview.graphHitRate)} 命中率</em>
            </div>
            <div className="metric-card">
              <span>平均响应时长</span>
              <strong>{Math.round(overview.avgResponseTimeMs)}ms</strong>
              <em>AI 调用 {overview.aiCallCount} 次</em>
            </div>
            <div className="metric-card">
              <span>异常记录</span>
              <strong>{overview.exceptionCount}</strong>
              <em>在线后台 {overview.onlineAdminUserCount} 人</em>
            </div>
          </div>
        ) : null}

        <div className="monitor-dual-grid">
          <Card className="users-table-card" bordered={false}>
            <div className="graph-tab-head">
              <div>
                <span className="page-hero__eyebrow">TREND SNAPSHOT</span>
                <h3>问答趋势</h3>
              </div>
              <Tag bordered={false} color="blue">最近 7 天</Tag>
            </div>
            <div className="monitor-trend-chart">
              {trend.map((item) => (
                <div className="monitor-trend-bar" key={item.statDate}>
                  <i style={{ height: `${(item.metricValue / trendMax) * 100}%` }} />
                  <span>{item.statDate.slice(5)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="users-table-card" bordered={false}>
            <div className="graph-tab-head">
              <div>
                <span className="page-hero__eyebrow">PERFORMANCE SNAPSHOT</span>
                <h3>性能分析</h3>
              </div>
              <RobotOutlined />
            </div>
            {performance ? (
              <div className="monitor-performance-grid">
                <div className="graph-property-card">
                  <span>P95 响应时长</span>
                  <strong>{Math.round(performance.p95ResponseTimeMs)}ms</strong>
                </div>
                <div className="graph-property-card">
                  <span>AI 平均耗时</span>
                  <strong>{Math.round(performance.aiAvgDurationMs)}ms</strong>
                </div>
                <div className="graph-property-card">
                  <span>图谱命中率</span>
                  <strong>{percent(performance.graphHitRate)}</strong>
                </div>
                <div className="graph-property-card">
                  <span>AI 失败率</span>
                  <strong>{percent(performance.aiFailureRate)}</strong>
                </div>
              </div>
            ) : null}
          </Card>
        </div>

        <div className="monitor-dual-grid">
          <Card className="users-table-card" bordered={false}>
            <div className="graph-tab-head">
              <div>
                <span className="page-hero__eyebrow">TOP QUESTIONS</span>
                <h3>高频问题</h3>
              </div>
              <ClusterOutlined />
            </div>
            <div className="graph-detail-list">
              {topQuestions.map((item) => (
                <div className="graph-detail-item" key={item.question}>
                  <strong>{item.question}</strong>
                  <span>出现 {item.count} 次</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="users-table-card" bordered={false}>
            <div className="graph-tab-head">
              <div>
                <span className="page-hero__eyebrow">EXCEPTION SUMMARY</span>
                <h3>异常摘要</h3>
              </div>
              <AlertOutlined />
            </div>
            {exceptionSummary ? (
              <div className="monitor-performance-grid">
                <div className="graph-property-card">
                  <span>总异常数</span>
                  <strong>{exceptionSummary.totalCount}</strong>
                </div>
                <div className="graph-property-card">
                  <span>未处理</span>
                  <strong>{exceptionSummary.unhandledCount}</strong>
                </div>
                <div className="graph-property-card">
                  <span>ERROR</span>
                  <strong>{exceptionSummary.errorCount}</strong>
                </div>
                <div className="graph-property-card">
                  <span>FATAL</span>
                  <strong>{exceptionSummary.fatalCount}</strong>
                </div>
              </div>
            ) : null}
          </Card>
        </div>

        <Card className="users-table-card" bordered={false}>
          <div className="graph-tab-head">
            <div>
              <span className="page-hero__eyebrow">REQUEST MONITOR</span>
              <h3>问答请求列表</h3>
            </div>
            <DashboardOutlined />
          </div>
          <Form form={requestForm} layout="vertical" onFinish={(values) => setRequestQuery({ ...values, pageNum: 1, pageSize: requestQuery.pageSize })}>
            <Row gutter={[16, 4]}>
              <Col xs={24} md={8}><Form.Item label="问题关键字" name="keyword"><Input allowClear placeholder="输入问题关键字" /></Form.Item></Col>
              <Col xs={24} md={4}><Form.Item label="请求状态" name="requestStatus"><Select allowClear options={requestStatusOptions} /></Form.Item></Col>
              <Col xs={24} md={4}><Form.Item label="请求来源" name="requestSource"><Select allowClear options={requestSourceOptions} /></Form.Item></Col>
              <Col xs={24} md={4}><Form.Item label="图谱命中" name="hasGraphHit"><Select allowClear options={[{ label: "是", value: 1 }, { label: "否", value: 0 }]} /></Form.Item></Col>
              <Col xs={24} md={4}><Form.Item label="包含异常" name="hasException"><Select allowClear options={[{ label: "是", value: 1 }, { label: "否", value: 0 }]} /></Form.Item></Col>
            </Row>
            <div className="users-toolbar__actions">
              <Space wrap>
                <Button type="primary" htmlType="submit">查询请求</Button>
                <Button onClick={() => { requestForm.resetFields(); setRequestQuery({ pageNum: 1, pageSize: 10 }); }}>重置</Button>
              </Space>
            </div>
          </Form>
          <Table
            rowKey="requestId"
            loading={requestLoading}
            columns={requestColumns}
            dataSource={requestList}
            scroll={{ x: 1200 }}
            pagination={{
              current: requestQuery.pageNum,
              pageSize: requestQuery.pageSize,
              total: requestTotal,
              showSizeChanger: true,
              onChange: (pageNum, pageSize) => setRequestQuery((prev) => ({ ...prev, pageNum, pageSize })),
            }}
          />
        </Card>

        <Card className="users-table-card" bordered={false}>
          <div className="graph-tab-head">
            <div>
              <span className="page-hero__eyebrow">EXCEPTION LOGS</span>
              <h3>异常日志</h3>
            </div>
            <Space>
              <Button
                disabled={!selectedExceptionIds.length}
                onClick={() => {
                  handleForm.resetFields();
                  setHandleModalOpen(true);
                }}
              >
                批量处理
              </Button>
              <ExceptionOutlined />
            </Space>
          </div>
          <Form form={exceptionForm} layout="vertical" onFinish={(values) => setExceptionQuery({ ...values, pageNum: 1, pageSize: exceptionQuery.pageSize })}>
            <Row gutter={[16, 4]}>
              <Col xs={24} md={6}><Form.Item label="异常模块" name="exceptionModule"><Input allowClear placeholder="如 AI_CALL / GRAPH" /></Form.Item></Col>
              <Col xs={24} md={4}><Form.Item label="异常级别" name="exceptionLevel"><Select allowClear options={exceptionLevelOptions} /></Form.Item></Col>
              <Col xs={24} md={4}><Form.Item label="处理状态" name="handleStatus"><Select allowClear options={handleStatusOptions} /></Form.Item></Col>
              <Col xs={24} md={6}><Form.Item label="关键字" name="keyword"><Input allowClear placeholder="按异常摘要搜索" /></Form.Item></Col>
              <Col xs={24} md={4}><Form.Item label="请求编号" name="requestId"><Input allowClear placeholder="关联请求编号" /></Form.Item></Col>
            </Row>
            <div className="users-toolbar__actions">
              <Space wrap>
                <Button type="primary" htmlType="submit">查询异常</Button>
                <Button onClick={() => { exceptionForm.resetFields(); setExceptionQuery({ pageNum: 1, pageSize: 10 }); }}>重置</Button>
              </Space>
            </div>
          </Form>
          <Table
            rowKey="exceptionId"
            loading={exceptionLoading}
            columns={exceptionColumns}
            dataSource={exceptionList}
            rowSelection={{
              selectedRowKeys: selectedExceptionIds,
              onChange: (selectedRowKeys) => setSelectedExceptionIds(selectedRowKeys as string[]),
            }}
            scroll={{ x: 1200 }}
            pagination={{
              current: exceptionQuery.pageNum,
              pageSize: exceptionQuery.pageSize,
              total: exceptionTotal,
              showSizeChanger: true,
              onChange: (pageNum, pageSize) => setExceptionQuery((prev) => ({ ...prev, pageNum, pageSize })),
            }}
          />
        </Card>
      </section>

      <Drawer title="链路详情" width={860} open={requestDrawerOpen} onClose={() => setRequestDrawerOpen(false)}>
        {requestDetail ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="请求编号">{requestDetail.requestId}</Descriptions.Item>
              <Descriptions.Item label="链路追踪">{requestDetail.traceId}</Descriptions.Item>
              <Descriptions.Item label="请求来源">{requestDetail.requestSource}</Descriptions.Item>
              <Descriptions.Item label="状态">{requestDetail.requestStatus}</Descriptions.Item>
              <Descriptions.Item label="请求账号">{requestDetail.userAccount}</Descriptions.Item>
              <Descriptions.Item label="总耗时">{requestDetail.totalDurationMs}ms</Descriptions.Item>
              <Descriptions.Item label="图谱命中">{requestDetail.graphHit ? "是" : "否"}</Descriptions.Item>
              <Descriptions.Item label="是否异常">{requestDetail.exceptionFlag ? "是" : "否"}</Descriptions.Item>
              <Descriptions.Item label="原始问题" span={2}>{requestDetail.question}</Descriptions.Item>
              <Descriptions.Item label="最终回答" span={2}>{requestDetail.finalAnswer}</Descriptions.Item>
            </Descriptions>
            <Tabs
              items={[
                {
                  key: "timings",
                  label: "阶段耗时",
                  children: (
                    <div className="monitor-phase-list">
                      {timingsDetail?.phases?.map((item) => (
                        <div className="monitor-phase-item" key={item.phaseCode}>
                          <div>
                            <strong>{item.phaseName}</strong>
                            <span>{item.phaseCode}</span>
                          </div>
                          <div>
                            <strong>{item.durationMs}ms</strong>
                            <Tag color={item.success ? "green" : "red"}>{item.success ? "成功" : "失败"}</Tag>
                          </div>
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  key: "nlp",
                  label: "NLP",
                  children: (
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="意图">{nlpDetail?.intent}</Descriptions.Item>
                      <Descriptions.Item label="关键词">{nlpDetail?.keywordList?.join("、") || "-"}</Descriptions.Item>
                      <Descriptions.Item label="实体识别">{nlpDetail?.entityList?.map((item) => `${item.name}(${item.typeCode})`).join("、") || "-"}</Descriptions.Item>
                      <Descriptions.Item label="耗时">{nlpDetail?.durationMs}ms</Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: "graph",
                  label: "图谱检索",
                  children: (
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="检索条件">{JSON.stringify(graphDetail?.queryCondition || {}, null, 2)}</Descriptions.Item>
                      <Descriptions.Item label="命中实体">{graphDetail?.hitEntityList?.map((item) => item.name).join("、") || "-"}</Descriptions.Item>
                      <Descriptions.Item label="命中关系">{graphDetail?.hitRelationList?.map((item) => item.relationTypeName).join("、") || "-"}</Descriptions.Item>
                      <Descriptions.Item label="命中属性">{graphDetail?.hitPropertySummary?.join("、") || "-"}</Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: "prompt",
                  label: "Prompt",
                  children: (
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="摘要">{promptDetail?.promptSummary}</Descriptions.Item>
                      <Descriptions.Item label="图谱摘要">{promptDetail?.graphSummary}</Descriptions.Item>
                      <Descriptions.Item label="完整 Prompt">
                        <pre className="json-block">{promptDetail?.promptContent || "-"}</pre>
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: "ai",
                  label: "AI 调用",
                  children: (
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="模型">{aiDetail?.modelName}</Descriptions.Item>
                      <Descriptions.Item label="提供方">{aiDetail?.provider}</Descriptions.Item>
                      <Descriptions.Item label="调用状态">{aiDetail?.aiCallStatus}</Descriptions.Item>
                      <Descriptions.Item label="响应码">{aiDetail?.responseStatusCode}</Descriptions.Item>
                      <Descriptions.Item label="耗时">{aiDetail?.durationMs}ms</Descriptions.Item>
                      <Descriptions.Item label="错误信息">{aiDetail?.errorMessage || "-"}</Descriptions.Item>
                    </Descriptions>
                  ),
                },
              ]}
            />
          </Space>
        ) : null}
      </Drawer>

      <Drawer
        title="异常详情"
        width={760}
        open={exceptionDrawerOpen}
        onClose={() => setExceptionDrawerOpen(false)}
        extra={
          exceptionDetail ? (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                handleForm.setFieldsValue({
                  handleStatus: exceptionDetail.handleStatus,
                  handleRemark: exceptionDetail.handleRemark,
                });
                setHandleModalOpen(true);
              }}
            >
              更新处理状态
            </Button>
          ) : null
        }
      >
        {exceptionDetail ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="异常编号">{exceptionDetail.exceptionId}</Descriptions.Item>
              <Descriptions.Item label="异常模块">{exceptionDetail.exceptionModule}</Descriptions.Item>
              <Descriptions.Item label="异常级别">{exceptionDetail.exceptionLevel}</Descriptions.Item>
              <Descriptions.Item label="异常类型">{exceptionDetail.exceptionType}</Descriptions.Item>
              <Descriptions.Item label="请求编号">{exceptionDetail.requestId}</Descriptions.Item>
              <Descriptions.Item label="链路编号">{exceptionDetail.traceId}</Descriptions.Item>
              <Descriptions.Item label="处理状态">{exceptionDetail.handleStatus}</Descriptions.Item>
              <Descriptions.Item label="发生时间">{exceptionDetail.occurredTime}</Descriptions.Item>
              <Descriptions.Item label="请求路径">{exceptionDetail.requestUri}</Descriptions.Item>
              <Descriptions.Item label="请求方法">{exceptionDetail.requestMethod}</Descriptions.Item>
              <Descriptions.Item label="异常描述" span={2}>{exceptionDetail.exceptionMessage}</Descriptions.Item>
              <Descriptions.Item label="处理备注" span={2}>{exceptionDetail.handleRemark || "-"}</Descriptions.Item>
            </Descriptions>
            <Card size="small" title="上下文信息">
              <pre className="json-block">{JSON.stringify(exceptionDetail.contextInfo || {}, null, 2)}</pre>
            </Card>
            <Card size="small" title="堆栈信息">
              <pre className="json-block">{exceptionDetail.stackTrace}</pre>
            </Card>
          </Space>
        ) : null}
      </Drawer>

      <Modal
        title="更新异常处理状态"
        open={handleModalOpen}
        onCancel={() => setHandleModalOpen(false)}
        onOk={() => void handleForm.submit()}
      >
        <Form
          form={handleForm}
          layout="vertical"
            onFinish={async (values) => {
            try {
              // 单条处理和批量处理共用一个弹窗，根据是否勾选多条异常决定调用哪个接口。
              if (exceptionDetail?.exceptionId && !selectedExceptionIds.length) {
                await updateExceptionHandleStatus(exceptionDetail.exceptionId, values);
              } else if (selectedExceptionIds.length) {
                await batchUpdateExceptionHandleStatus({
                  exceptionIds: selectedExceptionIds,
                  handleStatus: values.handleStatus,
                  handleRemark: values.handleRemark,
                });
                setSelectedExceptionIds([]);
              }
              message.success("异常处理状态已更新");
              setHandleModalOpen(false);
              await loadExceptions(exceptionQuery);
              if (exceptionDetail?.exceptionId) {
                // 当前详情抽屉打开时，处理完成后同步刷新详情内容，避免状态显示滞后。
                const latest = await getExceptionDetail(exceptionDetail.exceptionId);
                setExceptionDetail(latest);
              }
            } catch (error) {
              message.error(error instanceof Error ? error.message : "异常处理更新失败");
            }
          }}
        >
          <Form.Item name="handleStatus" label="处理状态" rules={[{ required: true, message: "请选择处理状态" }]}>
            <Select options={handleStatusOptions} />
          </Form.Item>
          <Form.Item name="handleRemark" label="处理备注">
            <Input.TextArea rows={4} placeholder="请输入处理说明" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
