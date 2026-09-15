# Walk-Next Client — AGENTS.md

精弘毅行报名系统是面向学生、教职工和校友的移动端 `Web` 应用，使用 `Vue3` 开发。

本项目使用 `vue-i18n` 实现国际化。

## 1. 项目概览

| 属性      | 值                                             |
| --------- | ---------------------------------------------- |
| 框架      | Vue 3 (Composition API)                        |
| 包管理    | pnpm [版本](/package.json)                     |
| 构建工具  | Vite                                           |
| UI 组件库 | [Vant](https://vant-ui.github.io/vant/#/en-US) |
| 状态管理  | Pinia                                          |
| 样式方案  | SCSS                                           |
| 请求方案  | Axios + Tanstack Vue Query                     |
| i18n      | vue-i18n                                       |

---

## 2. 项目结构

```plaintext
apps/client/src/
├── assets/        # 静态资源（图片、字体等）
├── components/    # 全局共享组件
├── composables/   # 全局 Composable
├── configs/       # 全局配置（路由、第三方库初始化等）
├── constants/     # 全局常量
├── layouts/       # 布局框架组件
├── pages/         # 页面级组件（对应路由，每个页面一个目录）
│   └── <page-name>/
│       ├── index.vue    # 页面组件
│       ├── index.module.scss   # 组件样式（SCSS Modules）
│       ├── components/  # 页面私有组件
│       ├── composables/ # 页面私有 Composable
│       ├── types.ts     # 页面私有类型定义
│       ├── constants.ts # 页面私有常量定义
│       └── utils.ts     # 页面私有工具
├── stores/        # 全局 Pinia Store
├── types/         # 全局类型定义
├── utils/         # 全局工具
├── app.vue        # 根组件
├── global.scss    # 全局样式
└── main.ts        # 入口 TS
```

## 3. 环境准备

1. 阅读[环境变量模板](./.env.example)，按注释完成配置
2. 安装依赖，会自动配置 git hooks

   ```bash
   pnpm install
   ```

---

## 4. 开发命令

在仓库根目录执行：

| 操作            | 命令                    | 说明           |
| --------------- | ----------------------- | -------------- |
| 启动开发服务    | `pnpm run dev:client`   |                |
| 类型检查        | `pnpm typecheck`        | 提交前必须通过 |
| Lint 检查与修复 | `pnpm lint --fix`       | 提交前必须通过 |
| 生产构建        | `pnpm run build:client` |                |

检查时，可指定只检查更改的文件。

---

## 5. 代码规范

### 5.1 Vue 组件规范

- 使用 Composition API + `<script setup lang="ts">`，禁止 Options API。
- Props, Emits, Model 必须使用 TypeScript 写法：`defineProps<{ …: Type }>()`, `defineEmits<{ …: […: Type] }>()`, `defineModel<…>("…", { required: … })`
- 模板引用必须使用 `useTemplateRef<>()`，禁止直接用 `ref()`
- 模板中使用props必须使用`props.属性名`访问，禁止直接使用解构后的属性名
- 优先使用组件库组件和共享组件，禁止随意自行实现；如果只能自行实现，必须模仿存量代码风格

### 5.2 样式规范

- 禁止 vue `<style>`，必须拆分出样式文件
- 非全局组件使用 **SCSS Modules**，`script setup` 中引入 `import styles from './index.module.scss'`
- 全局组件使用 `index.scss` + BEM 命名法
- 避免模板内联 `style`（仅动态条件色彩等场景可使用）
- 使用 `:global()` 操作全局组件或组件库类名
- 避免 SCSS 变量，只使用 CSS 变量
- 非文本尺寸禁止使用 `em`

### 5.3 TypeScript 规范

- 导入路径：使用 `@/` 引用 `src/` ，避免3层以上相对路径
- API 请求：必须使用 **`tanstack/vue-query`** 中的 Composable，从统一注册的 API 中导入请求函数，禁止裸写 axios, fetch
- 请求 Composable使用：必须处理 loading / error / empty 三态，mutation 使用 toast 作为提示

### 5.4 命名约定

| 类型       | 规范                             | 示例                   |
| ---------- | -------------------------------- | ---------------------- |
| 文件名     | kebab-case                       | `component-name.vue`   |
| 常量       | UPPER_SNAKE_CASE                 | `CONSTANT_NAME`        |
| 类型       | PascalCase                       | `TypeName`             |
| Store      | camelCase + use前缀              | `useStore`             |
| Composable | camelCase + use前缀              | `useComposable`        |
| 接口命名   | PascalCase + Query或其他动词前缀 | `QueryData`, `SetItem` |
| 布尔量     | is / has 前缀                    | `isBeing`              |

---

## 6. 不确定时的处理

- 遇到业务逻辑模糊处：先问清楚再写，禁止猜测实现
- 不确定该用哪个组件/工具：搜索公共目录和包，找不到再新建
- 涉及架构调整或依赖新增：必须先征求人工同意，不得自行决定
- 遇到疑似 Bug：先在现有代码中查找是否有类似处理模式，优先对齐
