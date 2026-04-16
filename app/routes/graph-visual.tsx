import {
  ApartmentOutlined,
  ClusterOutlined,
  DragOutlined,
  MinusOutlined,
  PlusOutlined,
  RedoOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tag,
  message,
} from "antd";
import { useEffect, useMemo, useRef, useState } from "react";

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

interface PositionedNode extends GraphVisualizationNode {
  x: number;
  y: number;
}

export default function GraphVisualPage() {
  const [form] = Form.useForm();
  const [options, setOptions] = useState({ entityTypes: [], relationTypes: [] } as { entityTypes: Array<{ value: string; label: string }>; relationTypes: Array<{ value: string; label: string }> });
  const [entityOptions, setEntityOptions] = useState<GraphEntityOption[]>([]);
  const [graph, setGraph] = useState<GraphVisualizationData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphVisualizationNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphVisualizationEdge | null>(null);
  const [pathLoading, setPathLoading] = useState(false);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [draggingCanvas, setDraggingCanvas] = useState(false);
  const dragStateRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const nodeDragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  useEffect(() => {
    void getGraphOptions().then(setOptions).catch(() => undefined);
  }, []);

  const positioned = useMemo(() => {
    const nodes = graph?.nodes ?? [];
    const centerX = 420;
    const centerY = 250;
    return nodes.map((node, index) => {
      const manual = nodePositions[node.id];
      if (manual) {
        return { ...node, x: manual.x, y: manual.y };
      }
      if (node.id === graph?.centerEntityId) {
        return { ...node, x: centerX, y: centerY };
      }
      const angle = ((index + 1) * Math.PI * 2) / Math.max(nodes.length - 1, 1);
      const radius = nodes.length > 8 ? 220 : 180;
      return {
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    });
  }, [graph, nodePositions]);

  const nodeMap = useMemo(
    () => new Map(positioned.map((item) => [item.id, item])),
    [positioned],
  );

  async function searchEntities(keyword: string) {
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
    try {
      const data = await getVisualization({
        entityId: values.centerEntityId,
        name: values.centerEntityName,
        typeCode: values.entityTypeCode,
        relationTypeCode: values.relationTypeCode,
        level: values.level,
        limit: values.limit,
      });
      setGraph(data);
      setNodePositions({});
      setViewport({ x: 0, y: 0, scale: 1 });
      const center = data.nodes.find((node) => node.id === data.centerEntityId) ?? data.nodes[0] ?? null;
      setSelectedNode(center);
      setSelectedEdge(null);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "图谱数据加载失败");
    }
  }

  async function handlePathHighlight() {
    const sourceEntityId = form.getFieldValue("pathSourceEntityId");
    const targetEntityId = form.getFieldValue("pathTargetEntityId");
    if (!sourceEntityId || !targetEntityId) {
      message.warning("请选择路径起点和终点实体");
      return;
    }
    setPathLoading(true);
    try {
      const data = await getPathData({ sourceEntityId, targetEntityId, maxDepth: 4 });
      setGraph({
        centerEntityId: data.nodes[0]?.id ?? "",
        nodes: data.nodes,
        edges: data.edges,
      });
      setNodePositions({});
      setViewport({ x: 0, y: 0, scale: 1 });
      setSelectedNode(data.nodes[0] ?? null);
      setSelectedEdge(null);
      message.success("路径结果已高亮展示");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "路径查询失败");
    } finally {
      setPathLoading(false);
    }
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const nextScale = viewport.scale + (event.deltaY < 0 ? 0.08 : -0.08);
    setViewport((prev) => ({
      ...prev,
      scale: Math.min(1.8, Math.max(0.55, Number(nextScale.toFixed(2)))),
    }));
  }

  function startCanvasDrag(event: React.MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest(".graph-node")) {
      return;
    }
    setDraggingCanvas(true);
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: viewport.x,
      baseY: viewport.y,
    };
  }

  function startNodeDrag(
    event: React.MouseEvent<HTMLButtonElement>,
    node: PositionedNode,
  ) {
    event.stopPropagation();
    setDraggingNodeId(node.id);
    nodeDragRef.current = {
      id: node.id,
      offsetX: event.clientX,
      offsetY: event.clientY,
    };
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (draggingCanvas && dragStateRef.current) {
      const deltaX = event.clientX - dragStateRef.current.startX;
      const deltaY = event.clientY - dragStateRef.current.startY;
      setViewport((prev) => ({
        ...prev,
        x: dragStateRef.current!.baseX + deltaX,
        y: dragStateRef.current!.baseY + deltaY,
      }));
      return;
    }

    if (draggingNodeId && nodeDragRef.current) {
      const current = nodeMap.get(draggingNodeId);
      if (!current) {
        return;
      }

      const movementX = (event.clientX - nodeDragRef.current.offsetX) / viewport.scale;
      const movementY = (event.clientY - nodeDragRef.current.offsetY) / viewport.scale;

      setNodePositions((prev) => ({
        ...prev,
        [draggingNodeId]: {
          x: current.x + movementX,
          y: current.y + movementY,
        },
      }));

      nodeDragRef.current = {
        id: draggingNodeId,
        offsetX: event.clientX,
        offsetY: event.clientY,
      };
    }
  }

  function stopDrag() {
    setDraggingCanvas(false);
    setDraggingNodeId(null);
    dragStateRef.current = null;
    nodeDragRef.current = null;
  }

  return (
    <Card className="page-card" bordered={false}>
      <section className="page-hero">
        <div className="page-hero__content">
          <div>
            <span className="page-hero__eyebrow">VISUAL ANALYSIS</span>
            <h1>图谱可视化</h1>
            <p>以中心实体逐步展开子图，联动节点与边详情，并支持两点路径查询结果高亮。</p>
          </div>
          <div className="page-hero__tags">
            <Tag color="gold" bordered={false}>中心实体展开</Tag>
            <Tag color="blue" bordered={false}>路径高亮</Tag>
            <Tag color="green" bordered={false}>详情联动</Tag>
          </div>
        </div>
      </section>

      <section className="graph-visual-layout">
        <Card className="graph-side-card" bordered={false}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{ level: 1, limit: 20 }}
            onFinish={(values) => void handleVisualQuery(values)}
          >
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
            <Form.Item label="实体类型" name="entityTypeCode">
              <Select allowClear options={options.entityTypes} placeholder="全部实体类型" />
            </Form.Item>
            <Form.Item label="关系类型" name="relationTypeCode">
              <Select allowClear options={options.relationTypes} placeholder="全部关系类型" />
            </Form.Item>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item label="展开层级" name="level">
                  <Select options={[{ label: "1 跳", value: 1 }, { label: "2 跳", value: 2 }]} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="节点上限" name="limit">
                  <Select options={[10, 20, 30, 50].map((value) => ({ label: `${value}`, value }))} />
                </Form.Item>
              </Col>
            </Row>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>生成图谱</Button>
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
            <div
              className={`graph-canvas ${draggingCanvas ? "graph-canvas--dragging" : ""}`}
              onWheel={handleWheel}
              onMouseDown={startCanvasDrag}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDrag}
              onMouseLeave={stopDrag}
            >
              <div className="graph-canvas__toolbar">
                <Tag bordered={false} color="blue">
                  节点 {graph.nodes.length}
                </Tag>
                <Tag bordered={false} color="gold">
                  边 {graph.edges.length}
                </Tag>
                <Button size="small" icon={<MinusOutlined />} onClick={() => setViewport((prev) => ({ ...prev, scale: Math.max(0.55, Number((prev.scale - 0.1).toFixed(2))) }))} />
                <Button size="small" icon={<PlusOutlined />} onClick={() => setViewport((prev) => ({ ...prev, scale: Math.min(1.8, Number((prev.scale + 0.1).toFixed(2))) }))} />
                <Button size="small" icon={<RedoOutlined />} onClick={() => { setViewport({ x: 0, y: 0, scale: 1 }); setNodePositions({}); }}>
                  复位
                </Button>
              </div>

              <div
                className="graph-stage"
                style={{
                  transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
                }}
              >
                <svg className="graph-svg" viewBox="0 0 840 520">
                  {graph.edges.map((edge) => {
                    const source = nodeMap.get(edge.source);
                    const target = nodeMap.get(edge.target);
                    if (!source || !target) return null;
                    return (
                      <g key={edge.id} onClick={() => { setSelectedEdge(edge); setSelectedNode(null); }}>
                        <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} className={`graph-line ${selectedEdge?.id === edge.id ? "graph-line--active" : ""}`} />
                        <text
                          x={(source.x + target.x) / 2}
                          y={(source.y + target.y) / 2 - 8}
                          textAnchor="middle"
                          className="graph-edge-label"
                        >
                          {edge.relationTypeName}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                {positioned.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    className={`graph-node ${graph.centerEntityId === node.id ? "graph-node--center" : ""} ${selectedNode?.id === node.id ? "graph-node--active" : ""}`}
                    style={{ left: node.x, top: node.y }}
                    onMouseDown={(event) => startNodeDrag(event, node)}
                    onClick={() => { setSelectedNode(node); setSelectedEdge(null); }}
                  >
                    <span>{node.typeName}</span>
                    <strong>{node.name}</strong>
                    <em><DragOutlined /> 拖拽</em>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="graph-empty">
              <Empty description="输入中心实体后生成图谱子图" />
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
                  <span>画布位置</span>
                  <strong>{nodeMap.get(selectedNode.id)?.x?.toFixed(0)} / {nodeMap.get(selectedNode.id)?.y?.toFixed(0)}</strong>
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
