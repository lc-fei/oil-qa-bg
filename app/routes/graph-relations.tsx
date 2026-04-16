import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
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

import type { Route } from "./+types/graph-relations";
import {
  buildRelationExportUrl,
  createRelation,
  deleteRelation,
  getEntityOptions,
  getGraphOptions,
  getRelationDetail,
  getRelationList,
  updateRelation,
} from "../services/graph";
import type { GraphEntityOption, GraphRelationListItem } from "../types/graph";

export function meta({}: Route.MetaArgs) {
  return [{ title: "图谱关系管理 | 油井工程智能问答系统" }];
}

export default function GraphRelationsPage() {
  const [searchForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [list, setList] = useState<GraphRelationListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState({ pageNum: 1, pageSize: 10 });
  const [relationTypes, setRelationTypes] = useState<Array<{ value: string; label: string }>>([]);
  const [entityOptions, setEntityOptions] = useState<GraphEntityOption[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    void loadOptions();
  }, []);

  useEffect(() => {
    void loadList(query);
  }, [query]);

  // 关系页需要类型下拉，因此先加载统一图谱选项。
  async function loadOptions() {
    try {
      const data = await getGraphOptions();
      setRelationTypes(data.relationTypes);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "关系类型加载失败");
    }
  }

  async function loadList(params: Record<string, unknown>) {
    setLoading(true);
    try {
      const data = await getRelationList(params);
      setList(data.list);
      setTotal(data.total);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "关系列表加载失败");
    } finally {
      setLoading(false);
    }
  }

  // 关系起点和终点都来自实体检索下拉，这里做按关键字远程搜索。
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

  async function openEditor(record?: GraphRelationListItem) {
    setEditingId(record?.id ?? null);
    setDrawerOpen(true);
    editForm.resetFields();
    if (!record) {
      editForm.setFieldsValue({ status: 1, propertiesText: "" });
      return;
    }

    try {
      const detail = await getRelationDetail(record.id);
      editForm.setFieldsValue({
        sourceEntityId: detail.sourceEntityId,
        targetEntityId: detail.targetEntityId,
        relationTypeCode: detail.relationTypeCode,
        description: detail.description,
        status: detail.status,
        propertiesText: JSON.stringify(detail.properties || {}, null, 2),
      });
      setEntityOptions([
        // 编辑时预置当前两端实体，避免远程搜索候选为空导致表单无法显示。
        {
          value: detail.sourceEntityId,
          label: detail.sourceEntityName,
          typeCode: "",
          typeName: "",
        },
        {
          value: detail.targetEntityId,
          label: detail.targetEntityName,
          typeCode: "",
          typeName: "",
        },
      ]);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "关系详情加载失败");
    }
  }

  const columns: ColumnsType<GraphRelationListItem> = [
    { title: "关系ID", dataIndex: "id", width: 140 },
    {
      title: "起点实体",
      key: "source",
      width: 170,
      render: (_, record) => (
        <div className="user-cell">
          <strong>{record.sourceEntityName}</strong>
          <span>{record.sourceEntityId}</span>
        </div>
      ),
    },
    {
      title: "关系类型",
      key: "relation",
      width: 150,
      render: (_, record) => (
        <div className="user-cell">
          <strong>{record.relationTypeName}</strong>
          <span>{record.relationTypeCode}</span>
        </div>
      ),
    },
    {
      title: "终点实体",
      key: "target",
      width: 170,
      render: (_, record) => (
        <div className="user-cell">
          <strong>{record.targetEntityName}</strong>
          <span>{record.targetEntityId}</span>
        </div>
      ),
    },
    { title: "描述", dataIndex: "description", ellipsis: true },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (value: number) => (value === 1 ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>),
    },
    { title: "更新时间", dataIndex: "updatedAt", width: 170 },
    {
      title: "操作",
      width: 160,
      fixed: "right",
          render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => void openEditor(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该关系吗？" onConfirm={() => void deleteRelation(record.id).then(() => loadList(query))}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const exportUrl = buildRelationExportUrl(searchForm.getFieldsValue());

  return (
    <Card className="page-card" bordered={false}>
      <section className="page-hero">
        <div className="page-hero__content">
          <div>
            <span className="page-hero__eyebrow">RELATION GOVERNANCE</span>
            <h1>图谱关系管理</h1>
            <p>管理实体之间的边关系，支持模糊搜索实体、关系维护和关系导出。</p>
          </div>
          <div className="page-hero__tags">
            <Tag color="gold" bordered={false}>实体搜索选择</Tag>
            <Tag color="blue" bordered={false}>避免重复关系</Tag>
          </div>
        </div>
      </section>

      <section className="users-section">
        <Card className="users-toolbar" bordered={false}>
          <Form form={searchForm} layout="vertical" onFinish={(values) => setQuery({ ...values, pageNum: 1, pageSize: query.pageSize })}>
            <Row gutter={[16, 4]}>
              <Col xs={24} md={8}>
                <Form.Item label="起点实体ID" name="sourceEntityId">
                  <Input allowClear placeholder="输入起点实体ID" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="终点实体ID" name="targetEntityId">
                  <Input allowClear placeholder="输入终点实体ID" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="关系类型" name="relationTypeCode">
                  <Select allowClear options={relationTypes} placeholder="全部关系类型" />
                </Form.Item>
              </Col>
            </Row>
            <div className="users-toolbar__actions">
              <Space wrap>
                <Button type="primary" htmlType="submit">查询关系</Button>
                <Button onClick={() => { searchForm.resetFields(); setQuery({ pageNum: 1, pageSize: 10 }); }}>重置</Button>
                <Button icon={<DownloadOutlined />} href={exportUrl} target="_blank">导出关系</Button>
              </Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => void openEditor()}>
                新增关系
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
            scroll={{ x: 1180 }}
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
        title={editingId ? "编辑关系" : "新增关系"}
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
              // 关系属性仍按 JSON 文本编辑，提交时统一转换成对象结构。
              const payload = {
                sourceEntityId: values.sourceEntityId,
                targetEntityId: values.targetEntityId,
                relationTypeCode: values.relationTypeCode,
                description: values.description,
                status: values.status,
                properties: values.propertiesText?.trim() ? JSON.parse(values.propertiesText) : {},
              };
              if (editingId) {
                await updateRelation(editingId, payload);
                message.success("关系已更新");
              } else {
                await createRelation(payload);
                message.success("关系已创建");
              }
              setDrawerOpen(false);
              await loadList(query);
            } catch (error) {
              message.error(error instanceof Error ? error.message : "关系保存失败");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <Form.Item name="sourceEntityId" label="起点实体" rules={[{ required: true, message: "请选择起点实体" }]}>
            <Select
              showSearch
              filterOption={false}
              options={entityOptions.map((item) => ({ label: `${item.label} / ${item.value}`, value: item.value }))}
              onSearch={(value) => void searchEntities(value)}
              placeholder="搜索并选择起点实体"
              disabled={Boolean(editingId)}
            />
          </Form.Item>
          <Form.Item name="targetEntityId" label="终点实体" rules={[{ required: true, message: "请选择终点实体" }]}>
            <Select
              showSearch
              filterOption={false}
              options={entityOptions.map((item) => ({ label: `${item.label} / ${item.value}`, value: item.value }))}
              onSearch={(value) => void searchEntities(value)}
              placeholder="搜索并选择终点实体"
              disabled={Boolean(editingId)}
            />
          </Form.Item>
          <Form.Item name="relationTypeCode" label="关系类型" rules={[{ required: true, message: "请选择关系类型" }]}>
            <Select options={relationTypes} placeholder="请选择关系类型" />
          </Form.Item>
          <Form.Item name="description" label="关系描述">
            <Input.TextArea rows={3} placeholder="请输入关系描述" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select options={[{ label: "启用", value: 1 }, { label: "停用", value: 0 }]} />
          </Form.Item>
          <Form.Item name="propertiesText" label="扩展属性 JSON">
            <Input.TextArea rows={6} placeholder={'{\n  "source": "人工录入"\n}'} />
          </Form.Item>
        </Form>
      </Drawer>
    </Card>
  );
}
