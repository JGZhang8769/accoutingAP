# 系統設計文件 (System Design)

## 1. 架構設計 (Architecture)
系統採用 **Clean Architecture** 與 **物件導向設計 (OOP)**，分離 UI 層、業務邏輯層與資料層，確保高內聚與低耦合。
- **前端框架：** Angular (TypeScript) - 提供強型別與依賴注入 (DI)。
- **樣式框架：** Tailwind CSS - 用於快速建構圓潤、乾淨且具現代感的 UI。
- **桌面封裝：** Electron - 提供本地端獨立運作的桌面應用程式能力。

## 2. 設計模式應用 (Design Patterns)
為了讓系統具備極佳的擴展性與維護性，採用以下 Design Patterns：

### 2.1 策略模式 (Strategy Pattern)
**應用場景：** 異常檢查引擎 (Validation Rules)。
由於會計防錯規則可能會不斷增加，我們定義一個 `IValidationRule` 介面，不同的規則（如借貸不平、餘額異常）分別實作此介面。檢查時，引擎會走訪所有注入的策略進行驗證。
```typescript
interface IValidationRule {
    validate(vouchers: Voucher[]): AnomalyReport[];
}
```

### 2.2 轉接器模式 (Adapter Pattern)
**應用場景：** 檔案解析 (File Parsing)。
為了支援 CSV、Excel 甚至未來的 API 匯入，定義統一的 `IFileParser` 介面，不同格式各自實作轉接器。

### 2.3 工廠模式 (Factory Pattern)
**應用場景：** 報表生成與幣別計算策略的建立。
依據使用者選擇的呈現維度（單一幣別展開 vs 總量折算），透過 Factory 動態產生對應的計算實例。

## 3. 領域模型 (Domain Models)
- `RawRecord`: 原始未解析前的一筆資料。
- `Voucher`: 傳票/交易明細，包含單筆借貸、科目、金額等資訊。
- `AccountBalance`: 結算後的科目餘額實體。
- `Anomaly`: 系統抓出的異常警告，包含錯誤類型、發生行數與建議。

## 4. UI/UX 設計規範
- **色彩計畫：**
  - 主色調：沉穩的深藍色與乾淨的白色（信任感）。
  - 警告色：柔和的橘紅色（異常提醒但不具攻擊性）。
  - 成功色：薄荷綠（通過檢查的安心感）。
- **元件風格：**
  - 大量使用圓角 (`rounded-xl` 或 `rounded-2xl`)。
  - 卡片式佈局，增加陰影層次 (`shadow-sm`, `shadow-md`)。
  - 寬鬆的間距 (`p-4`, `p-6`)，減少密集數據帶來的壓迫感。
