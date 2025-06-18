# Bun Monorepo

這是一個使用 Bun workspaces 配置的 monorepo 專案，包含 web client 和 api server。

## 專案結構

```
.
├── packages/
│   ├── web-client/     # React 前端應用
│   └── api-server/     # Express API 後端
├── package.json        # Root package.json (workspaces 配置)
└── README.md
```

## 開始使用

### 安裝依賴

```bash
bun install
```

### 開發模式

啟動前端：
```bash
bun run dev
```

啟動後端：
```bash
bun run dev:api
```

同時啟動前後端：
```bash
bun run dev:all
```

### 構建專案

構建所有包：
```bash
bun run build
```

### 測試

運行所有測試：
```bash
bun run test
```

### Lint

檢查所有包的程式碼風格：
```bash
bun run lint
```

## Workspaces

本專案使用 Bun workspaces 功能來管理 monorepo。各個包之間可以使用 `workspace:*` 語法來相互依賴。

- `web-client` - React 前端應用，使用 Vite 構建
- `api-server` - Express 後端 API，使用 Bun 運行

## 新增包

要新增新的包，請在 `packages/` 目錄下創建新資料夾，並添加相應的 `package.json`。

## 相關連結

- [Bun Workspaces 文檔](https://bun.sh/guides/install/workspaces) 