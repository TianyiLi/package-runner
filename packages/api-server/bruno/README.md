# Package Runner API - Bruno Collection

這是 Package Runner API 的 Bruno 測試集合，包含了所有 API 端點的完整測試用例。

## 什麼是 Bruno？

Bruno 是一個快速且開源的 API 測試工具，類似於 Postman 但更輕量且支援版本控制。

- 官網：https://usebruno.com/
- GitHub：https://github.com/usebruno/bruno

## 安裝 Bruno

### macOS
```bash
brew install bruno
```

### Windows
從 [Bruno 官網](https://usebruno.com/downloads) 下載安裝程式

### Linux
```bash
# Snap
sudo snap install bruno

# AppImage
# 從官網下載 AppImage 文件
```

## 使用說明

### 1. 匯入 Collection

1. 開啟 Bruno 應用程式
2. 點擊 "Open Collection"
3. 選擇 `packages/api-server/bruno` 資料夾
4. Bruno 會自動載入所有 API 端點

### 2. 設定環境

Collection 已經預設建立了開發環境配置：

- **baseUrl**: `http://localhost:3001`
- **apiKey**: (目前為空，未來可能需要)

### 3. 啟動 API 服務

在使用 Bruno 測試之前，請確保 API 服務正在運行：

```bash
cd packages/api-server
bun run dev
```

服務會在 `http://localhost:3001` 啟動。

## Collection 結構

```
bruno/
├── environments/
│   └── Development.bru          # 開發環境配置
├── System/
│   ├── Health Check.bru         # 健康檢查
│   └── System Status.bru        # 系統狀態
├── Repositories/
│   ├── List Repositories.bru    # 列出儲存庫
│   ├── Get Repository.bru       # 獲取儲存庫詳情
│   ├── Create Repository.bru    # 建立儲存庫
│   ├── Update Repository.bru    # 更新儲存庫
│   ├── Delete Repository.bru    # 刪除儲存庫
│   └── Update Access Time.bru   # 更新存取時間
├── Scripts/
│   ├── List Scripts.bru         # 列出腳本
│   ├── Get Running Scripts.bru  # 獲取運行中腳本
│   ├── Execute Script.bru       # 執行腳本
│   ├── Stop Script.bru          # 停止腳本
│   └── Get Script Output.bru    # 獲取腳本輸出
└── Environment Variables/
    ├── List Environment Variables.bru    # 列出環境變數
    ├── Create Environment Variable.bru   # 建立環境變數
    ├── Generate Env File.bru             # 生成 .env 文件
    └── Import Env File.bru               # 匯入 .env 文件
```

## 測試流程建議

### 基本測試流程

1. **系統檢查**
   - 執行 "Health Check" 確認服務運行
   - 執行 "System Status" 檢查系統狀態

2. **儲存庫管理**
   - 執行 "List Repositories" 查看現有儲存庫
   - 執行 "Create Repository" 建立測試儲存庫
   - 執行 "Get Repository" 獲取詳細資訊

3. **腳本管理**
   - 執行 "List Scripts" 查看可用腳本
   - 執行 "Execute Script" 運行測試腳本
   - 執行 "Get Script Output" 查看執行結果
   - 執行 "Stop Script" 停止運行中的腳本

4. **環境變數管理**
   - 執行 "Create Environment Variable" 建立測試變數
   - 執行 "List Environment Variables" 查看變數列表
   - 執行 "Generate Env File" 生成 .env 文件

## 測試功能

每個 API 請求都包含：

- **完整的文檔** - 詳細說明參數和用途
- **示例數據** - 可直接使用的測試數據
- **自動測試** - 驗證回應格式和狀態碼

### 執行測試

1. 在 Bruno 中選擇要測試的 API 端點
2. 點擊 "Send" 按鈕執行請求
3. 查看回應和測試結果
4. 測試結果會顯示在 "Tests" 標籤中

### 批量測試

1. 右鍵點擊資料夾（如 "Repositories"）
2. 選擇 "Run Collection"
3. Bruno 會依序執行該資料夾下的所有請求

## 自訂配置

### 修改基礎 URL

如果 API 服務運行在不同的埠號：

1. 開啟 `environments/Development.bru`
2. 修改 `baseUrl` 變數
3. 儲存文件

### 添加認證

未來如果需要 API 認證：

1. 在環境配置中添加 `apiKey` 變數
2. 在請求中添加 Authorization header
3. 更新相關的測試案例

## 故障排除

### 連接錯誤

如果遇到連接錯誤：

1. 確認 API 服務正在運行 (`bun run dev`)
2. 檢查 baseUrl 是否正確
3. 確認防火牆沒有阻擋連接

### 測試失敗

如果測試失敗：

1. 檢查回應內容是否符合預期
2. 確認測試數據是否正確
3. 查看 API 服務的日誌輸出

## 進階用法

### 環境變數

可以在請求中使用 `{{variableName}}` 語法引用環境變數：

```
url: {{baseUrl}}/api/repositories
```

### 腳本

Bruno 支援 Pre-request 和 Post-response 腳本：

```javascript
// Pre-request Script
bru.setVar("timestamp", Date.now());

// Tests
test("Response time is acceptable", function() {
  expect(res.getResponseTime()).to.be.below(200);
});
```

### 鏈式請求

可以在一個請求中儲存回應數據，在後續請求中使用：

```javascript
// 儲存建立的 ID
bru.setVar("repositoryId", res.getBody().data.id);
```

## 支援

如果遇到問題或需要添加新的測試案例，請參考：

- [Bruno 文檔](https://docs.usebruno.com/)
- [API 完整文檔](../API-DOCUMENTATION.md)
- [專案 README](../../../README.md) 