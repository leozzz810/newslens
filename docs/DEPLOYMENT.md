# 部署指南

## 1. 前置需求

- Node.js 20+
- Cloudflare 帳號
- Anthropic API Key（Claude）

## 2. 安裝依賴

```bash
cd newslens
npm install
```

## 3. Cloudflare Worker 部署

### 3.1 建立 D1 資料庫

```bash
cd worker
npx wrangler d1 create newslens
```

複製輸出的 `database_id`，填入 `wrangler.toml` 的 `database_id` 欄位。

### 3.2 建立 KV Namespace

```bash
npx wrangler kv:namespace create CACHE
```

複製輸出的 `id`，填入 `wrangler.toml` 的 KV `id` 欄位。

### 3.3 初始化資料庫 Schema

```bash
npx wrangler d1 execute newslens --file=src/db/schema.sql
```

### 3.4 設定 API Key

```bash
npx wrangler secret put ANTHROPIC_API_KEY
# 輸入你的 sk-ant-... key
```

### 3.5 部署 Worker

```bash
npm run deploy
```

部署後記下 Worker URL，格式為 `https://newslens-api.YOUR_SUBDOMAIN.workers.dev`

## 4. Chrome Extension 建置

### 4.1 設定環境變數

```bash
cd extension
cp ../.env.example .env.local
# 編輯 .env.local，填入 VITE_API_BASE_URL 等值
```

### 4.2 建置

```bash
npm run build
```

建置產出在 `extension/dist/`。

### 4.3 載入 Extension（開發測試）

1. 開啟 Chrome，前往 `chrome://extensions/`
2. 啟用「開發人員模式」
3. 點擊「載入未封裝項目」，選擇 `extension/dist/` 目錄
4. 開新分頁，即可看到 NewsLens

## 5. 圖示準備

1. 開啟 `extension/src/utils/generate-icons.html`
2. 點擊「下載所有圖示」
3. 將下載的 PNG 放到 `extension/public/icons/` 目錄

## 6. 搜尋分潤申請

- **Yahoo**: 前往 [Yahoo Search Partner](https://searchmarketing.yahoo.com/) 申請 `hspart` 和 `hsimp`
- **Bing**: 前往 [Microsoft Bing Partner](https://www.microsoft.com/en-us/bing/apis/bing-web-search-api) 申請 `PC` 和 `FORM`

申請後填入 `.env.local` 對應欄位。

## 7. Chrome Web Store 上架

1. 建立 CRX 包：`npx crx pack dist -o newslens.crx`（或使用 ZIP）
2. 前往 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
3. 上傳 ZIP，填入說明與截圖
4. 提交審核（通常 1-3 個工作天）
