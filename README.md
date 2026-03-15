# SimpleAdminFront 前端

基于 Vue 3 + TypeScript + Element Plus 的后台管理系统前端。

## 开源协议

本项目采用 [MIT](./LICENSE) 协议开源，可免费用于商业项目。

**使用要求：** 请在您项目的任意显眼位置（如页面底部、关于页面、README 等）选其一标注来源，帮忙推广一下：

> Powered by [SimpleAdmin](https://github.com/Rabb1tQ/SimpleAdminFront)

感谢支持！欢迎 Star ⭐

## 致谢 (Credits)

本项目前端基于 [vue-pure-admin](https://github.com/pure-admin/vue-pure-admin) 精简版开发，感谢 pure-admin 团队提供的优秀开源项目。

- **vue-pure-admin GitHub**: https://github.com/pure-admin/vue-pure-admin
- **vue-pure-admin 文档**: https://pure-admin.cn/
- **@pureadmin/utils 文档**: https://pure-admin-utils.netlify.app

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集
- **Vite** - 下一代前端构建工具
- **Element Plus** - Vue 3 组件库
- **Pinia** - Vue 状态管理
- **Vue Router** - Vue 路由管理

## 项目结构

```
SimpleAdminFront/
├── public/               # 静态资源
├── src/
│   ├── api/              # API 接口
│   ├── components/       # 公共组件
│   ├── router/           # 路由配置
│   ├── store/            # 状态管理
│   ├── views/            # 页面组件
│   │   └── system/       # 系统管理模块
│   │       ├── user/     # 用户管理
│   │       ├── role/     # 角色管理
│   │       ├── menu/     # 菜单管理
│   │       └── tenant/   # 租户管理
│   └── utils/            # 工具函数
├── types/                # 类型定义
├── vite.config.ts        # Vite 配置
└── package.json          # 项目配置
```

## 快速开始

### 1. 安装依赖

确保已安装 Node.js >= 20.19.0 和 pnpm >= 10.0.0

```bash
# 安装 pnpm（如未安装）
npm install -g pnpm

# 安装依赖
pnpm install
```

### 2. 配置环境

复制环境变量文件并根据需要修改：

```bash
cp .env.development .env.local
```

主要配置项：
- `VITE_API_URL` - 后端 API 地址

### 3. 启动开发服务器

```bash
pnpm dev
```

启动后访问 http://localhost:8848

### 4. 构建生产版本

```bash
# 构建
pnpm build

# 预览构建结果
pnpm preview
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm preview` | 预览构建结果 |
| `pnpm lint` | 代码检查 |
| `pnpm lint:fix` | 自动修复代码问题 |
| `pnpm format` | 格式化代码 |

## 功能特性

- **用户认证**: 登录/退出、Token 自动刷新、验证码
- **用户管理**: 用户列表、新增/编辑/删除、重置密码
- **角色管理**: 角色列表、权限分配
- **菜单管理**: 动态菜单、权限控制
- **租户管理**: 多租户数据隔离（SaaS 模式）
- **日志管理**: 操作日志、登录日志

## 默认账号

配合后端使用时，默认账号：

- 用户名: `admin`
- 密码: `admin123`

## 相关链接

- [vue-pure-admin GitHub](https://github.com/pure-admin/vue-pure-admin)
- [vue-pure-admin 文档](https://pure-admin.cn/)
- [Element Plus 文档](https://element-plus.org/)
- [Vue 3 文档](https://cn.vuejs.org/)

## 许可证

[MIT](./LICENSE)
