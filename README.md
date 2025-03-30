# BeaverPass 



## 技术栈

- **前端框架**: Next.js (App Router)
- **API**: tRPC
- **认证**: Supabase Auth
- **数据库**: Supabase PostgreSQL+RealTime
- **样式**: Tailwind CSS
- **部署**: Vercel

## 主要功能

- 用户认证（邮箱登录和社交登录）
- 二手商品发布
- 二手商品浏览
- 二手商品下单
- 用户信息维护
- 实时聊天

## 实时聊天功能

本项目使用 Supabase Realtime 实现了高效的实时消息传递系统。

### 技术栈

- **Supabase Realtime**: 用于数据库变更的实时监听
- **TRPC**: 提供类型安全的API调用
- **本地存储**: 用于消息队列管理和离线支持

### 消息处理流程

1. **消息发送**:
   - 用户发送消息时，消息先以"乐观更新"方式显示在UI中
   - 消息带有临时ID和"发送中"状态
   - 同时通过TRPC API将消息发送到服务器

2. **消息存储**:
   - 服务器接收消息后将其存储到数据库
   - 存储操作触发Supabase Realtime事件

3. **实时通知**:
   - 所有订阅聊天室的客户端通过Supabase Realtime接收数据库变更
   - 客户端收到新消息通知后更新UI

4. **状态管理**:
   - 消息状态包括：发送中、已发送、已存储、已读、发送失败等
   - 发送失败的消息可以重试

5. **离线支持**:
   - 消息在本地存储，断网时会保存在队列中
   - 网络恢复后自动重新发送

### 关键特性

- **消息确认机制**: 临时ID用于跟踪消息状态
- **超时重试**: 发送失败的消息可以手动重试
- **网络状态监控**: 自动检测网络连接状态
- **用户状态**: 显示在线/离线状态
- **正在输入提示**: 当用户正在输入时显示状态
- **心跳检测**: 定期发送心跳包保持连接

### 为什么选择这种方案

Supabase Realtime的优势:

1. **实时性**: 提供低延迟的实时通信
2. **可靠性**: 消息先存储到数据库再通知接收方
3. **可扩展性**: 使用Vercel的无服务器架构可以轻松扩展
4. **优化用户体验**: 乐观更新和状态跟踪提供流畅的用户体验

## 开始使用

### 前提条件

- Node.js 18+
- npm 或 yarn
- Supabase账户

### 安装

1. 克隆仓库

```bash
git clone https://github.com/panjuncai/beaverpass.git
cd beaverpass
```

2. 安装依赖

```bash
npm install
# 或
yarn install
```

3. 配置环境变量

复制`.env.local.example`文件并重命名为`.env.local`，然后填写您的Supabase凭据：

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

4. 运行开发服务器

```bash
npm run dev
# 或
yarn dev
```

5. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 部署到Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fbeaverpass)

1. 在Vercel上创建一个新项目
2. 导入您的GitHub仓库
3. 添加环境变量（与`.env.local`相同）
4. 部署

## 许可证

MIT
