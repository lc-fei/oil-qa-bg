import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
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
  Switch,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";

import type { Route } from "./+types/users";
import {
  createUser,
  deleteUser,
  getRoleOptions,
  getUserDetail,
  getUserList,
  updateUser,
  updateUserStatus,
} from "../services/user";
import type {
  RoleOption,
  UserDetail,
  UserListItem,
  UserListQuery,
  UserPayload,
} from "../types/user";

export function meta({}: Route.MetaArgs) {
  return [{ title: "用户管理 | 油井工程智能问答系统" }];
}

const initialQuery: UserListQuery = {
  pageNum: 1,
  pageSize: 10,
  username: "",
  account: "",
};

export default function UsersPage() {
  const [searchForm] = Form.useForm<UserListQuery>();
  const [drawerForm] = Form.useForm<UserPayload>();
  const [query, setQuery] = useState<UserListQuery>(initialQuery);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [list, setList] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const roleSelectOptions = useMemo(
    () =>
      roleOptions
        .filter((item) => item.status === 1)
        .map((item) => ({
          label: `${item.roleName} / ${item.roleCode}`,
          value: item.id,
        })),
    [roleOptions],
  );

  async function loadRoles() {
    try {
      const data = await getRoleOptions();
      setRoleOptions(data);
    } catch (error) {
      const text = error instanceof Error ? error.message : "角色列表加载失败";
      message.error(text);
    }
  }

  async function loadUsers(currentQuery: UserListQuery) {
    setLoading(true);

    try {
      const data = await getUserList(currentQuery);
      setList(data.records);
      setTotal(data.total);
    } catch (error) {
      const text = error instanceof Error ? error.message : "用户列表加载失败";
      message.error(text);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRoles();
  }, []);

  useEffect(() => {
    void loadUsers(query);
  }, [query]);

  function handleSearch(values: UserListQuery) {
    setQuery({
      pageNum: 1,
      pageSize: query.pageSize,
      username: values.username?.trim() || undefined,
      account: values.account?.trim() || undefined,
      roleCode: values.roleCode || undefined,
      status: values.status,
    });
  }

  function handleReset() {
    searchForm.resetFields();
    setQuery(initialQuery);
  }

  async function openCreateDrawer() {
    setEditingId(null);
    drawerForm.resetFields();
    drawerForm.setFieldsValue({
      status: 1,
      roleIds: [],
    });
    setDrawerOpen(true);
  }

  async function openEditDrawer(record: UserListItem) {
    setEditingId(record.id);
    setDrawerOpen(true);
    drawerForm.resetFields();

    try {
      const detail: UserDetail = await getUserDetail(record.id);
      drawerForm.setFieldsValue({
        username: detail.username,
        account: detail.account,
        phone: detail.phone || undefined,
        email: detail.email || undefined,
        roleIds: detail.roleIds,
        status: detail.status,
      });
    } catch (error) {
      const text = error instanceof Error ? error.message : "用户详情加载失败";
      message.error(text);
    }
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingId(null);
    drawerForm.resetFields();
  }

  async function handleSubmit(values: UserPayload & { password?: string }) {
    setSubmitting(true);

    const payload: UserPayload = {
      username: values.username.trim(),
      account: values.account?.trim(),
      password: values.password,
      phone: values.phone?.trim(),
      email: values.email?.trim(),
      roleIds: values.roleIds,
      status: values.status,
    };

    try {
      if (editingId) {
        await updateUser(editingId, payload);
        message.success("用户信息已更新");
      } else {
        await createUser(payload);
        message.success("用户创建成功");
      }

      closeDrawer();
      await loadUsers(query);
    } catch (error) {
      const text = error instanceof Error ? error.message : "提交失败";
      message.error(text);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteUser(id);
      message.success("用户已删除");
      await loadUsers(query);
    } catch (error) {
      const text = error instanceof Error ? error.message : "删除失败";
      message.error(text);
    }
  }

  async function handleStatusChange(record: UserListItem, checked: boolean) {
    try {
      await updateUserStatus(record.id, { status: checked ? 1 : 0 });
      message.success(checked ? "用户已启用" : "用户已禁用");
      await loadUsers(query);
    } catch (error) {
      const text = error instanceof Error ? error.message : "状态更新失败";
      message.error(text);
    }
  }

  const columns: ColumnsType<UserListItem> = [
    {
      title: "用户信息",
      key: "user",
      width: 220,
      render: (_, record) => (
        <div className="user-cell">
          <strong>{record.username}</strong>
          <span>{record.account}</span>
        </div>
      ),
    },
    {
      title: "联系方式",
      key: "contact",
      width: 240,
      render: (_, record) => (
        <div className="user-cell">
          <strong>{record.phone || "-"}</strong>
          <span>{record.email || "-"}</span>
        </div>
      ),
    },
    {
      title: "权限配置",
      dataIndex: "roles",
      key: "roles",
      width: 180,
      render: (roles: string[]) => (
        <Space wrap>
          {roles.length ? roles.map((role) => <Tag key={role}>{role}</Tag>) : "-"}
        </Space>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: number, record) => (
        <Switch
          checked={status === 1}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          onChange={(checked) => {
            void handleStatusChange(record, checked);
          }}
        />
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
    },
    {
      title: "最后登录",
      dataIndex: "lastLoginAt",
      key: "lastLoginAt",
      width: 180,
      render: (value: string | null) => value || "-",
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              void openEditDrawer(record);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除该用户吗？"
            description="删除后不可恢复，请谨慎操作。"
            okText="删除"
            cancelText="取消"
            onConfirm={() => {
              void handleDelete(record.id);
            }}
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card className="page-card" bordered={false}>
      <section className="page-hero">
        <div className="page-hero__content">
          <div>
            <span className="page-hero__eyebrow">USER CONTROL CENTER</span>
            <h1>用户管理</h1>
            <p>
              统一管理后台用户账号、权限配置和账号状态。页面按接口文档整合为一个模块，角色不再单独作为导航页面出现，只保留为用户编辑时的权限配置来源。
            </p>
          </div>
          <div className="page-hero__tags">
            <Tag bordered={false} color="gold">
              支持筛选
            </Tag>
            <Tag bordered={false} color="blue">
              权限配置
            </Tag>
            <Tag bordered={false} color="green">
              接口联调
            </Tag>
          </div>
        </div>
      </section>

      <section className="users-section">
        <Card className="users-toolbar" bordered={false}>
          <Form<UserListQuery> form={searchForm} layout="vertical" onFinish={handleSearch}>
            <Row gutter={[16, 4]}>
              <Col xs={24} sm={12} lg={6}>
                <Form.Item label="用户名称" name="username">
                  <Input placeholder="按用户名称筛选" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Form.Item label="登录账号" name="account">
                  <Input placeholder="按登录账号筛选" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Form.Item label="角色编码" name="roleCode">
                  <Select
                    placeholder="全部角色"
                    allowClear
                    options={roleOptions.map((item) => ({
                      label: `${item.roleName} / ${item.roleCode}`,
                      value: item.roleCode,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Form.Item label="账号状态" name="status">
                  <Select
                    placeholder="全部状态"
                    allowClear
                    options={[
                      { label: "启用", value: 1 },
                      { label: "禁用", value: 0 },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <div className="users-toolbar__actions">
              <Space wrap>
                <Button htmlType="submit" type="primary">
                  查询用户
                </Button>
                <Button onClick={handleReset}>重置条件</Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    void loadUsers(query);
                  }}
                >
                  刷新列表
                </Button>
              </Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  void openCreateDrawer();
                }}
              >
                新增用户
              </Button>
            </div>
          </Form>
        </Card>

        <Card className="users-table-card" bordered={false}>
          <Table<UserListItem>
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={list}
            scroll={{ x: 1200 }}
            pagination={{
              current: query.pageNum,
              pageSize: query.pageSize,
              total,
              showSizeChanger: true,
              showTotal: (count) => `共 ${count} 条`,
              onChange: (pageNum, pageSize) => {
                setQuery((prev) => ({
                  ...prev,
                  pageNum,
                  pageSize,
                }));
              },
            }}
          />
        </Card>
      </section>

      <Drawer
        title={editingId ? "编辑用户" : "新增用户"}
        width={520}
        open={drawerOpen}
        onClose={closeDrawer}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={closeDrawer}>取消</Button>
            <Button
              type="primary"
              loading={submitting}
              onClick={() => {
                void drawerForm.submit();
              }}
            >
              保存
            </Button>
          </Space>
        }
      >
        <Form<UserPayload & { password?: string }>
          form={drawerForm}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: 1, roleIds: [] }}
        >
          <Form.Item
            label="用户名称"
            name="username"
            rules={[{ required: true, message: "请输入用户名称" }]}
          >
            <Input placeholder="请输入用户名称" />
          </Form.Item>

          <Form.Item
            label="登录账号"
            name="account"
            rules={[
              { required: !editingId, message: "请输入登录账号" },
              { whitespace: true, message: "登录账号不能为空白字符" },
            ]}
          >
            <Input placeholder="请输入登录账号" disabled={Boolean(editingId)} />
          </Form.Item>

          {!editingId ? (
            <Form.Item
              label="初始密码"
              name="password"
              rules={[{ required: true, message: "请输入初始密码" }]}
            >
              <Input.Password placeholder="请输入初始密码" />
            </Form.Item>
          ) : null}

          <Form.Item
            label="手机号"
            name="phone"
            rules={[{ pattern: /^1\d{10}$/, message: "请输入正确的手机号", warningOnly: true }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[{ type: "email", message: "请输入正确的邮箱地址" }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            label="权限配置"
            name="roleIds"
            rules={[{ required: true, message: "请至少选择一个角色" }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择角色"
              options={roleSelectOptions}
            />
          </Form.Item>

          <Form.Item label="账号状态" name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "启用", value: 1 },
                { label: "禁用", value: 0 },
              ]}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </Card>
  );
}
