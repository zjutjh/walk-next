# Walk-Next — AGENTS.md

精弘毅行系统是承担毅行活动报名、点位打卡、数据管理与统计等业务的移动端Web应用，使用 Vue3 开发

## 1. AI 行为准则

以下规则优先级最高：

- **强制要求：读取AGENTS.md**：执行任何任务前，必须先确定相关子项目（admin/client），**必须读取该子项目目录下的 AGENTS.md 文件**。
- **先读后改**：修改任何文件前必须先使用 Read 工具读取，理解现有逻辑后再动手
- **最小变更**：只修改与任务直接相关的代码
- **复用优先**：新增前先搜索项目中是否已有类似组件/工具/composable，禁止重复造轮子
- **不确定先问**：业务逻辑模糊、架构选择、依赖变更时，必须向开发者确认，禁止猜测
- **修复不掩盖**：遇到类型错误时使用正确的类型守卫，禁止随意使用 `any` / `as Type` 掩盖问题
- **尊重项目架构**: 禁止擅自升级依赖版本/引入新依赖/删除存量代码，必须先询问开发者

---

## 2. 仓库结构

仓库采用Monorepo架构：

### 2.1 子项目

- **`admin`**：[@/apps/admin/AGENTS.md](./apps/admin/AGENTS.md)

### 2.2 内部包

- **`packages/api`**：定义 API 接口，包括类型和请求函数等

```plaintext
packages/api/src/
├── services/          # 请求服务，包括请求函数定义
│   └── admin/
│       └── index.ts   # Admin端 请求服务
├── types/             # 类型定义
│   ├── admin/         # Admin端类型
│   │   ├── api.ts     # Admin端 请求响应类型定义
│   │   ├── dashboard.ts
│   │   ├── index.ts   # Admin端类型 出口文件
│   │   ├── member.ts
│   │   ├── qr-code.ts
│   │   ├── stats.ts
│   │   ├── team.ts
│   │   └── user.ts
│   └── client/        # Client端类型
│       ├── index.ts   # Client端类型 出口文件
│       └── qr-code.ts
└── utils/
    ├── index.ts
    ├── response.ts
    └── service.ts
```

- **`packages/shared`**：定义子项目共用的组件、工具、常量等

```plaintext
packages/shared/src/
├── assets/            # 静态资源
│   └── error.png      # 错误图片
├── components/        # 共享组件
│   ├── error-boundary/
│   ├── error-empty/   # 错误空态组件
│   ├── loading-container/ # 加载容器组件
│   └── prompt-dialog/ # 输入弹窗组件
├── composables/       # 组合式函数
│   ├── router-state.ts # 路由导航状态管理
│   └── stored-url-query.ts # URL Query Composable
├── constants/         # 共享常量
│   └── response-code.ts # 业务状态码
├── utils/             # 共享工具
│   ├── error.ts
│   └── request-error.ts
└── index.ts
```
