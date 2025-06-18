# Package Runner API 文檔

## 概覽
Package Runner API 是一個用於管理開發專案儲存庫、腳本執行和環境變數的 RESTful API。

**基礎 URL:** `http://localhost:3001`
**版本:** 1.0.0

## 認證
目前版本不需要認證。

## 響應格式
所有 API 響應都遵循統一格式：

```json
{
  "success": boolean,
  "data": any,
  "error": string,
  "timestamp": string,
  "pagination"?: {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

## 系統端點

### 健康檢查
- **GET** `/health`
- **描述：** 檢查服務健康狀態

**回應範例：**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### 系統狀態
- **GET** `/api/system/status`
- **描述：** 獲取系統詳細狀態資訊

**回應範例：**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 3600,
    "memoryUsage": {
      "used": 50000000,
      "total": 100000000,
      "percentage": 50
    },
    "activeScripts": 2,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## 儲存庫管理 API

### 列出所有儲存庫
- **GET** `/api/repositories`
- **描述：** 獲取儲存庫列表，支援篩選和分頁

**查詢參數：**
- `page` (number, default: 1): 頁碼
- `limit` (number, default: 10): 每頁數量
- `search` (string): 搜尋關鍵字
- `type` (string): 專案類型 (vite, next, react, node, unknown)
- `packageManager` (string): 包管理器 (npm, pnpm, yarn, bun)

**回應範例：**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "my-vite-app",
      "path": "/Users/dev/projects/my-vite-app",
      "type": "vite",
      "packageManager": "npm",
      "lastAccessed": "2024-01-15T10:00:00.000Z",
      "isActive": false,
      "packageJson": {
        "name": "my-vite-app",
        "version": "1.0.0",
        "scripts": {
          "dev": "vite",
          "build": "vite build"
        }
      },
      "configFiles": ["vite.config.ts", "tsconfig.json"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 獲取特定儲存庫
- **GET** `/api/repositories/:id`
- **描述：** 根據 ID 獲取儲存庫詳細資訊

### 建立新儲存庫
- **POST** `/api/repositories`
- **描述：** 建立新的儲存庫

**請求體：**
```json
{
  "name": "my-new-project",
  "path": "/path/to/project",
  "type": "vite",
  "packageManager": "npm"
}
```

### 更新儲存庫
- **PUT** `/api/repositories/:id`
- **描述：** 更新儲存庫資訊

### 刪除儲存庫
- **DELETE** `/api/repositories/:id`
- **描述：** 刪除儲存庫

### 更新存取時間
- **POST** `/api/repositories/:id/access`
- **描述：** 更新儲存庫最後存取時間

## 腳本管理 API

### 列出腳本
- **GET** `/api/scripts`
- **描述：** 獲取腳本列表

**查詢參數：**
- `repositoryId` (string): 儲存庫 ID 篩選
- `page` (number): 頁碼
- `limit` (number): 每頁數量

### 獲取運行中的腳本
- **GET** `/api/scripts/running`
- **描述：** 獲取所有運行中的腳本

### 獲取特定腳本
- **GET** `/api/scripts/:id`
- **描述：** 根據 ID 獲取腳本詳細資訊

### 建立新腳本
- **POST** `/api/scripts`
- **描述：** 建立新腳本

**請求體：**
```json
{
  "name": "dev",
  "command": "npm run dev",
  "repositoryId": "1"
}
```

### 執行腳本
- **POST** `/api/scripts/:id/execute`
- **描述：** 執行指定腳本

**請求體：**
```json
{
  "arguments": "--port 3000",
  "environment": {
    "NODE_ENV": "development"
  }
}
```

### 停止腳本
- **POST** `/api/scripts/:id/stop`
- **描述：** 停止運行中的腳本

### 獲取腳本輸出
- **GET** `/api/scripts/:id/output`
- **描述：** 獲取腳本執行輸出

## 環境變數管理 API

### 列出環境變數
- **GET** `/api/env`
- **描述：** 獲取環境變數列表

**查詢參數：**
- `repositoryId` (string): 儲存庫 ID 篩選
- `maskSecrets` (boolean, default: true): 是否遮蔽敏感資訊
- `page` (number): 頁碼
- `limit` (number): 每頁數量

### 獲取特定環境變數
- **GET** `/api/env/:id`
- **描述：** 根據 ID 獲取環境變數

### 建立環境變數
- **POST** `/api/env`
- **描述：** 建立新的環境變數

**請求體：**
```json
{
  "key": "API_KEY",
  "value": "your-secret-api-key",
  "isSecret": true,
  "repositoryId": "1"
}
```

### 更新環境變數
- **PUT** `/api/env/:id`
- **描述：** 更新環境變數

### 刪除環境變數
- **DELETE** `/api/env/:id`
- **描述：** 刪除環境變數

### 生成 .env 文件
- **GET** `/api/env/repository/:repositoryId/file`
- **描述：** 為指定儲存庫生成 .env 文件內容

### 匯入 .env 文件
- **POST** `/api/env/repository/:repositoryId/import`
- **描述：** 從 .env 文件內容匯入環境變數

**請求體：**
```json
{
  "envContent": "NODE_ENV=development\nAPI_KEY=secret123"
}
```

### 獲取指定環境變數值
- **POST** `/api/env/repository/:repositoryId/values`
- **描述：** 根據鍵名批量獲取環境變數值

**請求體：**
```json
{
  "keys": ["NODE_ENV", "API_KEY"]
}
```

## 錯誤碼

| 狀態碼 | 描述 |
|--------|------|
| 200 | 成功 |
| 201 | 建立成功 |
| 400 | 請求無效 |
| 404 | 資源不存在 |
| 500 | 伺服器內部錯誤 |

## 錯誤回應格式

```json
{
  "success": false,
  "error": "錯誤描述",
  "details": [], // 驗證錯誤時提供詳細資訊
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 資料模型

### Repository
```typescript
interface Repository {
  id: string;
  name: string;
  path: string;
  type: 'vite' | 'next' | 'react' | 'node' | 'unknown';
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun';
  lastAccessed: Date;
  isActive: boolean;
  packageJson?: any;
  configFiles?: string[];
}
```

### Script
```typescript
interface Script {
  id: string;
  name: string;
  command: string;
  isRunning: boolean;
  lastRun?: Date;
  output?: string[];
  repositoryId: string;
  pid?: number;
}
```

### EnvVariable
```typescript
interface EnvVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  repositoryId: string;
}
``` 