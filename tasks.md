# 專案任務拆解 (Tasks Breakdown)

## Phase 1: 基礎建設與文件
- [x] 撰寫系統分析文件 (SA.md)
- [x] 撰寫系統設計文件 (design.md)
- [x] 撰寫專案任務拆解 (tasks.md)
- [x] 撰寫使用教學 (使用教學.md)

## Phase 2: 專案初始化
- [ ] 初始化 Angular 專案 (Standalone components)。
- [ ] 整合 Tailwind CSS，並設定圓潤風格的客製化樣式。
- [ ] 安裝 CSV / Excel 解析套件 (例如 `papaparse` / `xlsx`)。
- [ ] 整合 Electron 設定，確保可打包成桌面應用程式。

## Phase 3: 核心邏輯實作 (OOP & 業務邏輯)
- [ ] 建立 Domain Models (`Voucher`, `AccountBalance`, `Anomaly` 等)。
- [ ] 實作 File Parser Adapter (CSV 解析器)。
- [ ] 實作動態欄位 Mapping 服務：
  - 讀取表頭。
  - 將自訂欄位轉換為系統標準欄位。
- [ ] 實作異常驗證引擎 (Strategy Pattern)：
  - Rule 1: 單張憑證借貸不平驗證。
  - Rule 2: 應付科目借方餘額異常驗證。
  - Rule 3: 必填資料缺失驗證。
- [ ] 實作科目餘額計算服務 (支援多幣別與匯率換算)。

## Phase 4: UI 介面實作
- [ ] 開發檔案上傳元件 (Drag & Drop 支援)。
- [ ] 開發動態對應設定介面 (Mapping UI)。
- [ ] 開發 Dashboard 總覽畫面。
- [ ] 開發「異常稽核報告」清單介面 (高亮顯示錯誤)。
- [ ] 開發「科目餘額表」資料表元件 (支援幣別篩選與展開)。

## Phase 5: 測試與打包
- [ ] 撰寫單元測試 (特別針對餘額計算與 Validation Rules)。
- [ ] 進行手動整合測試，匯入模擬資料。
- [ ] Electron 建置與測試。
- [ ] 準備發布程式碼。
