# Money Ledger

一个自托管的双人记账与月度预算 PWA。它适合情侣、夫妻或小家庭一起记录日常支出，按月查看预算进度、消费趋势和每日明细。

## 功能

- 快速记账：金额、分类、成员、日期、备注。
- 常用模板：保存高频支出，一键填入金额、分类、成员和备注。
- 月度预算：按分类设置预算额度，首页展示已花、剩余、日均可花、分类进度和预算预警。
- 明细管理：按备注、分类、成员筛选；点击记录进入详情，可修改或删除。
- 统计分析：最近 6 个月趋势、本月与上月对比、成员对比、分类对比。
- 消费日历：日历中显示每日消费金额和笔数，点击日期查看当天明细。
- 成员与分类配置：成员可新增/删除，分类可设置名称、图标、颜色和预算。
- 主题系统：内置简约主题、可爱主题，并支持自定义 Tab 图标和页面背景图。
- 图片裁剪：上传自定义主题图片时可裁剪，避免背景或图标变形。
- 数据备份：支持 JSON 导出、导入备份。
- 危险操作保护：清除全部数据需要二次确认。
- PWA：支持添加到手机主屏幕使用，离线记账会先进入本地队列，恢复网络后自动同步，并在发现新版本后提示刷新。
- 推送通知：支持预算阈值预警、每日未记账提醒和测试通知。iOS 需要先添加到主屏幕后开启。
- iOS 快捷指令：可通过后端 API 快捷记账或获取每日摘要。

## 技术栈

- Node.js 22.13+
- Node 内置 `node:sqlite`
- 原生 HTML / CSS / JavaScript
- SQLite 数据库
- Web Push / VAPID
- Docker / Docker Compose

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm start
```

默认地址：

```text
http://localhost:5173
```

服务启动后会使用：

```text
data/ledger.sqlite
```

如果项目目录里已有旧版 `data/db.json`，首次启动会自动迁移到 SQLite，并保留原 JSON 文件。

## Docker 部署

服务器安装 Docker 和 Docker Compose 后，在项目根目录创建 `.env`。可以复制示例文件：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
LEDGER_TOKEN=change-this-token
BASE_PATH=
TZ=Asia/Shanghai
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@example.com
```

启动：

```bash
docker compose up -d --build
```

默认访问：

```text
http://服务器IP:5173
```

查看日志：

```bash
docker compose logs -f money-ledger
```

更新代码后重新部署：

```bash
docker compose up -d --build --force-recreate
```

## 域名反向代理

推荐使用 HTTPS。将域名代理到容器映射的本机端口：

```nginx
location / {
    proxy_pass http://127.0.0.1:5173;
    proxy_http_version 1.1;
    proxy_redirect off;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
}
```

## 二级目录部署

如果要部署到域名子路径，例如：

```text
https://example.com/moneyLedger/
```

`.env` 设置：

```env
LEDGER_TOKEN=change-this-token
BASE_PATH=/moneyLedger
```

重建容器：

```bash
docker compose up -d --build --force-recreate
```

Nginx 配置：

```nginx
location = /moneyLedger {
    return 301 /moneyLedger/;
}

location /moneyLedger/ {
    proxy_pass http://127.0.0.1:5173/moneyLedger/;
    proxy_http_version 1.1;
    proxy_redirect off;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
}
```

确认环境变量是否生效：

```bash
docker compose exec money-ledger printenv BASE_PATH
```

应该输出：

```text
/moneyLedger
```

## 访问令牌

`LEDGER_TOKEN` 没有默认值。

- `LEDGER_TOKEN` 为空：不启用 API 鉴权。
- `LEDGER_TOKEN` 有值：所有 `/api/*` 接口都需要令牌。

前端遇到 `401` 会提示输入令牌，并保存到浏览器 `localStorage`。公网部署建议设置 `LEDGER_TOKEN`。

## 推送通知

推送通知使用标准 Web Push，不依赖第三方推送平台。服务器需要配置一组 VAPID 密钥。

生成密钥：

```bash
npx web-push generate-vapid-keys
```

将输出写入 `.env`：

```env
TZ=Asia/Shanghai
VAPID_PUBLIC_KEY=你的_publicKey
VAPID_PRIVATE_KEY=你的_privateKey
VAPID_SUBJECT=mailto:你的邮箱@example.com
```

然后重建容器：

```bash
docker compose up -d --build --force-recreate
```

启用方式：

- 打开应用的“设置 > 通知与提醒”。
- 点击“开启通知”，授权后可以发送测试通知。
- 预算预警会在总预算或分类预算达到 80%、90%、100% 时推送，并按月份、分类和阈值去重。
- 每日记账提醒会在设定时间后检查当天是否没有记录，没有记录才提醒一次。

iOS 注意事项：

- 需要 iOS/iPadOS 16.4 或更高版本。
- 必须通过 HTTPS 访问。
- 必须先在 Safari 中“添加到主屏幕”，再从主屏幕打开应用并点击开启通知。
- 浏览器普通标签页里不会开启 iOS Web Push。

## 数据与备份

主要数据文件：

```text
data/ledger.sqlite
```

SQLite 的 WAL 模式还会生成：

```text
data/ledger.sqlite-wal
data/ledger.sqlite-shm
```

建议定时备份整个 `data` 目录。应用内也可以在设置页导出 JSON 备份，导入备份会覆盖当前成员、分类、预算和记录。

## API

常用接口：

```text
GET    /api/state?month=2026-05
POST   /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id
PUT    /api/budgets
GET    /api/export.csv?month=2026-05
GET    /api/export.json
POST   /api/import.json
GET    /api/summary?format=text
POST   /api/clear
GET    /api/notifications/status
PUT    /api/notifications/preferences
GET    /api/push/public-key
POST   /api/push/subscribe
POST   /api/push/unsubscribe
POST   /api/push/test
```

新增记账示例：

```json
{
  "amount": 35.5,
  "categoryId": "food",
  "member": "我",
  "date": "2026-05-24",
  "note": "午饭"
}
```

如果设置了 `LEDGER_TOKEN`，请求头需要带：

```text
Authorization: Bearer 你的_LEDGER_TOKEN
```

## iOS 快捷指令

可以用快捷指令调用：

```text
POST https://你的域名/api/expenses
```

二级目录部署时改为：

```text
POST https://你的域名/moneyLedger/api/expenses
```

快捷指令中使用“获取 URL 内容”，方法选择 `POST`，请求体选择 JSON，填入金额、分类、成员、日期和备注即可。

每日摘要接口：

```text
GET /api/summary?format=text
```

可以配合 cron、Bark、ntfy、Telegram Bot 或企业微信机器人做定时提醒。

## 开源协议

本项目采用非商业使用许可。

允许：

- 个人学习、研究和自用。
- 在个人设备或个人服务器上部署使用。
- 在保留版权和许可说明的前提下进行非商业修改和分享。

禁止：

- 任何形式的商业使用、销售、出租、SaaS 托管、付费分发或商业集成。
- 删除或隐藏版权声明和许可说明。

如需商业使用，请先取得作者明确授权。
