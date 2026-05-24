# Money Ledger

一个自托管的月度分类预算 PWA，用来让两个人每天知道本月各分类已经花了多少、还剩多少、日均还能花多少。

## 本地运行

```powershell
npm start
```

默认地址：

```text
http://localhost:5173
```

## 部署建议

生产环境至少设置一个共享访问令牌：

```powershell
$env:LEDGER_TOKEN="change-this-token"
$env:PORT="5173"
npm start
```

然后用 Nginx、Caddy 或其他反向代理把你的域名转发到这个端口，并启用 HTTPS。iPhone 添加到主屏幕后即可按 PWA 使用。

## iOS 快捷指令录入

可以创建一个快捷指令：

1. 询问输入：金额。
2. 从菜单中选择分类 ID，例如 `food`、`daily`、`transport`。
3. 获取 URL 内容：
   - URL: `https://你的域名/api/expenses`
   - 方法: `POST`
   - Header: `Authorization: Bearer 你的 LEDGER_TOKEN`
   - JSON body:

```json
{
  "amount": 35.5,
  "categoryId": "food",
  "member": "我",
  "date": "2026-05-24",
  "note": "午饭"
}
```

## 每日摘要

服务端提供摘要接口：

```text
GET /api/summary?format=text
```

可以用 cron 每晚调用这个接口，再把文本转发到 Bark、ntfy、Telegram Bot 或企业微信机器人。

## 数据文件

所有数据保存在：

```text
data/db.json
```

建议把这个文件纳入服务器定时备份。
