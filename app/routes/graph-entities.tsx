import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";

import type { Route } from "./+types/graph-entities";
import {
  buildEntityExportUrl,
  createEntity,
  deleteCheckEntity,
  deleteEntity,
  getEntityDetail,
  getEntityList,
  getEntityRelations,
  getGraphOptions,
  updateEntity,
} from "../services/graph";
import type {
  GraphEntityDetail,
  GraphEntityListItem,
  GraphEntityRelationSummary,
} from "../types/graph";

export function meta({}: Route.MetaArgs) {
  return [{ title: "图谱实体管理 | 油井工程智能问答系统" }];
}

function safeParseJson(value: string | undefined) {
  if (!value?.trim()) {
    return {};
  }

  return JSON.parse(value) as Record<string, string>;
}

function stringifyJson(value?: Record<string, string>) {
  return value && Object.keys(value).length ? JSON.stringify(value, null, 2) : "";
}

export default function GraphEntitiesPage() {
  const [searchForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [query, setQuery] = useState({ pageNum: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<GraphEntityListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [entityTypes, setEntityTypes] = useState<Array<{ value: string; label: string }>>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentDetail, setCurrentDetail] = useState<GraphEntityDetail | null>(null);
  const [relationSummary, setRelationSummary] = useState<GraphEntityRelationSummary[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void loadOptions();
  }, []);

  useEffect(() => {
    void loadList(query);
  }, [query]);

  async function loadOptions() {
    try {
      const data = await getGraphOptions();
      setEntityTypes(data.entityTypes);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "图谱选项加载失败");
    }
  }

  async function loadList(params: Record<string, unknown>) {
    setLoading(true);
    try {
      const data = await getEntityList(params);
      setList(data.list);
      setTotal(data.total);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "实体列表加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(id: string) {
    try {
      const [detail, relations] = await Promise.all([
        getEntityDetail(id),
        getEntityRelations(id, { direction: "all", pageNum: 1, pageSize: 6 }),
      ]);
      setCurrentDetail(detail);
      setRelationSummary(relations.list);
      setDetailOpen(true);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "实体详情加载失败");
    }
  }

  async function openEditor(record?: GraphEntityListItem) {
    setEditingId(record?.id ?? null);
    setDrawerOpen(true);
    editForm.resetFields();

    if (!record) {
      editForm.setFieldsValue({ status: 1, propertiesText: "" });
      return;
    }

    try {
      const detail = await getEntityDetail(record.id);
      editForm.setFieldsValue({
        name: detail.name,
        typeCode: detail.typeCode,
        description: detail.description,
        source: detail.source,
        status: detail.status,
        propertiesText: stringifyJson(detail.properties),
      });
    } catch (error) {
      message.error(error instanceof Error ? error.message : "实体详情加载失败");
    }
  }

  async function handleDelete(id: string) {
    try {
      const check = await deleteCheckEntity(id);
      if (!check.canDelete) {
        message.warning(check.message);
        return;
      }

      await deleteEntity(id);
      message.success("实体已删除");
      await loadList(query);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "实体删除失败");
    }
  }

  const columns: ColumnsType<GraphEntityListItem> = [
    { title: "实体ID", dataIndex: "id", width: 140 },
    {
      title: "实体名称",
      dataIndex: "name",
      width: 160,
      render: (value: string, record) => (
        <button className="graph-link" type="button" onClick={() => void openDetail(record.id)}>
          {value}
        </button>
      ),
    },
    {
      title: "类型",
      key: "type",
      width: 160,
      render: (_, record) => (
        <div className="user-cell">
          <strong>{record.typeName}</strong>
          <span>{record.typeCode}</span>
        </div>
      ),
    },
    { title: "描述", dataIndex: "description", ellipsis: true },
    { title: "来源", dataIndex: "source", width: 120 },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (value: number) =>
        value === 1 ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>,
    },
    { title: "关联数", dataIndex: "relationCount", width: 100 },
    { title: "更新时间", dataIndex: "updatedAt", width: 170 },
    {
      title: "操作",
      key: "action",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => void openDetail(record.id)}>
            详情
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => void openEditor(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除该实体吗？"
            onConfirm={() => void handleDelete(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const exportUrl = buildEntityExportUrl(searchForm.getFieldsValue());

  return (
    <Card className="page-card" bordered={false}>
      <section className="page-hero">
        <div className="page-hero__content">
          <div>
            <span className="page-hero__eyebrow">ENTITY GOVERNANCE</span>
            <h1>图谱实体管理</h1>
            <p>围绕实体录入、详情查看、属性维护和删除前关系校验构建核心治理页面。</p>
          </div>
          <div className="page-hero__tags">
            <Tag color="gold" bordered={false}>删除前校验</Tag>
            <Tag color="blue" bordered={false}>属性 JSON</Tag>
            <Tag color="green" bordered={false}>联调就绪</Tag>
          </div>
        </div>
      </section>

      <section className="users-section">
        <Card className="users-toolbar" bordered={false}>
          <Form form={searchForm} layout="vertical" onFinish={(values) => setQuery({ ...values, pageNum: 1, pageSize: query.pageSize })}>
            <Row gutter={[16, 4]}>
              <Col xs={24} md={8}>
                <Form.Item label="实体名称" name="name">
                  <Input allowClear placeholder="按实体名称模糊查询" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="实体类型" name="typeCode">
                  <Select allowClear placeholder="全部类型" options={entityTypes} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="状态" name="status">
                  <Select
                    allowClear
                    placeholder="全部状态"
                    options={[
                      { label: "启用", value: 1 },
                      { label: "停用", value: 0 },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <div className="users-toolbar__actions">
              <Space wrap>
                <Button type="primary" htmlType="submit">查询实体</Button>
                <Button onClick={() => { searchForm.resetFields(); setQuery({ pageNum: 1, pageSize: 10 }); }}>重置</Button>
                <Button icon={<DownloadOutlined />} href={exportUrl} target="_blank">
                  导出实体
                </Button>
              </Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => void openEditor()}>
                新增实体
              </Button>
            </div>
          </Form>
        </Card>

        <Card className="users-table-card" bordered={false}>
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={list}
            scroll={{ x: 1280 }}
            pagination={{
              current: query.pageNum,
              pageSize: query.pageSize,
              total,
              showSizeChanger: true,
              showTotal: (count) => `共 ${count} 条`,
              onChange: (pageNum, pageSize) => setQuery((prev) => ({ ...prev, pageNum, pageSize })),
            }}
          />
        </Card>
      </section>

      <Drawer
        title={editingId ? "编辑实体" : "新增实体"}
        width={560}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" loading={submitting} onClick={() => void editForm.submit()}>
              保存
            </Button>
          </Space>
        }
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={async (values) => {
            setSubmitting(true);
            try {
              const payload = {
                name: values.name,
                typeCode: values.typeCode,
                description: values.description,
                source: values.source,
                status: values.status,
                properties: safeParseJson(values.propertiesText),
              };
              if (editingId) {
                await updateEntity(editingId, payload);
                message.success("实体已更新");
              } else {
                await createEntity(payload);
                message.success("实体已创建");
              }
              setDrawerOpen(false);
              await loadList(query);
            } catch (error) {
              message.error(error instanceof Error ? error.message : "实体保存失败");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <Form.Item name="name" label="实体名称" rules={[{ required: true, message: "请输入实体名称" }]}>
            <Input placeholder="例如 YJ-001" />
          </Form.Item>
          <Form.Item name="typeCode" label="实体类型" rules={[{ required: true, message: "请选择实体类型" }]}>
            <Select options={entityTypes} placeholder="请选择实体类型" />
          </Form.Item>
          <Form.Item name="description" label="实体描述">
            <Input.TextArea rows={3} placeholder="请输入实体描述" />
          </Form.Item>
          <Form.Item name="source" label="数据来源">
            <Input placeholder="例如 人工录入 / 批量导入" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select options={[{ label: "启用", value: 1 }, { label: "停用", value: 0 }]} />
          </Form.Item>
          <Form.Item
            name="propertiesText"
            label="扩展属性 JSON"
            rules={[{
              validator: (_, value) => {
                if (!value?.trim()) return Promise.resolve();
                try {
                  JSON.parse(value);
                  return Promise.resolve();
                } catch {
                  return Promise.reject(new Error("请输入合法 JSON 对象"));
                }
              },
            }]}
          >
            <Input.TextArea rows={8} placeholder={'{\n  "wellDepth": "3200",\n  "unit": "m"\n}'} />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title="实体详情"
        width={620}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      >
        {currentDetail ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="实体ID">{currentDetail.id}</Descriptions.Item>
              <Descriptions.Item label="实体名称">{currentDetail.name}</Descriptions.Item>
              <Descriptions.Item label="类型">{currentDetail.typeName} / {currentDetail.typeCode}</Descriptions.Item>
              <Descriptions.Item label="描述">{currentDetail.description || "-"}</Descriptions.Item>
              <Descriptions.Item label="来源">{currentDetail.source || "-"}</Descriptions.Item>
              <Descriptions.Item label="状态">{currentDetail.status === 1 ? "启用" : "停用"}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{currentDetail.createdAt}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{currentDetail.updatedAt}</Descriptions.Item>
            </Descriptions>
            <Card size="small" title="扩展属性">
              {Object.keys(currentDetail.properties || {}).length ? (
                <div className="graph-property-grid">
                  {Object.entries(currentDetail.properties).map(([key, value]) => (
                    <div className="graph-property-card" key={key}>
                      <span>{key}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="json-block">{"{}"}</pre>
              )}
            </Card>
            <Card size="small" title="关联关系摘要">
              <div className="graph-info-stats" style={{ marginBottom: 12 }}>
                <div>
                  <span>关联关系数</span>
                  <strong>{relationSummary.length}</strong>
                </div>
                <div>
                  <span>当前状态</span>
                  <strong>{currentDetail.status === 1 ? "启用" : "停用"}</strong>
                </div>
              </div>
              <div className="graph-detail-list">
                {relationSummary.length ? relationSummary.map((item) => (
                  <div className="graph-detail-item" key={item.id}>
                    <strong>{item.sourceEntityName} {item.relationTypeName} {item.targetEntityName}</strong>
                    <span>{item.description || item.relationTypeCode}</span>
                  </div>
                )) : "暂无关联关系摘要"}
              </div>
            </Card>
          </Space>
        ) : null}
      </Drawer>
    </Card>
  );
}
