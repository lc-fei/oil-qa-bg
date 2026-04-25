import {
  DownloadOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Upload,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import { useEffect, useState } from "react";

import type { Route } from "./+types/graph-import";
import {
  downloadGraphTemplate,
  getImportTaskDetail,
  getImportTaskList,
  importGraphData,
} from "../services/graph";
import type { GraphImportTask, GraphImportTaskDetail, GraphImportType } from "../types/graph";

const importTypeOptions: Array<{ label: string; value: GraphImportType }> = [
  { label: "实体导入", value: "entity" },
  { label: "关系导入", value: "relation" },
];

const templateButtonText: Record<GraphImportType, string> = {
  entity: "下载实体模板",
  relation: "下载关系模板",
};

export function meta({}: Route.MetaArgs) {
  return [{ title: "图谱导入任务 | 油井工程智能问答系统" }];
}

export default function GraphImportPage() {
  const [form] = Form.useForm();
  const watchedImportType = Form.useWatch("importType", form) as GraphImportType | undefined;
  const selectedImportType = watchedImportType ?? "entity";
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState({ pageNum: 1, pageSize: 10 });
  const [list, setList] = useState<GraphImportTask[]>([]);
  const [total, setTotal] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<GraphImportTaskDetail | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState<GraphImportType | null>(null);

  useEffect(() => {
    void loadTasks(query);
  }, [query]);

  // 导入任务列表既用于回看历史，也用于追踪当前提交的批量导入结果。
  async function loadTasks(params: Record<string, unknown>) {
    setLoading(true);
    try {
      const data = await getImportTaskList(params);
      setList(data.list);
      setTotal(data.total);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "导入任务加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleTemplateDownload(templateType: GraphImportType) {
    setDownloadingTemplate(templateType);
    try {
      // 模板下载同样属于受保护接口，必须通过 axios 携带 token。
      await downloadGraphTemplate(templateType);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "模板下载失败");
    } finally {
      setDownloadingTemplate(null);
    }
  }

  const columns: ColumnsType<GraphImportTask> = [
    { title: "任务号", dataIndex: "taskId", width: 100 },
    { title: "文件名", dataIndex: "fileName", width: 220, ellipsis: true },
    { title: "导入类型", dataIndex: "importType", width: 120 },
    {
      title: "状态",
      dataIndex: "status",
      width: 120,
      render: (value: string) => <Tag color={value === "SUCCESS" ? "green" : value === "FAILED" ? "red" : "blue"}>{value}</Tag>,
    },
    { title: "成功数", dataIndex: "successCount", width: 100 },
    { title: "失败数", dataIndex: "failCount", width: 100 },
    { title: "创建时间", dataIndex: "createdAt", width: 180 },
    { title: "完成时间", dataIndex: "finishedAt", width: 180, render: (value: string) => value || "-" },
    {
      title: "操作",
      width: 100,
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => void getImportTaskDetail(record.taskId).then((data) => { setDetail(data); setDetailOpen(true); })}
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
            <span className="page-hero__eyebrow">IMPORT PIPELINE</span>
            <h1>图谱导入任务</h1>
            <p>支持模板下载、文件上传、版本备注填写和导入任务结果追踪。</p>
          </div>
          <div className="page-hero__tags">
            <Tag color="gold" bordered={false}>模板下载</Tag>
            <Tag color="blue" bordered={false}>任务追踪</Tag>
          </div>
        </div>
      </section>

      <section className="users-section">
        <Card className="users-toolbar" bordered={false}>
          <Form
            form={form}
            layout="vertical"
            onFinish={async (values) => {
              // 上传接口要求 multipart/form-data，这里手动组装 FormData。
              if (!selectedFile) {
                message.warning("请先选择导入文件");
                return;
              }
              setUploading(true);
              try {
                const payload = new FormData();
                payload.append("file", selectedFile);
                payload.append("importType", values.importType);
                // 版本说明是可选治理字段，有值时再附带给后端。
                if (values.versionRemark) payload.append("versionRemark", values.versionRemark);
                await importGraphData(payload);
                message.success("导入任务已提交");
                setFileList([]);
                setSelectedFile(null);
                form.resetFields(["versionRemark"]);
                await loadTasks(query);
              } catch (error) {
                message.error(error instanceof Error ? error.message : "导入提交失败");
              } finally {
                setUploading(false);
              }
            }}
            initialValues={{ importType: "entity" }}
          >
            <Row gutter={[16, 4]}>
              <Col xs={24} md={8}>
                <Form.Item label="导入类型" name="importType" rules={[{ required: true }]}>
                  <Select options={importTypeOptions} />
                </Form.Item>
              </Col>
              <Col xs={24} md={16}>
                <Form.Item label="版本说明" name="versionRemark">
                  <Input placeholder="可选，记录本次导入版本说明" />
                </Form.Item>
              </Col>
            </Row>
            <Alert
              showIcon
              type="info"
              style={{ marginBottom: 16 }}
              message="当前接口建议上传 CSV 文件；关系导入通过起点/终点实体名称匹配，请确保实体名称已存在且全局唯一。"
            />
            <div className="graph-upload-box">
              <Upload
                accept=".csv"
                beforeUpload={(file) => {
                  // 单独保存原始 File，确保 FormData 使用后端要求的 file 字段上传真实文件对象。
                  setSelectedFile(file);
                  setFileList([file as UploadFile]);
                  return false;
                }}
                fileList={fileList}
                onRemove={() => {
                  setFileList([]);
                  setSelectedFile(null);
                }}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>选择 CSV 文件</Button>
              </Upload>
              <Space wrap>
                {/* 模板下载与当前导入方案保持一一对应，避免用户下载错模板后上传失败。 */}
                <Button
                  icon={<DownloadOutlined />}
                  loading={downloadingTemplate === selectedImportType}
                  onClick={() => void handleTemplateDownload(selectedImportType)}
                >
                  {templateButtonText[selectedImportType]}
                </Button>
                <Button type="primary" loading={uploading} onClick={() => void form.submit()}>
                  提交导入
                </Button>
              </Space>
            </div>
          </Form>
        </Card>

        <Card className="users-table-card" bordered={false}>
          <Table
            rowKey="taskId"
            loading={loading}
            columns={columns}
            dataSource={list}
            scroll={{ x: 1120 }}
            pagination={{
              current: query.pageNum,
              pageSize: query.pageSize,
              total,
              showSizeChanger: true,
              onChange: (pageNum, pageSize) => setQuery({ ...query, pageNum, pageSize }),
            }}
          />
        </Card>
      </section>

      <Drawer title="导入任务详情" width={620} open={detailOpen} onClose={() => setDetailOpen(false)}>
        {detail ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="任务号">{detail.taskId}</Descriptions.Item>
              <Descriptions.Item label="文件名">{detail.fileName}</Descriptions.Item>
              <Descriptions.Item label="导入类型">{detail.importType}</Descriptions.Item>
              <Descriptions.Item label="任务状态">{detail.status}</Descriptions.Item>
              <Descriptions.Item label="总数 / 成功 / 失败">{detail.totalCount} / {detail.successCount} / {detail.failCount}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{detail.createdAt}</Descriptions.Item>
              <Descriptions.Item label="完成时间">{detail.finishedAt || "-"}</Descriptions.Item>
            </Descriptions>
            <Card size="small" title="错误摘要">
              <div className="graph-detail-list">
                {detail.errorRows?.length ? detail.errorRows.map((item) => (
                  <div className="graph-detail-item" key={`${item.rowNum}-${item.reason}`}>
                    <strong>第 {item.rowNum} 行</strong>
                    <span>{item.reason}</span>
                  </div>
                )) : "无错误记录"}
              </div>
            </Card>
          </Space>
        ) : null}
      </Drawer>
    </Card>
  );
}
