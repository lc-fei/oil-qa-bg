import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";

import type { Route } from "./+types/graph-versions";
import { createVersion, getVersionDetail, getVersionList } from "../services/graph";
import type { GraphVersionItem } from "../types/graph";

export function meta({}: Route.MetaArgs) {
  return [{ title: "图谱版本记录 | 油井工程智能问答系统" }];
}

export default function GraphVersionsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({ pageNum: 1, pageSize: 10 });
  const [list, setList] = useState<GraphVersionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<GraphVersionItem | null>(null);

  useEffect(() => {
    void loadVersions(query);
  }, [query]);

  // 版本页数据结构简单，列表和详情拆分是为了避免首页表格承载过多文本。
  async function loadVersions(params: Record<string, unknown>) {
    setLoading(true);
    try {
      const data = await getVersionList(params);
      setList(data.list);
      setTotal(data.total);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "版本记录加载失败");
    } finally {
      setLoading(false);
    }
  }

  const columns: ColumnsType<GraphVersionItem> = [
    { title: "版本ID", dataIndex: "id", width: 100 },
    { title: "版本号", dataIndex: "versionNo", width: 160, render: (value: string) => <Tag color="blue">{value}</Tag> },
    { title: "版本说明", dataIndex: "versionRemark" },
    { title: "创建人", dataIndex: "createdBy", width: 120 },
    { title: "创建时间", dataIndex: "createdAt", width: 180 },
    {
      title: "操作",
      width: 100,
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            // 详情按需加载，避免版本列表一次性承载完整说明内容。
            void getVersionDetail(record.id).then((data) => {
              setDetail(data);
              setDetailOpen(true);
            });
          }}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <Card className="page-card" bordered={false}>
      <section className="page-hero">
        <div className="page-hero__content">
          <div>
            <span className="page-hero__eyebrow">VERSION LOG</span>
            <h1>图谱版本记录</h1>
            <p>记录导入批次和阶段性图谱变更，用于治理追踪与论文展示。</p>
          </div>
          <div className="page-hero__tags">
            <Tag color="gold" bordered={false}>版本号</Tag>
            <Tag color="blue" bordered={false}>变更说明</Tag>
          </div>
        </div>
      </section>

      <section className="users-section">
        <Card className="users-table-card" bordered={false}>
          <div className="graph-tab-head">
            <div>
              <span className="page-hero__eyebrow">CHANGE HISTORY</span>
              <h3>版本列表</h3>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
              新增版本记录
            </Button>
          </div>
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={list}
            pagination={{
              current: query.pageNum,
              pageSize: query.pageSize,
              total,
              onChange: (pageNum, pageSize) => setQuery({ ...query, pageNum, pageSize }),
            }}
          />
        </Card>
      </section>

      <Modal
        title="新增版本记录"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              // 手动新增版本记录用于补充批量导入之外的阶段性治理说明。
              await createVersion(values);
              message.success("版本记录已创建");
              setModalOpen(false);
              form.resetFields();
              await loadVersions(query);
            } catch (error) {
              message.error(error instanceof Error ? error.message : "版本保存失败");
            }
          }}
        >
          <Form.Item name="versionNo" label="版本号" rules={[{ required: true, message: "请输入版本号" }]}>
            <Input placeholder="例如 v1.0.1" />
          </Form.Item>
          <Form.Item name="versionRemark" label="版本说明" rules={[{ required: true, message: "请输入版本说明" }]}>
            <Input.TextArea rows={4} placeholder="请输入本次图谱更新说明" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer title="版本详情" width={520} open={detailOpen} onClose={() => setDetailOpen(false)}>
        {detail ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="版本ID">{detail.id}</Descriptions.Item>
            <Descriptions.Item label="版本号">{detail.versionNo}</Descriptions.Item>
            <Descriptions.Item label="版本说明">{detail.versionRemark}</Descriptions.Item>
            <Descriptions.Item label="创建人">{detail.createdBy}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{detail.createdAt}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Drawer>
    </Card>
  );
}
