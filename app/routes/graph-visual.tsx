import {
  ApartmentOutlined,
  ClusterOutlined,
  MinusOutlined,
  PlusOutlined,
  RedoOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  message,
} from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Graph as G6Graph, GraphData } from "@antv/g6";

import type { Route } from "./+types/graph-visual";
import {
  getEntityOptions,
  getGraphOptions,
  getPathData,
  getVisualization,
} from "../services/graph";
import type {
  GraphEntityOption,
  GraphVisualizationData,
  GraphVisualizationEdge,
  GraphVisualizationNode,
} from "../types/graph";

export function meta({}: Route.MetaArgs) {
  return [{ title: "图谱可视化 | 油井工程智能问答系统" }];
}

type GraphQueryMode = "FULL" | "CENTER";

const graphQueryModeOptions = [
  { label: "中心实体", value: "CENTER" },
  { label: "全量图谱", value: "FULL" },
];

const entityTypeColors = ["#c9863d", "#17675f", "#315f8c", "#8a5a32", "#7b6f3a", "#365766"];

function getCenterEntityId(graph: GraphVisualizationData | null) {
  // 兼容新接口的 center 对象和旧接口的 centerEntityId，避免后端灰度期间中心节点丢失高亮。
  return graph?.center?.id ?? graph?.centerEntityId ?? "";
}

function getGraphSummary(graph: GraphVisualizationData | null) {
  // 后端新增 total/returned/truncated 字段后，页面优先展示后端口径，缺失时回落到数组长度。
  return {
    mode: graph?.mode ?? "-",
    totalNodeCount: graph?.totalNodeCount ?? graph?.nodes.length ?? 0,
    totalEdgeCount: graph?.totalEdgeCount ?? graph?.edges.length ?? 0,
    returnedNodeCount: graph?.returnedNodeCount ?? graph?.nodes.length ?? 0,
    returnedEdgeCount: graph?.returnedEdgeCount ?? graph?.edges.length ?? 0,
    truncated: Boolean(graph?.truncated),
  };
}

function buildNodeColorMap(nodes: GraphVisualizationNode[]) {
  const typeCodes = Array.from(new Set(nodes.map((node) => node.typeCode)));

  // G6 渲染阶段只关心颜色映射，提前生成 Map 可避免每个节点重复计算类型索引。
  return new Map(
    typeCodes.map((typeCode, index) => [
      typeCode,
      entityTypeColors[index % entityTypeColors.length],
    ]),
  );
}

function toG6Data(graph: GraphVisualizationData): GraphData {
  const centerEntityId = getCenterEntityId(graph);
  const nodeColorMap = buildNodeColorMap(graph.nodes);

  // 后端返回的是业务节点/边，G6 需要 id/source/target/style/data 结构，这里集中做协议转换。
  return {
    nodes: graph.nodes.map((node) => {
      const color = nodeColorMap.get(node.typeCode) ?? "#c9863d";
      const isCenter = node.id === centerEntityId;

      return {
        id: node.id,
        data: { raw: node, color, isCenter },
        style: {
          fill: isCenter ? "#122131" : "#fffaf2",
          stroke: color,
          lineWidth: isCenter ? 3 : 1.8,
          size: isCenter ? 46 : 32,
          labelText: node.name,
          labelPlacement: "bottom",
          labelFill: "#13202c",
          labelFontSize: 12,
          labelFontWeight: 700,
          labelBackground: true,
          labelBackgroundFill: "rgba(255, 251, 246, 0.9)",
          labelBackgroundRadius: 8,
          labelPadding: [3, 7],
        },
      };
    }),
    edges: graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      data: { raw: edge },
      style: {
        stroke: "rgba(19, 30, 41, 0.3)",
        lineWidth: 1.35,
        endArrow: true,
        labelText: edge.relationTypeName,
        labelFill: "#7b5630",
        labelFontSize: 11,
        labelBackground: true,
        labelBackgroundFill: "rgba(255, 251, 246, 0.88)",
        labelBackgroundRadius: 7,
        labelPadding: [2, 6],
      },
    })),
  };
}

export default function GraphVisualPage() {
  const [form] = Form.useForm();
  const graphMode = Form.useWatch("mode", form) as GraphQueryMode | undefined;
  const currentGraphMode = graphMode ?? "CENTER";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const g6GraphRef = useRef<G6Graph | null>(null);
  const [options, setOptions] = useState({ entityTypes: [], relationTypes: [] } as { entityTypes: Array<{ value: string; label: string }>; relationTypes: Array<{ value: string; label: string }> });
  const [entityOptions, setEntityOptions] = useState<GraphEntityOption[]>([]);
  const [graph, setGraph] = useState<GraphVisualizationData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphVisualizationNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphVisualizationEdge | null>(null);
  const [pathLoading, setPathLoading] = useState(false);
  const [visualLoading, setVisualLoading] = useState(false);

  useEffect(() => {
    void getGraphOptions().then(setOptions).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!graph?.nodes.length || !containerRef.current) {
      return;
    }

    let disposed = false;

    async function renderG6Graph() {
      const { Graph, NodeEvent, EdgeEvent, CanvasEvent } = await import("@antv/g6");
      const container = containerRef.current;

      if (!container || disposed || !graph) {
        return;
      }

      g6GraphRef.current?.destroy();

      const graphData = toG6Data(graph);
      const width = container.clientWidth || 720;
      const height = container.clientHeight || 620;

      // FULL 使用 ForceAtlas2 做网络总览，避免普通力导向在大图下聚成一团。
      const instance = new Graph({
        container,
        width,
        height,
        data: graphData,
        autoFit: "view",
        padding: 36,
        animation: false,
        layout: graph.mode === "CENTER"
          ? {
              type: "radial",
              animation: false,
              preventOverlap: true,
              nodeSize: 64,
              nodeSpacing: 18,
              unitRadius: 160,
            }
          : {
              type: "force-atlas2",
              animate: false,
              maxIteration: 520,
              minMovement: 0.25,
              preventOverlap: true,
              // 视觉节点保持小尺寸，碰撞半径适度放大即可，避免“大球”互相挤压。
              nodeSize: 54,
              nodeSpacing: 22,
              kr: 58,
              kg: 0.06,
              ks: 0.08,
              ksmax: 8,
              tao: 0.08,
              dissuadeHubs: true,
              barnesHut: true,
              prune: false,
            },
        behaviors: ["drag-canvas", "zoom-canvas", "drag-element", "click-select"],
        node: {
          type: "circle",
          state: {
            selected: {
              halo: true,
              haloStroke: "#c9863d",
              haloLineWidth: 10,
              haloStrokeOpacity: 0.18,
            },
          },
        },
        edge: {
          type: "line",
          state: {
            selected: {
              stroke: "#c9863d",
              lineWidth: 3,
            },
          },
        },
      });

      instance.on(NodeEvent.CLICK, (event: unknown) => {
        const nodeId = String((event as { target?: { id?: string } }).target?.id ?? "");
        const node = graph.nodes.find((item) => item.id === nodeId);

        // 点击节点时右侧详情切换到节点信息，并让 G6 选中态负责视觉高亮。
        if (node) {
          setSelectedNode(node);
          setSelectedEdge(null);
        }
      });

      instance.on(EdgeEvent.CLICK, (event: unknown) => {
        const edgeId = String((event as { target?: { id?: string } }).target?.id ?? "");
        const edge = graph.edges.find((item) => item.id === edgeId);

        // 点击边时保留业务边对象，右侧面板展示关系语义和描述。
        if (edge) {
          setSelectedEdge(edge);
          setSelectedNode(null);
        }
      });

      instance.on(CanvasEvent.CLICK, () => {
        // 点击画布空白处清空详情选择，避免用户误以为仍在编辑某个节点或边。
        setSelectedNode(null);
        setSelectedEdge(null);
      });

      await instance.render();
      // force 是迭代布局，渲染完成后显式停止，保证全量图谱不会持续游动。
      if (graph.mode === "FULL") {
        instance.stopLayout();
      }
      g6GraphRef.current = instance;

      if (disposed) {
        instance.destroy();
      }
    }

    void renderG6Graph().catch((error) => {
      message.error(error instanceof Error ? error.message : "G6 图谱渲染失败");
    });

    return () => {
      disposed = true;
      g6GraphRef.current?.destroy();
      g6GraphRef.current = null;
    };
  }, [graph]);

  const graphSummary = useMemo(() => getGraphSummary(graph), [graph]);

  function clearGraphCanvas() {
    // 重新查询前先销毁旧 G6 实例并清空详情，避免旧图在新请求加载期间继续显示或残留事件。
    g6GraphRef.current?.destroy();
    g6GraphRef.current = null;
    setGraph(null);
    setSelectedNode(null);
    setSelectedEdge(null);
  }

  async function searchEntities(keyword: string) {
    // 下拉搜索为空时直接清空候选，避免继续保留上一次搜索结果造成误选。
    if (!keyword.trim()) {
      setEntityOptions([]);
      return;
    }
    try {
      const data = await getEntityOptions({ keyword, limit: 20 });
      setEntityOptions(data);
    } catch {
      setEntityOptions([]);
    }
  }

  async function handleVisualQuery(values: Record<string, unknown>) {
    const mode = (values.mode ?? "CENTER") as GraphQueryMode;

    // CENTER 模式必须有中心实体 ID 或名称，提前拦截可避免后端返回 404 后体验割裂。
    if (mode === "CENTER" && !values.centerEntityId && !values.centerEntityName) {
      message.warning("中心实体模式需要输入或选择中心实体");
      return;
    }

    setVisualLoading(true);
    clearGraphCanvas();
    try {
      const data = await getVisualization({
        mode,
        // 按接口文档约束参数作用域，避免模式切换后隐藏字段残留影响后端判断。
        centerEntityId: mode === "CENTER" ? values.centerEntityId : undefined,
        centerEntityName: mode === "CENTER" ? values.centerEntityName : undefined,
        entityTypeCode: values.entityTypeCode,
        relationTypeCode: values.relationTypeCode,
        level: mode === "CENTER" ? values.level : undefined,
        nodeLimit: values.nodeLimit,
        edgeLimit: values.edgeLimit,
        includeIsolated: mode === "FULL" ? values.includeIsolated : undefined,
      });
      setGraph(data);
      setSelectedNode(data.center ?? data.nodes.find((node) => node.id === getCenterEntityId(data)) ?? data.nodes[0] ?? null);
      setSelectedEdge(null);

      if (data.truncated) {
        message.warning("当前图谱数据较多，仅展示部分结果，可通过筛选或提高限制重新查询");
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : "图谱数据加载失败");
    } finally {
      setVisualLoading(false);
    }
  }

  async function handlePathHighlight() {
    const sourceEntityId = form.getFieldValue("pathSourceEntityId");
    const targetEntityId = form.getFieldValue("pathTargetEntityId");
    // 路径查询必须有明确起点和终点，否则后端无法给出有效路径。
    if (!sourceEntityId || !targetEntityId) {
      message.warning("请选择路径起点和终点实体");
      return;
    }
    setPathLoading(true);
    clearGraphCanvas();
    try {
      const data = await getPathData({ sourceEntityId, targetEntityId, maxDepth: 4 });
      setGraph({
        mode: "CENTER",
        center: data.nodes[0] ?? null,
        centerEntityId: data.nodes[0]?.id ?? "",
        returnedNodeCount: data.nodes.length,
        returnedEdgeCount: data.edges.length,
        nodes: data.nodes,
        edges: data.edges,
      });
      setSelectedNode(data.nodes[0] ?? null);
      setSelectedEdge(null);
      message.success("路径结果已使用 G6 高亮展示");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "路径查询失败");
    } finally {
      setPathLoading(false);
    }
  }

  return (
    <Card className="page-card" bordered={false}>
      <section className="page-hero">
        <div className="page-hero__content">
          <div>
            <span className="page-hero__eyebrow">VISUAL ANALYSIS</span>
            <h1>图谱可视化</h1>
            <p>支持全量图谱总览与中心实体子图分析，使用 G6 承载布局、缩放、拖拽和节点关系联动。</p>
          </div>
          <div className="page-hero__tags">
            <Tag color="gold" bordered={false}>G6 引擎</Tag>
            <Tag color="blue" bordered={false}>全量图谱</Tag>
            <Tag color="green" bordered={false}>路径高亮</Tag>
          </div>
        </div>
      </section>

      <section className="graph-visual-layout">
        <Card className="graph-side-card" bordered={false}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              mode: "CENTER",
              level: 1,
              nodeLimit: 1000,
              edgeLimit: 2000,
              includeIsolated: true,
            }}
            onFinish={(values) => void handleVisualQuery(values)}
          >
            <Form.Item label="查询模式" name="mode">
              <Radio.Group block options={graphQueryModeOptions} optionType="button" buttonStyle="solid" />
            </Form.Item>
            {currentGraphMode === "CENTER" ? (
              <>
                <Form.Item label="中心实体名称" name="centerEntityName">
                  <Input placeholder="可直接输入中心实体名称" />
                </Form.Item>
                <Form.Item label="中心实体选择" name="centerEntityId">
                  <Select
                    showSearch
                    allowClear
                    filterOption={false}
                    options={entityOptions.map((item) => ({ label: `${item.label} / ${item.typeName}`, value: item.value }))}
                    onSearch={(value) => void searchEntities(value)}
                    placeholder="搜索实体后选择"
                  />
                </Form.Item>
              </>
            ) : null}
            <Form.Item label="实体类型" name="entityTypeCode">
              <Select allowClear options={options.entityTypes} placeholder="全部实体类型" />
            </Form.Item>
            <Form.Item label="关系类型" name="relationTypeCode">
              <Select allowClear options={options.relationTypes} placeholder="全部关系类型" />
            </Form.Item>
            <Row gutter={12}>
              {currentGraphMode === "CENTER" ? (
                <Col span={12}>
                  <Form.Item label="展开层级" name="level">
                    <Select options={[{ label: "1 跳", value: 1 }, { label: "2 跳", value: 2 }]} />
                  </Form.Item>
                </Col>
              ) : null}
              <Col span={currentGraphMode === "CENTER" ? 12 : 24}>
                <Form.Item label="包含孤立节点" name="includeIsolated" valuePropName="checked">
                  <Switch disabled={currentGraphMode === "CENTER"} checkedChildren="包含" unCheckedChildren="排除" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="节点上限" name="nodeLimit">
                  <InputNumber min={10} max={5000} precision={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="关系上限" name="edgeLimit">
                  <InputNumber min={10} max={10000} precision={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={visualLoading}>
                {currentGraphMode === "CENTER" ? "生成子图" : "加载全量图谱"}
              </Button>
              <Button onClick={() => form.resetFields()}>重置条件</Button>
            </Space>

            <Card className="graph-path-card" size="small" title="路径查询" style={{ marginTop: 18 }}>
              <Form.Item label="起点实体" name="pathSourceEntityId" style={{ marginBottom: 12 }}>
                <Select
                  showSearch
                  allowClear
                  filterOption={false}
                  options={entityOptions.map((item) => ({ label: `${item.label} / ${item.typeName}`, value: item.value }))}
                  onSearch={(value) => void searchEntities(value)}
                />
              </Form.Item>
              <Form.Item label="终点实体" name="pathTargetEntityId" style={{ marginBottom: 14 }}>
                <Select
                  showSearch
                  allowClear
                  filterOption={false}
                  options={entityOptions.map((item) => ({ label: `${item.label} / ${item.typeName}`, value: item.value }))}
                  onSearch={(value) => void searchEntities(value)}
                />
              </Form.Item>
              <Button block icon={<ApartmentOutlined />} loading={pathLoading} onClick={() => void handlePathHighlight()}>
                高亮关系路径
              </Button>
            </Card>
          </Form>
        </Card>

        <Card className="graph-canvas-card" bordered={false}>
          {graph?.nodes?.length ? (
            <div className="graph-canvas graph-canvas--g6">
              <div className="graph-canvas__toolbar">
                <Tag bordered={false} color={graphSummary.mode === "FULL" ? "blue" : "gold"}>
                  {graphSummary.mode === "FULL" ? "全量" : "中心"}
                </Tag>
                <Tag bordered={false} color="blue">
                  节点 {graphSummary.returnedNodeCount}/{graphSummary.totalNodeCount}
                </Tag>
                <Tag bordered={false} color="gold">
                  边 {graphSummary.returnedEdgeCount}/{graphSummary.totalEdgeCount}
                </Tag>
                <Button size="small" icon={<MinusOutlined />} onClick={() => void g6GraphRef.current?.zoomBy(0.86)} />
                <Button size="small" icon={<PlusOutlined />} onClick={() => void g6GraphRef.current?.zoomBy(1.16)} />
                <Button
                  size="small"
                  icon={<RedoOutlined />}
                  onClick={() => {
                    // 复位交给 G6 fitView 处理，保持缩放、平移和布局后的图形都回到可视范围。
                    void g6GraphRef.current?.fitView({ when: "always", direction: "both" }, { duration: 260, easing: "ease-out" });
                  }}
                >
                  复位
                </Button>
              </div>
              {graphSummary.truncated ? (
                <Alert
                  className="graph-truncated-alert"
                  type="warning"
                  showIcon
                  message="当前图谱数据较多，仅展示部分结果"
                />
              ) : null}
              <div ref={containerRef} className="graph-g6-stage" />
            </div>
          ) : (
            <div className="graph-empty">
              <Empty description="加载全量图谱或输入中心实体后生成子图" />
            </div>
          )}
        </Card>

        <Card className="graph-side-card" bordered={false}>
          {selectedNode ? (
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <div className="graph-panel-title">
                <ClusterOutlined />
                <span>节点详情</span>
              </div>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="实体ID">{selectedNode.id}</Descriptions.Item>
                <Descriptions.Item label="实体名称">{selectedNode.name}</Descriptions.Item>
                <Descriptions.Item label="实体类型">{selectedNode.typeName} / {selectedNode.typeCode}</Descriptions.Item>
                <Descriptions.Item label="状态">{selectedNode.status === 1 ? "启用" : "停用"}</Descriptions.Item>
              </Descriptions>
              <div className="graph-info-stats">
                <div>
                  <span>属性字段</span>
                  <strong>{Object.keys(selectedNode.properties || {}).length}</strong>
                </div>
                <div>
                  <span>当前模式</span>
                  <strong>{graphSummary.mode}</strong>
                </div>
              </div>
              <Card size="small" title="扩展属性">
                <pre className="json-block">{JSON.stringify(selectedNode.properties || {}, null, 2)}</pre>
              </Card>
            </Space>
          ) : selectedEdge ? (
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <div className="graph-panel-title">
                <ApartmentOutlined />
                <span>关系详情</span>
              </div>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="关系ID">{selectedEdge.id}</Descriptions.Item>
                <Descriptions.Item label="起点实体">{selectedEdge.source}</Descriptions.Item>
                <Descriptions.Item label="终点实体">{selectedEdge.target}</Descriptions.Item>
                <Descriptions.Item label="关系类型">{selectedEdge.relationTypeName} / {selectedEdge.relationTypeCode}</Descriptions.Item>
                <Descriptions.Item label="描述">{selectedEdge.description || "-"}</Descriptions.Item>
              </Descriptions>
              <Card size="small" title="路径语义">
                <div className="graph-detail-item">
                  <strong>{selectedEdge.source} → {selectedEdge.target}</strong>
                  <span>{selectedEdge.relationTypeName} 关系用于描述上下游知识连接。</span>
                </div>
              </Card>
            </Space>
          ) : (
            <Empty description="点击节点或边查看详情" />
          )}
        </Card>
      </section>
    </Card>
  );
}
