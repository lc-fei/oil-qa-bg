import { Alert, Button, Form, Input, Tag, Typography, message } from "antd";
import {
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import type { Route } from "./+types/login";
import { useAuthStore } from "../stores/auth-store";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "后台登录 | 油井工程智能问答系统" },
    { name: "description", content: "管理端登录入口" },
  ];
}

export default function LoginPage() {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    authStore.bootstrap().catch(() => undefined);
  }, [authStore]);

  useEffect(() => {
    if (authStore.initialized && authStore.isAuthenticated) {
      void navigate("/", { replace: true });
    }
  }, [authStore.initialized, authStore.isAuthenticated, navigate]);

  async function handleFinish(values: { account: string; password: string }) {
    setSubmitting(true);
    setErrorText("");

    try {
      await authStore.login(values);
      message.success("登录成功");
      void navigate("/", { replace: true });
    } catch (error) {
      const text = error instanceof Error ? error.message : "登录失败";
      setErrorText(text);
      message.error(text);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-brand">
        <div className="login-brand__grid" />
        <div className="login-brand__content">
          <div className="login-brand__eyebrow">FIELD OPERATIONS CONSOLE</div>
          <div className="login-brand__tag">OIL WELL ENGINEERING ADMIN</div>
          <h1 className="login-brand__title">
            基于知识图谱的油井工程
            <br />
            智能问答系统管理端
          </h1>
          <p className="login-brand__desc">
            面向知识图谱维护、问答链路追踪与运行监控的一体化后台。当前版本先完成基础框架与登录认证，后续业务页面可直接在此骨架上扩展。
          </p>
        </div>

        <div className="login-brand__board">
          <div className="login-brand__board-head">
            <span>问答主链路</span>
            <span>STATUS OK</span>
          </div>
          <div className="login-brand__timeline">
            <div>问题接收</div>
            <div>NLP 识别</div>
            <div>图谱检索</div>
            <div>Prompt 拼接</div>
            <div>AI 调用</div>
          </div>
        </div>

        <div className="login-brand__stats">
          <div className="login-brand__stat">
            <strong>3</strong>
            <span>核心模块</span>
          </div>
          <div className="login-brand__stat">
            <strong>7</strong>
            <span>一级导航</span>
          </div>
          <div className="login-brand__stat">
            <strong>JWT</strong>
            <span>统一鉴权</span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-card__topbar">
            <span>安全接入</span>
            <Tag bordered={false} color="gold">
              JWT AUTH
            </Tag>
          </div>
          <Typography.Title className="login-card__title" level={2}>
            管理员登录
          </Typography.Title>
          <p className="login-card__desc">
            输入后台账号和密码后进入知识图谱管理控制台。开发环境下默认支持
            `/api` 代理联调，也可通过 `VITE_API_BASE_URL` 指定后端地址。
          </p>

          <div className="login-card__meta">
            <div>
              <span>角色范围</span>
              <strong>SUPER_ADMIN / ADMIN</strong>
            </div>
            <div>
              <span>访问方式</span>
              <strong>账号密码 + Token</strong>
            </div>
          </div>

          {errorText ? (
            <Alert
              style={{ marginBottom: 20 }}
              message={errorText}
              type="error"
              showIcon
            />
          ) : null}

          <Form
            layout="vertical"
            size="large"
            autoComplete="off"
            initialValues={{ account: "superadmin", password: "123456" }}
            onFinish={handleFinish}
          >
            <Form.Item
              label="登录账号"
              name="account"
              rules={[{ required: true, message: "请输入登录账号" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入账号" />
            </Form.Item>

            <Form.Item
              label="登录密码"
              name="password"
              rules={[{ required: true, message: "请输入登录密码" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, paddingTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
                icon={<SafetyCertificateOutlined />}
              >
                登录系统
              </Button>
            </Form.Item>
          </Form>

          <div className="login-card__hint">
            <span>建议联调账号</span>
            <code>superadmin / 123456</code>
          </div>
        </div>
      </section>
    </main>
  );
}
