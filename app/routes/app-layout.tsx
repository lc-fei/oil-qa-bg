import {
  CloudUploadOutlined,
  BarChartOutlined,
  ClusterOutlined,
  DashboardOutlined,
  PartitionOutlined,
  NodeIndexOutlined,
  TeamOutlined,
  TagsOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Breadcrumb,
  Button,
  Dropdown,
  Layout,
  Menu,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import type { MenuProps } from "antd";
import { useEffect, useMemo } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

import { useAppStore } from "../stores/app-store";
import { useAuthStore } from "../stores/auth-store";

const { Header, Sider, Content } = Layout;

// 左侧导航在这里统一定义，保证菜单、路由和面包屑命名保持同源。
const menuItems = [
  {
    key: "/",
    icon: <DashboardOutlined />,
    label: <Link to="/">首页总览</Link>,
  },
  {
    key: "/users",
    icon: <TeamOutlined />,
    label: <Link to="/users">用户管理</Link>,
  },
  {
    key: "graph",
    icon: <ClusterOutlined />,
    label: "知识图谱",
    children: [
      {
        key: "/graph/entities",
        icon: <NodeIndexOutlined />,
        label: <Link to="/graph/entities">实体管理</Link>,
      },
      {
        key: "/graph/relations",
        icon: <PartitionOutlined />,
        label: <Link to="/graph/relations">关系管理</Link>,
      },
      {
        key: "/graph/types",
        icon: <TagsOutlined />,
        label: <Link to="/graph/types">类型管理</Link>,
      },
      {
        key: "/graph/import",
        icon: <CloudUploadOutlined />,
        label: <Link to="/graph/import">导入任务</Link>,
      },
      {
        key: "/graph/versions",
        icon: <HistoryOutlined />,
        label: <Link to="/graph/versions">版本记录</Link>,
      },
      {
        key: "/graph/visual",
        icon: <ClusterOutlined />,
        label: <Link to="/graph/visual">图谱可视化</Link>,
      },
    ],
  },
  {
    key: "/monitor",
    icon: <BarChartOutlined />,
    label: <Link to="/monitor">运行监控</Link>,
  },
];

// 面包屑文案单独维护，避免在渲染逻辑里散落硬编码字符串。
const breadcrumbNameMap: Record<string, string> = {
  "/": "首页总览",
  "/users": "用户管理",
  "/graph/entities": "图谱实体管理",
  "/graph/relations": "图谱关系管理",
  "/graph/types": "图谱类型管理",
  "/graph/import": "图谱导入任务",
  "/graph/versions": "图谱版本记录",
  "/graph/visual": "图谱可视化",
  "/monitor": "运行监控",
};

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { collapsed, toggleCollapsed } = useAppStore();
  const authStore = useAuthStore();

  useEffect(() => {
    // 布局层负责兜底恢复登录态，避免用户直接访问深层页面时出现空白状态。
    authStore.bootstrap().catch(() => undefined);
  }, [authStore]);

  useEffect(() => {
    // 未认证用户一律打回登录页，防止受保护路由直接暴露。
    if (authStore.initialized && !authStore.isAuthenticated) {
      void navigate("/login", { replace: true });
    }
  }, [authStore.initialized, authStore.isAuthenticated, navigate]);

  const selectedKeys = useMemo(() => {
    // 图谱模块采用多子路由结构，选中态直接按当前 pathname 对齐即可。
    if (location.pathname.startsWith("/graph/")) {
      return [location.pathname];
    }

    return [location.pathname];
  }, [location.pathname]);

  const breadcrumbItems = useMemo(() => {
    const pathname =
      location.pathname === "/" ? ["/"] : location.pathname.split("/").filter(Boolean);

    if (location.pathname === "/") {
      return [{ title: "首页总览" }];
    }

    return pathname.map((_, index) => {
      // 面包屑通过路径逐级回放生成，便于后续继续扩展多层路由。
      const current = `/${pathname.slice(0, index + 1).join("/")}`;
      return {
        title: breadcrumbNameMap[current] ?? current,
      };
    });
  }, [location.pathname]);

  const dropdownItems: MenuProps["items"] = [
    { key: "account", label: authStore.userInfo?.account ?? "-" },
    { key: "logout", label: "退出登录", danger: true },
  ];

  async function handleLogout() {
    // 退出登录后强制跳回登录页，避免保留后台上下文。
    await authStore.logout();
    message.success("已退出登录");
    void navigate("/login", { replace: true });
  }

  if (!authStore.initialized) {
    // 布局层初始化期间不渲染主框架，避免闪现菜单和页面内容。
    return (
      <main className="center-shell">
        <div className="center-card">
          <Spin size="large" />
          <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
            正在初始化管理端登录状态...
          </Typography.Paragraph>
        </div>
      </main>
    );
  }

  if (!authStore.isAuthenticated) {
    return null;
  }

  return (
    <Layout className="admin-layout">
      <Sider
        theme="dark"
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={248}
        style={{
          background:
            "linear-gradient(180deg, #101924 0%, #162536 48%, #0c1521 100%)",
        }}
      >
        <div className="admin-logo">
          <em>{collapsed ? "KG" : "OIL-QA CONTROL"}</em>
          <strong>{collapsed ? "OQ" : "油井工程智能问答"}</strong>
          <span>{collapsed ? "SYS" : "Knowledge Graph Console"}</span>
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={selectedKeys}
          defaultOpenKeys={["graph"]}
          items={menuItems}
          style={{ background: "transparent", borderInlineEnd: "none" }}
        />
        <div className="admin-sider__footer">
          <span>System Layer</span>
          <strong>{collapsed ? "L2" : "Admin Surface · Layer 02"}</strong>
        </div>
      </Sider>

      <Layout>
        <Header className="admin-header">
          <div className="admin-header__left">
            <button className="admin-trigger" onClick={toggleCollapsed} type="button">
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
            <div className="admin-header__titles">
              <span>MANAGEMENT NODE</span>
              <Breadcrumb items={breadcrumbItems} />
            </div>
          </div>

          <div className="admin-header__right">
            <Tag bordered={false} color="gold">
              {authStore.userInfo?.roles?.[0] ?? "ADMIN"}
            </Tag>
            <Tag bordered={false} color="cyan">
              ONLINE
            </Tag>
            <Dropdown
              menu={{
                items: dropdownItems,
                onClick: ({ key }) => {
                  if (key === "logout") {
                    void handleLogout();
                  }
                },
              }}
            >
              <Button className="admin-user" type="text">
                <Avatar style={{ backgroundColor: "#c6813d", marginRight: 8 }}>
                  {authStore.userInfo?.username?.slice(0, 1) ?? "管"}
                </Avatar>
                {authStore.userInfo?.username ?? "管理员"}
              </Button>
            </Dropdown>
          </div>
        </Header>

        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
