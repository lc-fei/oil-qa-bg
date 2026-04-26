import type { Config } from "@react-router/dev/config";

// 管理端保留 SSR 能力，方便 React Router 按默认模式生成服务端构建。
export default {
  ssr: true,
} satisfies Config;
