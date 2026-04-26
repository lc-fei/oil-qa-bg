import { Card, Tag, message } from "antd";
import {
  ApiOutlined,
  ClockCircleOutlined,
  NodeIndexOutlined,
  RadarChartOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";

import type { Route } from "./+types/dashboard";
import {
  getExceptionSummary,
  getMonitorOverview,
  getMonitorPerformance,
  getMonitorTrend,
} from "../services/monitor";
import type {
  ExceptionSummary,
  MonitorOverview,
  MonitorPerformance,
  MonitorTrendPoint,
} from "../types/monitor";

export function meta({}: Route.MetaArgs) {
  return [{ title: "首页总览 | 油井工程智能问答系统" }];
}

function percent(value?: number) {
  return `${((value ?? 0) * 100).toFixed(1)}%`;
}

function formatNumber(value?: number) {
  return (value ?? 0).toLocaleString("zh-CN");
}

function formatDuration(value?: number) {
  return `${Math.round(value ?? 0)}ms`;
}

// 首页趋势默认使用最近 7 天，和运行监控页保持相同统计口径。
function getRecentDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateTimeRange(range: { startDate: string; endDate: string }) {
  // 性能和异常摘要接口使用完整时间格式，这里由日期范围派生全天边界。
  return {
    startTime: `${range.startDate} 00:00:00`,
    endTime: `${range.endDate} 23:59:59`,
  };
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<MonitorOverview | null>(null);
  const [performance, setPerformance] = useState<MonitorPerformance | null>(null);
  const [exceptionSummary, setExceptionSummary] = useState<ExceptionSummary | null>(null);
  const [trend, setTrend] = useState<MonitorTrendPoint[]>([]);
  const [dashboardRange] = useState(() => getRecentDateRange());

  useEffect(() => {
    void loadDashboard();
  }, []);

  // 首页总览复用运行监控接口，避免首页继续维护虚假或重复统计数据。
  async function loadDashboard() {
    setLoading(true);
    try {
      const dateTimeRange = toDateTimeRange(dashboardRange);
      const [overviewData, trendData, performanceData, exceptionData] = await Promise.all([
        getMonitorOverview({ rangeType: "last7days" }),
        getMonitorTrend({
          metricType: "qaCount",
          granularity: "day",
          startDate: dashboardRange.startDate,
          endDate: dashboardRange.endDate,
        }),
        getMonitorPerformance(dateTimeRange),
        getExceptionSummary(dateTimeRange),
      ]);

      setOverview(overviewData);
      setTrend(trendData);
      setPerformance(performanceData);
      setExceptionSummary(exceptionData);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "首页总览加载失败");
    } finally {
      setLoading(false);
    }
  }

  const metrics = useMemo(
    () => [
      {
        label: "问答总次数",
        value: formatNumber(overview?.totalQaCount),
        delta: `${formatNumber(overview?.successQaCount)} 次成功`,
      },
      {
        label: "问答成功率",
        value: percent(overview?.successRate),
        delta: `${formatNumber(overview?.failedQaCount)} 次失败`,
      },
      {
        label: "平均响应时间",
        value: formatDuration(overview?.avgResponseTimeMs),
        delta: `P95 ${formatDuration(performance?.p95ResponseTimeMs)}`,
      },
      {
        label: "图谱命中次数",
        value: formatNumber(overview?.graphHitCount),
        delta: `${percent(overview?.graphHitRate)} 命中率`,
      },
    ],
    [overview, performance],
  );

  const pipeline = useMemo(
    () => [
      {
        title: "NLP 识别",
        value: formatDuration(performance?.nlpAvgDurationMs),
        desc: `问答成功率 ${percent(performance?.successRate)}`,
        icon: <RadarChartOutlined />,
      },
      {
        title: "图谱检索",
        value: formatNumber(overview?.graphHitCount),
        desc: `图谱命中率 ${percent(performance?.graphHitRate ?? overview?.graphHitRate)}`,
        icon: <NodeIndexOutlined />,
      },
      {
        title: "AI 调用",
        value: formatDuration(performance?.aiAvgDurationMs),
        desc: `AI 失败率 ${percent(performance?.aiFailureRate)}`,
        icon: <ApiOutlined />,
      },
      {
        title: "链路时延",
        value: formatDuration(performance?.avgResponseTimeMs ?? overview?.avgResponseTimeMs),
        desc: `AI 调用 ${formatNumber(overview?.aiCallCount)} 次`,
        icon: <ClockCircleOutlined />,
      },
    ],
    [overview, performance],
  );

  const trendMax = useMemo(
    // 趋势柱高度按当前返回数据归一化；空数据时用 1 避免除 0。
    () => Math.max(...trend.map((item) => item.metricValue), 1),
    [trend],
  );

  return (
    <Card className="page-card" bordered={false} loading={loading}>
      <section className="page-hero">
        <div className="page-hero__content">
          <div>
            <span className="page-hero__eyebrow">CONTROL OVERVIEW</span>
            <h1>系统总览</h1>
            <p>
              首页总览已接入运行监控接口，集中展示最近 7 天问答总量、成功率、图谱命中、响应耗时与异常处理状态。
            </p>
          </div>
          <div className="page-hero__tags">
            <Tag bordered={false} color="gold">
              {dashboardRange.startDate} ~ {dashboardRange.endDate}
            </Tag>
            <Tag bordered={false} color={overview?.exceptionCount ? "red" : "green"}>
              异常 {formatNumber(overview?.exceptionCount)}
            </Tag>
            <Tag bordered={false} color="blue">
              监控已接入
            </Tag>
          </div>
        </div>
        <div className="hero-strip">
          <div>
            <span>当前统计范围</span>
            <strong>最近 7 天</strong>
          </div>
          <div>
            <span>问答成功率</span>
            <strong>{percent(overview?.successRate)}</strong>
          </div>
          <div>
            <span>未处理异常</span>
            <strong>{formatNumber(exceptionSummary?.unhandledCount)}</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        {metrics.map((item) => (
          <div className="metric-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <em>{item.delta}</em>
          </div>
        ))}
      </section>

      <section className="dashboard-band">
        {pipeline.map((item) => (
          <div className="dashboard-band__item" key={item.title}>
            <div className="dashboard-band__icon">{item.icon}</div>
            <div>
              <span>{item.title}</span>
              <strong>{item.value}</strong>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="placeholder-grid">
        <div className="placeholder-panel placeholder-panel--chart">
          <div className="panel-head">
            <span>RECENT TREND</span>
            <strong>最近问答趋势</strong>
          </div>
          <div className="fake-chart">
            {trend.length ? (
              trend.map((item) => (
                <i
                  key={item.statDate}
                  title={`${item.statDate}: ${item.metricValue}`}
                  style={{ height: `${(item.metricValue / trendMax) * 100}%` }}
                />
              ))
            ) : (
              <span>暂无趋势数据</span>
            )}
          </div>
          <p>
            数据来自 `GET /api/admin/monitor/statistics/trend`，指标为最近 7 天问答总量。
          </p>
        </div>
        <div className="placeholder-panel placeholder-panel--list">
          <div className="panel-head">
            <span>PIPELINE NOTES</span>
            <strong>链路监控摘要</strong>
          </div>
          <ul className="signal-list">
            <li>
              <span>问答成功</span>
              <strong>{formatNumber(overview?.successQaCount)}</strong>
            </li>
            <li>
              <span>图谱命中</span>
              <strong>{formatNumber(overview?.graphHitCount)}</strong>
            </li>
            <li>
              <span>处理中异常</span>
              <strong>{formatNumber(exceptionSummary?.handlingCount)}</strong>
            </li>
            <li>
              <span>已处理异常</span>
              <strong>{formatNumber(exceptionSummary?.handledCount)}</strong>
            </li>
          </ul>
          <p>
            摘要来自运行总览、性能分析和异常摘要接口，和运行监控页保持同一数据来源。
          </p>
        </div>
      </section>
    </Card>
  );
}
