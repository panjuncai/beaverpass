# BeaverPass - 安全的密码管理器

BeaverPass是一个安全的密码管理器，帮助用户生成、存储和管理强密码，保护在线账户安全。

## 技术栈

- **前端框架**: Next.js (App Router)
- **API**: tRPC
- **认证**: Supabase Auth
- **数据库**: Supabase PostgreSQL
- **样式**: Tailwind CSS
- **部署**: Vercel

## 功能

- 用户认证（邮箱登录和社交登录）
- 密码管理
- 安全笔记
- 密码生成器
- 跨设备同步

## 开始使用

### 前提条件

- Node.js 18+
- npm 或 yarn
- Supabase账户

### 安装

1. 克隆仓库

```bash
git clone https://github.com/yourusername/beaverpass.git
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
