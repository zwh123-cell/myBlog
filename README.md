# Docker / Git 使用说明

本文档说明如何在 `bokeApp` 项目中使用 Git 和 Docker。

---

## 一、Git 使用

### 1. 初始化仓库

项目当前尚未初始化 Git。在项目根目录执行：

```bash
git init
```

### 2. 配置用户信息（首次使用）

```bash
git config user.name  "你的名字"
git config user.email "your@email.com"
```

> 全局配置可加 `--global` 参数。

### 3. 首次提交

```bash
git add .
git commit -m "chore: 初始化项目文档与脚手架"
```

### 4. 关联远程仓库（可选）

```bash
git remote add origin https://github.com/你的用户名/bokeApp.git
git branch -M main
git push -u origin main
```

### 5. 日常开发工作流

```bash
# 查看状态
git status

# 查看改动
git diff

# 暂存并提交
git add <文件>
git commit -m "feat: 新增文章模块"

# 拉取远程更新
git pull

# 推送
git push
```

### 6. 分支管理建议

| 分支 | 用途 |
| --- | --- |
| `main` | 稳定可发布分支 |
| `develop` | 日常开发集成 |
| `feature/xxx` | 功能开发 |
| `fix/xxx` | 缺陷修复 |

```bash
# 创建并切换功能分支
git checkout -b feature/article-module

# 合并回开发分支
git checkout develop
git merge feature/article-module
```

### 7. 提交信息规范

采用 `type(scope): subject` 格式，type 常用：

- `feat` — 新功能
- `fix` — 修复缺陷
- `docs` — 文档
- `chore` — 构建 / 工具配置
- `refactor` — 重构

> 已提供 `.gitignore`，会忽略 `node_modules`、`.next`、`target` 等产物，无需手动处理。

---

## 二、Docker 使用

### 1. 前置条件

- 安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)（Windows / macOS）
- 确认 `docker` 与 `docker compose` 命令可用：

```bash
docker --version
docker compose version
```

### 2. 项目中的 Docker 文件

| 文件 | 说明 |
| --- | --- |
| `docker-compose.yml` | 编排 MySQL、Redis、后端、前端四个服务 |
| `web/Dockerfile` | Next.js 前端多阶段构建镜像 |
| `server/Dockerfile` | Spring Boot 后端多阶段构建镜像 |

### 3. 启动完整环境

在项目根目录执行：

```bash
docker compose up -d --build
```

启动后各服务端口：

| 服务 | 地址 | 说明 |
| --- | --- | --- |
| 前端 Web | http://localhost:3000 | Next.js |
| 后端 API | http://localhost:8080 | Spring Boot |
| MySQL | localhost:3306 | 账号 root / 密码 root |
| Redis | localhost:6379 | 无密码 |

### 4. 常用命令

```bash
# 查看运行状态
docker compose ps

# 查看日志
docker compose logs -f server
docker compose logs -f web

# 停止服务（保留数据卷）
docker compose down

# 停止并删除数据卷（会清空 MySQL 数据）
docker compose down -v

# 仅重建某个服务
docker compose up -d --build server
```

### 5. 数据持久化

- MySQL 数据存放在命名卷 `mysql_data` 中，`docker compose down` 不会删除数据。
- 如需彻底清空数据库，执行 `docker compose down -v`。

---

## 三、本地开发运行（不依赖 Docker）

### 1. 启动 MySQL 与 Redis

本地需先准备好 MySQL 8.0 与 Redis 7，并执行建表脚本：

```bash
mysql -uroot -p < server/src/main/resources/db/init.sql
```

### 2. 启动后端

```bash
cd server
mvn spring-boot:run
```

后端启动后访问 http://localhost:8080/api/v1/health 验证。

### 3. 启动前端

```bash
cd web
npm install
npm run dev
```

前端启动后访问 http://localhost:3000。

> 前端通过 `NEXT_PUBLIC_API_BASE_URL` 指定后端地址，默认 `http://localhost:8080`，可复制 `.env.example` 为 `.env.local` 修改。

---

## 四、注意事项

- 后端构建需要 `pom.xml` 与 `src` 目录，前端构建需要 `package.json`，这些已就绪。
- 数据库连接、Redis 地址、JWT 密钥等配置在 `server/src/main/resources/application.yml` 中，部署时请修改默认密码与密钥。
- 首次执行 `docker compose up --build` 会自动通过挂载的 `init.sql` 初始化数据库表结构。
