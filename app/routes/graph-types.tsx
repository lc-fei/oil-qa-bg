import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";

import type { Route } from "./+types/graph-types";
import {
  createEntityType,
  createRelationType,
  getEntityTypeList,
  getRelationTypeList,
  updateEntityType,
  updateEntityTypeStatus,
  updateRelationType,
  updateRelationTypeStatus,
} from "../services/graph";
import type { GraphTypeItem } from "../types/graph";

export function meta({}: Route.MetaArgs) {
  return [{ title: "图谱类型管理 | 油井工程智能问答系统" }];
}

export default function GraphTypesPage() {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("entity");
  const [entityTypes, setEntityTypes] = useState<GraphTypeItem[]>([]);
  const [relationTypes, setRelationTypes] = useState<GraphTypeItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GraphTypeItem | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      const [entityData, relationData] = await Promise.all([
        getEntityTypeList(),
        getRelationTypeList(),
      ]);
      setEntityTypes(entityData);
      setRelationTypes(relationData);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "类型数据加载失败");
    }
  }

  function openModal(record?: GraphTypeItem) {
    setEditingRecord(record ?? null);
    setModalOpen(true);
    form.resetFields();
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.setFieldsValue({ status: 1, sortNo: 1 });
    }
  }

  const columns: ColumnsType<GraphTypeItem> = [
    { title: "类型ID", dataIndex: "id", width: 90 },
    {
      title: "类型信息",
      key: "type",
      width: 220,
      render: (_, record) => (
        <div className="user-cell">
          <strong>{record.typeName}</strong>
          <span>{record.typeCode}</span>
        </div>
      ),
    },
    { title: "描述", dataIndex: "description" },
    { title: "排序", dataIndex: "sortNo", width: 90 },
    {
      title: "状态",
      dataIndex: "status",
      width: 120,
      render: (value: number, record) => (
        <Switch
          checked={value === 1}
          checkedChildren="启用"
          unCheckedChildren="停用"
          onChange={(checked) => {
            const request = activeTab === "entity"
              ? updateEntityTypeStatus(record.id, { status: checked ? 1 : 0 })
              : updateRelationTypeStatus(record.id, { status: checked ? 1 : 0 });
            void request.then(loadData).catch((error: Error) => message.error(error.message));
          }}
        />
      ),
    },
    {
      title: "操作",
      width: 100,
      render: (_, record) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <Card className="page-card" bordered={false}>
      <section className="page-hero">
        <div className="page-hero__content">
          <div>
            <span className="page-hero__eyebrow">TYPE STANDARDIZATION</span>
            <h1>图谱类型管理</h1>
            <p>统一维护实体类型和关系类型字典，为实体录入、关系录入和可视化筛选提供标准约束。</p>
          </div>
          <div className="page-hero__tags">
            <Tag color="gold" bordered={false}>实体类型</Tag>
            <Tag color="blue" bordered={false}>关系类型</Tag>
          </div>
        </div>
      </section>

      <section className="users-section">
        <Card className="users-table-card" bordered={false}>
          <div className="graph-tab-head">
            <div>
              <span className="page-hero__eyebrow">DICTIONARY CONFIG</span>
              <h3>类型字典</h3>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              新增{activeTab === "entity" ? "实体类型" : "关系类型"}
            </Button>
          </div>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "entity",
                label: "实体类型",
                children: <Table rowKey="id" columns={columns} dataSource={entityTypes} pagination={false} />,
              },
              {
                key: "relation",
                label: "关系类型",
                children: <Table rowKey="id" columns={columns} dataSource={relationTypes} pagination={false} />,
              },
            ]}
          />
        </Card>
      </section>

      <Modal
        title={editingRecord ? "编辑类型" : "新增类型"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              if (activeTab === "entity") {
                if (editingRecord) {
                  await updateEntityType(editingRecord.id, values);
                } else {
                  await createEntityType(values);
                }
              } else if (editingRecord) {
                await updateRelationType(editingRecord.id, values);
              } else {
                await createRelationType(values);
              }
              message.success("类型已保存");
              setModalOpen(false);
              await loadData();
            } catch (error) {
              message.error(error instanceof Error ? error.message : "类型保存失败");
            }
          }}
        >
          <Form.Item name="typeName" label="类型名称" rules={[{ required: true, message: "请输入类型名称" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="typeCode" label="类型编码" rules={[{ required: true, message: "请输入类型编码" }]}>
            <Input disabled={Boolean(editingRecord)} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="sortNo" label="排序号">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select options={[{ label: "启用", value: 1 }, { label: "停用", value: 0 }]} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
