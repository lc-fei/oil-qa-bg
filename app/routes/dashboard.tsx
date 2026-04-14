import { Card } from "antd";

import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [{ title: "首页总览 | 油井工程智能问答系统" }];
}

const metrics = [
  { label: "今日问答总次数", value: "1,286" },
  { label: "问答成功次数", value: "1,214" },
  { label: "平均响应时间", value: "1.8s" },
  { label: "图谱命中次数", value: "932" },
];

export default function DashboardPage() {
  return (
    <Card className="page-card" bordered={false}>
      <section className="page-hero">
        <h1>系统总览</h1>
        <p>
          首页总览已预留关键监控卡片、趋势区和高频问题区。当前先提供静态骨架，后续可直接接入运行监控和统计接口。
        </p>
      </section>

      <section className="dashboard-grid">
        {metrics.map((item) => (
          <div className="metric-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </section>

      <section className="placeholder-grid">
        <div className="placeholder-panel">
          <h2>最近问答趋势</h2>
          <p>
            这里预留折线图区域，后续可使用 ECharts 对接近 7 天或 30
            天的问答请求趋势、成功率和平均耗时。
          </p>
        </div>
        <div className="placeholder-panel">
          <h2>链路监控摘要</h2>
          <p>
            这里预留运行监控摘要区，用于展示 NLP 识别、图谱检索、Prompt
            生成和 AI 调用四段链路的关键指标。
          </p>
        </div>
      </section>
    </Card>
  );
}
