import { Card, Tag } from "antd";
import {
  ApiOutlined,
  ClockCircleOutlined,
  NodeIndexOutlined,
  RadarChartOutlined,
} from "@ant-design/icons";

import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [{ title: "首页总览 | 油井工程智能问答系统" }];
}

// 当前首页仍以静态数据为主，用于承接后续监控接口接入前的版式占位。
const metrics = [
  { label: "今日问答总次数", value: "1,286", delta: "+12.8%" },
  { label: "问答成功次数", value: "1,214", delta: "+6.4%" },
  { label: "平均响应时间", value: "1.8s", delta: "-0.3s" },
  { label: "图谱命中次数", value: "932", delta: "+9.1%" },
];

// 链路摘要卡片强调系统核心阶段，方便后续切换成真实监控数据。
const pipeline = [
  {
    title: "NLP 识别",
    value: "98.2%",
    desc: "意图识别与实体抽取稳定",
    icon: <RadarChartOutlined />,
  },
  {
    title: "图谱检索",
    value: "932",
    desc: "今日图谱匹配命中记录",
    icon: <NodeIndexOutlined />,
  },
  {
    title: "AI 调用",
    value: "1.7s",
    desc: "平均生成耗时",
    icon: <ApiOutlined />,
  },
  {
    title: "链路时延",
    value: "2.4s",
    desc: "端到端响应中位数",
    icon: <ClockCircleOutlined />,
  },
];

export default function DashboardPage() {
  return (
    <Card className="page-card" bordered={false}>
      <section className="page-hero">
        <div className="page-hero__content">
          <div>
            <span className="page-hero__eyebrow">CONTROL OVERVIEW</span>
            <h1>系统总览</h1>
            <p>
              管理端首页改为工程控制台风格，突出问答链路、图谱命中与运行态势。当前仍是静态占位，但页面结构已经适合直接接入真实监控数据。
            </p>
          </div>
          <div className="page-hero__tags">
            <Tag bordered={false} color="gold">
              图谱在线
            </Tag>
            <Tag bordered={false} color="blue">
              问答服务稳定
            </Tag>
            <Tag bordered={false} color="green">
              监控已接入
            </Tag>
          </div>
        </div>
        <div className="hero-strip">
          <div>
            <span>当前模式</span>
            <strong>毕业设计演示环境</strong>
          </div>
          <div>
            <span>问答成功率</span>
            <strong>94.4%</strong>
          </div>
          <div>
            <span>异常记录</span>
            <strong>16</strong>
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
            <i style={{ height: "42%" }} />
            <i style={{ height: "55%" }} />
            <i style={{ height: "48%" }} />
            <i style={{ height: "68%" }} />
            <i style={{ height: "72%" }} />
            <i style={{ height: "64%" }} />
            <i style={{ height: "82%" }} />
          </div>
          <p>
            这里预留折线图与柱状图容器，后续可接入近 7 天问答总量、成功率与平均响应耗时趋势。
          </p>
        </div>
        <div className="placeholder-panel placeholder-panel--list">
          <div className="panel-head">
            <span>PIPELINE NOTES</span>
            <strong>链路监控摘要</strong>
          </div>
          <ul className="signal-list">
            <li>
              <span>问题接收链路</span>
              <strong>稳定</strong>
            </li>
            <li>
              <span>知识图谱召回</span>
              <strong>中高</strong>
            </li>
            <li>
              <span>Prompt 拼接质量</span>
              <strong>可优化</strong>
            </li>
            <li>
              <span>AI 调用异常率</span>
              <strong>1.2%</strong>
            </li>
          </ul>
          <p>
            这里适合继续拆成 NLP 记录、图谱检索记录、Prompt 记录和 AI
            调用记录四个入口模块。
          </p>
        </div>
      </section>
    </Card>
  );
}
