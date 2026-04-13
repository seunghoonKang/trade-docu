# Proforma Invoice Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app where trade professionals can create Proforma Invoices and export them as PDF, Excel, or print — with optional login for saving data.

**Architecture:** React SPA with FSD structure. Supabase for auth and data persistence. Client-side PDF/Excel generation. react-i18next for 4-language support (ko/en/zh/ja).

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Supabase, @react-pdf/renderer, exceljs, react-i18next, react-router-dom, Vitest, Testing Library, Playwright

---

## File Structure

```
src/
├── app/
│   ├── App.tsx                    # Root component with providers
│   ├── router.tsx                 # Route definitions
│   └── providers/
│       ├── AuthProvider.tsx        # Supabase auth context
│       └── index.tsx              # Compose all providers
├── pages/
│   ├── InvoicePage.tsx            # Main invoice page (form + preview)
│   └── LoginPage.tsx              # Login/signup page
├── widgets/
│   ├── InvoiceForm/
│   │   ├── index.tsx              # Full form orchestrator
│   │   ├── DocumentInfoSection.tsx
│   │   ├── SellerSection.tsx
│   │   ├── BuyerSection.tsx
│   │   ├── TradeTermsSection.tsx
│   │   ├── ItemsTableSection.tsx
│   │   ├── AdditionalChargesSection.tsx
│   │   └── BankInfoSection.tsx
│   ├── InvoicePreview/
│   │   └── index.tsx              # Live preview component
│   └── ExportToolbar/
│       └── index.tsx              # PDF/Excel/Print buttons
├── features/
│   ├── auth/
│   │   ├── api.ts                 # Supabase auth calls
│   │   └── ui/
│   │       ├── LoginForm.tsx
│   │       └── SignupForm.tsx
│   ├── invoice-crud/
│   │   └── api.ts                 # Save/load/list invoices
│   ├── export-pdf/
│   │   ├── PdfDocument.tsx        # @react-pdf/renderer document
│   │   └── generatePdf.ts        # Trigger PDF download
│   ├── export-excel/
│   │   └── generateExcel.ts      # exceljs workbook generation
│   ├── print/
│   │   └── triggerPrint.ts       # window.print wrapper
│   ├── i18n-switch/
│   │   └── ui/
│   │       └── LanguageSwitcher.tsx
│   ├── seller-management/
│   │   └── api.ts                 # Seller CRUD
│   ├── buyer-management/
│   │   ├── api.ts                 # Buyer CRUD
│   │   └── ui/
│   │       └── BuyerSelect.tsx    # Dropdown to pick saved buyer
│   └── product-management/
│       ├── api.ts                 # Product CRUD
│       └── ui/
│           └── ProductSelect.tsx  # Dropdown to pick saved product
├── entities/
│   ├── invoice/
│   │   ├── model.ts              # Invoice type + defaults
│   │   └── lib.ts                # Calculation helpers
│   ├── seller/
│   │   └── model.ts              # Seller type
│   ├── buyer/
│   │   └── model.ts              # Buyer type
│   ├── product/
│   │   └── model.ts              # Product type
│   └── bank-info/
│       └── model.ts              # BankInfo type
├── shared/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── FormSection.tsx        # Collapsible form section wrapper
│   │   └── Layout.tsx             # Page layout shell
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client singleton
│   │   └── cn.ts                 # Tailwind class merge utility
│   ├── i18n/
│   │   ├── config.ts             # i18next init
│   │   └── locales/
│   │       ├── ko.json
│   │       ├── en.json
│   │       ├── zh.json
│   │       └── ja.json
│   └── types/
│       └── index.ts              # Shared type exports
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/app/App.tsx`, `src/vite-env.d.ts`, `.gitignore`

- [ ] **Step 1: Scaffold Vite + React + TypeScript project**

```bash
cd /Users/kang/Desktop/develop/ci
npm create vite@latest . -- --template react-ts
```

Select "Ignore files and continue" if prompted about existing files.

- [ ] **Step 2: Install core dependencies**

```bash
npm install react-router-dom @supabase/supabase-js react-i18next i18next i18next-browser-languagedetector @react-pdf/renderer exceljs file-saver
npm install -D @types/file-saver tailwindcss @tailwindcss/vite
```

- [ ] **Step 3: Configure Tailwind with Vite**

Replace `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

Replace `src/index.css` with:

```css
@import "tailwindcss";
```

- [ ] **Step 4: Clean up scaffolded files**

Delete `src/App.css`, `src/assets/`. Replace `src/App.tsx` with:

```tsx
function App() {
  return <div className="min-h-screen bg-white">PI App</div>;
}

export default App;
```

- [ ] **Step 5: Verify dev server runs**

```bash
npm run dev
```

Expected: App renders "PI App" at http://localhost:5173 with white background.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold vite + react + ts + tailwind project"
```

---

### Task 2: FSD Folder Structure & Shared Types

**Files:**
- Create: `src/entities/invoice/model.ts`, `src/entities/seller/model.ts`, `src/entities/buyer/model.ts`, `src/entities/product/model.ts`, `src/entities/bank-info/model.ts`, `src/shared/types/index.ts`

- [ ] **Step 1: Create FSD directories**

```bash
mkdir -p src/{app/providers,pages,widgets/{InvoiceForm,InvoicePreview,ExportToolbar},features/{auth/ui,invoice-crud,export-pdf,export-excel,print,i18n-switch/ui,seller-management,buyer-management/ui,product-management/ui},entities/{invoice,seller,buyer,product,bank-info},shared/{ui,lib,i18n/locales,types}}
```

- [ ] **Step 2: Write entity types**

`src/entities/seller/model.ts`:

```ts
export interface Seller {
  id: string;
  userId: string;
  companyName: string;
  address: string;
  tel: string;
  fax: string;
  representative: string;
}
```

`src/entities/bank-info/model.ts`:

```ts
export interface BankInfo {
  bankName: string;
  bankSwift: string;
  accountNo: string;
  accountee: string;
  bankAddress: string;
  bankTel: string;
  bankFax: string;
}
```

`src/entities/buyer/model.ts`:

```ts
export interface Buyer {
  id: string;
  userId: string;
  companyName: string;
  address: string;
  tel: string;
  contactPerson: string;
}
```

`src/entities/product/model.ts`:

```ts
export interface Product {
  id: string;
  userId: string;
  description: string;
  hsCode: string;
  unit: string;
  unitPrice: number;
  remarks: string;
}
```

`src/entities/invoice/model.ts`:

```ts
import type { BankInfo } from "../bank-info/model";

export interface InvoiceItem {
  description: string;
  hsCode: string;
  qty: number;
  unit: string;
  unitPrice: number;
  amount: number;
  remarks: string;
}

export interface AdditionalCharge {
  description: string;
  amount: number;
}

export interface BuyerSnapshot {
  companyName: string;
  address: string;
  tel: string;
  contactPerson: string;
}

export interface Invoice {
  id: string;
  userId: string;
  invoiceNo: string;
  refNo: string;
  orderNo: string;
  date: string;
  validity: string;
  sellerCompanyName: string;
  sellerAddress: string;
  sellerTel: string;
  sellerFax: string;
  sellerRepresentative: string;
  buyerSnapshot: BuyerSnapshot;
  commodity: string;
  currency: string;
  paymentTerms: string;
  incoterms: string;
  delivery: string;
  packing: string;
  remarks: string;
  items: InvoiceItem[];
  additionalCharges: AdditionalCharge[];
  totalAmount: number;
  bankInfo: BankInfo;
  createdAt: string;
}

export function createEmptyInvoice(): Omit<Invoice, "id" | "userId" | "createdAt"> {
  return {
    invoiceNo: "",
    refNo: "",
    orderNo: "",
    date: new Date().toISOString().split("T")[0],
    validity: "",
    sellerCompanyName: "",
    sellerAddress: "",
    sellerTel: "",
    sellerFax: "",
    sellerRepresentative: "",
    buyerSnapshot: {
      companyName: "",
      address: "",
      tel: "",
      contactPerson: "",
    },
    commodity: "",
    currency: "USD",
    paymentTerms: "",
    incoterms: "FOB",
    delivery: "",
    packing: "",
    remarks: "",
    items: [createEmptyItem()],
    additionalCharges: [],
    totalAmount: 0,
    bankInfo: {
      bankName: "",
      bankSwift: "",
      accountNo: "",
      accountee: "",
      bankAddress: "",
      bankTel: "",
      bankFax: "",
    },
  };
}

export function createEmptyItem(): InvoiceItem {
  return {
    description: "",
    hsCode: "",
    qty: 0,
    unit: "PCS",
    unitPrice: 0,
    amount: 0,
    remarks: "",
  };
}
```

`src/shared/types/index.ts`:

```ts
export type { Seller } from "../../entities/seller/model";
export type { Buyer } from "../../entities/buyer/model";
export type { Product } from "../../entities/product/model";
export type { BankInfo } from "../../entities/bank-info/model";
export type {
  Invoice,
  InvoiceItem,
  AdditionalCharge,
  BuyerSnapshot,
} from "../../entities/invoice/model";
```

- [ ] **Step 3: Commit**

```bash
git add src/entities src/shared/types src/app src/pages src/widgets src/features
git commit -m "chore: set up FSD folder structure and entity types"
```

---

### Task 3: Invoice Calculation Logic (TDD)

**Files:**
- Create: `src/entities/invoice/lib.ts`, `src/entities/invoice/lib.test.ts`
- Test: `src/entities/invoice/lib.test.ts`

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Add to `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [],
  },
});
```

Add `"types": ["vitest/globals"]` to `compilerOptions` in `tsconfig.app.json`.

- [ ] **Step 2: Write failing tests for calculation helpers**

`src/entities/invoice/lib.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  calcItemAmount,
  calcSubtotal,
  calcAdditionalChargesTotal,
  calcTotalAmount,
} from "./lib";
import type { InvoiceItem, AdditionalCharge } from "./model";

describe("calcItemAmount", () => {
  it("multiplies qty by unitPrice", () => {
    expect(calcItemAmount(3, 27.2)).toBe(81.6);
  });

  it("returns 0 when qty is 0", () => {
    expect(calcItemAmount(0, 100)).toBe(0);
  });

  it("handles decimal precision", () => {
    expect(calcItemAmount(7, 14.99)).toBe(104.93);
  });
});

describe("calcSubtotal", () => {
  it("sums all item amounts", () => {
    const items: InvoiceItem[] = [
      { description: "", hsCode: "", qty: 3, unit: "PCS", unitPrice: 27.2, amount: 81.6, remarks: "" },
      { description: "", hsCode: "", qty: 3, unit: "PCS", unitPrice: 30.6, amount: 91.8, remarks: "" },
    ];
    expect(calcSubtotal(items)).toBe(173.4);
  });

  it("returns 0 for empty items", () => {
    expect(calcSubtotal([])).toBe(0);
  });
});

describe("calcAdditionalChargesTotal", () => {
  it("sums all additional charges", () => {
    const charges: AdditionalCharge[] = [
      { description: "EMS", amount: 30 },
      { description: "Insurance", amount: 15 },
    ];
    expect(calcAdditionalChargesTotal(charges)).toBe(45);
  });

  it("returns 0 for empty charges", () => {
    expect(calcAdditionalChargesTotal([])).toBe(0);
  });
});

describe("calcTotalAmount", () => {
  it("sums subtotal and additional charges", () => {
    const items: InvoiceItem[] = [
      { description: "", hsCode: "", qty: 3, unit: "PCS", unitPrice: 27.2, amount: 81.6, remarks: "" },
      { description: "", hsCode: "", qty: 3, unit: "PCS", unitPrice: 27.2, amount: 81.6, remarks: "" },
      { description: "", hsCode: "", qty: 3, unit: "PCS", unitPrice: 30.6, amount: 91.8, remarks: "" },
    ];
    const charges: AdditionalCharge[] = [{ description: "EMS", amount: 30 }];
    expect(calcTotalAmount(items, charges)).toBe(285);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npx vitest run src/entities/invoice/lib.test.ts
```

Expected: FAIL — module `./lib` has no exports.

- [ ] **Step 4: Implement calculation helpers**

`src/entities/invoice/lib.ts`:

```ts
import type { InvoiceItem, AdditionalCharge } from "./model";

export function calcItemAmount(qty: number, unitPrice: number): number {
  return Math.round(qty * unitPrice * 100) / 100;
}

export function calcSubtotal(items: InvoiceItem[]): number {
  return Math.round(items.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
}

export function calcAdditionalChargesTotal(charges: AdditionalCharge[]): number {
  return Math.round(charges.reduce((sum, c) => sum + c.amount, 0) * 100) / 100;
}

export function calcTotalAmount(
  items: InvoiceItem[],
  charges: AdditionalCharge[]
): number {
  return Math.round((calcSubtotal(items) + calcAdditionalChargesTotal(charges)) * 100) / 100;
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run src/entities/invoice/lib.test.ts
```

Expected: 7 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/entities/invoice/lib.ts src/entities/invoice/lib.test.ts vite.config.ts tsconfig.app.json package.json package-lock.json
git commit -m "feat: add invoice calculation helpers with tests"
```

---

### Task 4: i18n Setup

**Files:**
- Create: `src/shared/i18n/config.ts`, `src/shared/i18n/locales/ko.json`, `src/shared/i18n/locales/en.json`, `src/shared/i18n/locales/zh.json`, `src/shared/i18n/locales/ja.json`

- [ ] **Step 1: Create English translation (base)**

`src/shared/i18n/locales/en.json`:

```json
{
  "app": {
    "title": "Proforma Invoice"
  },
  "nav": {
    "login": "Login",
    "logout": "Logout",
    "signup": "Sign Up"
  },
  "export": {
    "pdf": "PDF Download",
    "excel": "Excel Download",
    "print": "Print"
  },
  "form": {
    "documentInfo": "Document Info",
    "invoiceNo": "Invoice No.",
    "refNo": "Our Ref No.",
    "orderNo": "Your Order No.",
    "date": "Date",
    "validity": "Validity",
    "seller": "Seller",
    "buyer": "Buyer",
    "companyName": "Company Name",
    "address": "Address",
    "tel": "Tel",
    "fax": "Fax",
    "representative": "Representative",
    "contactPerson": "Contact Person",
    "tradeTerms": "Trade Terms",
    "commodity": "Commodity",
    "currency": "Currency",
    "paymentTerms": "Payment Terms",
    "incoterms": "Incoterms",
    "delivery": "Delivery",
    "packing": "Packing",
    "remarks": "Remarks",
    "items": "Items",
    "description": "Description",
    "hsCode": "HS Code",
    "qty": "Q'ty",
    "unit": "Unit",
    "unitPrice": "Unit Price",
    "amount": "Amount",
    "addItem": "Add Item",
    "removeItem": "Remove",
    "additionalCharges": "Additional Charges",
    "addCharge": "Add Charge",
    "removeCharge": "Remove",
    "subtotal": "Subtotal",
    "total": "Total",
    "bankInfo": "Bank Information",
    "bankName": "Bank Name",
    "bankSwift": "SWIFT Code",
    "accountNo": "Account No.",
    "accountee": "Accountee",
    "bankAddress": "Bank Address",
    "bankTel": "Bank Tel",
    "bankFax": "Bank Fax",
    "selectBuyer": "Select saved buyer",
    "selectProduct": "Select saved product",
    "noSavedBuyers": "No saved buyers",
    "noSavedProducts": "No saved products"
  },
  "invoice": {
    "proformaInvoice": "PROFORMA INVOICE",
    "to": "Messrs,",
    "faithfully": "Faithfully Yours,"
  },
  "auth": {
    "email": "Email",
    "password": "Password",
    "loginTitle": "Login",
    "signupTitle": "Sign Up",
    "loginButton": "Login",
    "signupButton": "Sign Up",
    "switchToSignup": "Don't have an account? Sign up",
    "switchToLogin": "Already have an account? Login",
    "loginSuccess": "Logged in successfully",
    "signupSuccess": "Account created successfully"
  }
}
```

- [ ] **Step 2: Create Korean translation**

`src/shared/i18n/locales/ko.json`:

```json
{
  "app": {
    "title": "프로포마 인보이스"
  },
  "nav": {
    "login": "로그인",
    "logout": "로그아웃",
    "signup": "회원가입"
  },
  "export": {
    "pdf": "PDF 다운로드",
    "excel": "엑셀 다운로드",
    "print": "인쇄"
  },
  "form": {
    "documentInfo": "문서 정보",
    "invoiceNo": "인보이스 번호",
    "refNo": "판매자 참조번호",
    "orderNo": "주문 번호",
    "date": "작성일",
    "validity": "유효기간",
    "seller": "판매자",
    "buyer": "구매자",
    "companyName": "회사명",
    "address": "주소",
    "tel": "전화번호",
    "fax": "팩스",
    "representative": "대표자",
    "contactPerson": "담당자",
    "tradeTerms": "거래 조건",
    "commodity": "대표 품목",
    "currency": "통화",
    "paymentTerms": "결제 조건",
    "incoterms": "무역 조건",
    "delivery": "인도 조건",
    "packing": "포장 조건",
    "remarks": "비고",
    "items": "품목",
    "description": "품명",
    "hsCode": "HS 코드",
    "qty": "수량",
    "unit": "단위",
    "unitPrice": "단가",
    "amount": "금액",
    "addItem": "품목 추가",
    "removeItem": "삭제",
    "additionalCharges": "추가 비용",
    "addCharge": "비용 추가",
    "removeCharge": "삭제",
    "subtotal": "소계",
    "total": "합계",
    "bankInfo": "은행 정보",
    "bankName": "은행명",
    "bankSwift": "SWIFT 코드",
    "accountNo": "계좌번호",
    "accountee": "예금주",
    "bankAddress": "은행 주소",
    "bankTel": "은행 전화번호",
    "bankFax": "은행 팩스",
    "selectBuyer": "저장된 거래처 선택",
    "selectProduct": "저장된 품목 선택",
    "noSavedBuyers": "저장된 거래처 없음",
    "noSavedProducts": "저장된 품목 없음"
  },
  "invoice": {
    "proformaInvoice": "프로포마 인보이스",
    "to": "수신,",
    "faithfully": "경구."
  },
  "auth": {
    "email": "이메일",
    "password": "비밀번호",
    "loginTitle": "로그인",
    "signupTitle": "회원가입",
    "loginButton": "로그인",
    "signupButton": "회원가입",
    "switchToSignup": "계정이 없으신가요? 회원가입",
    "switchToLogin": "이미 계정이 있으신가요? 로그인",
    "loginSuccess": "로그인 성공",
    "signupSuccess": "계정이 생성되었습니다"
  }
}
```

- [ ] **Step 3: Create Chinese translation**

`src/shared/i18n/locales/zh.json`:

```json
{
  "app": {
    "title": "形式发票"
  },
  "nav": {
    "login": "登录",
    "logout": "退出",
    "signup": "注册"
  },
  "export": {
    "pdf": "PDF 下载",
    "excel": "Excel 下载",
    "print": "打印"
  },
  "form": {
    "documentInfo": "文件信息",
    "invoiceNo": "发票号",
    "refNo": "卖方参考号",
    "orderNo": "订单号",
    "date": "日期",
    "validity": "有效期",
    "seller": "卖方",
    "buyer": "买方",
    "companyName": "公司名称",
    "address": "地址",
    "tel": "电话",
    "fax": "传真",
    "representative": "代表人",
    "contactPerson": "联系人",
    "tradeTerms": "贸易条件",
    "commodity": "商品",
    "currency": "货币",
    "paymentTerms": "付款条件",
    "incoterms": "贸易术语",
    "delivery": "交货条件",
    "packing": "包装",
    "remarks": "备注",
    "items": "商品明细",
    "description": "品名",
    "hsCode": "HS编码",
    "qty": "数量",
    "unit": "单位",
    "unitPrice": "单价",
    "amount": "金额",
    "addItem": "添加商品",
    "removeItem": "删除",
    "additionalCharges": "附加费用",
    "addCharge": "添加费用",
    "removeCharge": "删除",
    "subtotal": "小计",
    "total": "合计",
    "bankInfo": "银行信息",
    "bankName": "银行名称",
    "bankSwift": "SWIFT代码",
    "accountNo": "账号",
    "accountee": "户名",
    "bankAddress": "银行地址",
    "bankTel": "银行电话",
    "bankFax": "银行传真",
    "selectBuyer": "选择已保存的买方",
    "selectProduct": "选择已保存的商品",
    "noSavedBuyers": "没有已保存的买方",
    "noSavedProducts": "没有已保存的商品"
  },
  "invoice": {
    "proformaInvoice": "形式发票",
    "to": "致,",
    "faithfully": "此致敬礼,"
  },
  "auth": {
    "email": "邮箱",
    "password": "密码",
    "loginTitle": "登录",
    "signupTitle": "注册",
    "loginButton": "登录",
    "signupButton": "注册",
    "switchToSignup": "没有账号？注册",
    "switchToLogin": "已有账号？登录",
    "loginSuccess": "登录成功",
    "signupSuccess": "账号创建成功"
  }
}
```

- [ ] **Step 4: Create Japanese translation**

`src/shared/i18n/locales/ja.json`:

```json
{
  "app": {
    "title": "プロフォーマインボイス"
  },
  "nav": {
    "login": "ログイン",
    "logout": "ログアウト",
    "signup": "新規登録"
  },
  "export": {
    "pdf": "PDFダウンロード",
    "excel": "Excelダウンロード",
    "print": "印刷"
  },
  "form": {
    "documentInfo": "書類情報",
    "invoiceNo": "インボイス番号",
    "refNo": "売主参照番号",
    "orderNo": "注文番号",
    "date": "日付",
    "validity": "有効期限",
    "seller": "売主",
    "buyer": "買主",
    "companyName": "会社名",
    "address": "住所",
    "tel": "電話番号",
    "fax": "FAX",
    "representative": "代表者",
    "contactPerson": "担当者",
    "tradeTerms": "取引条件",
    "commodity": "商品",
    "currency": "通貨",
    "paymentTerms": "支払条件",
    "incoterms": "貿易条件",
    "delivery": "納期",
    "packing": "梱包",
    "remarks": "備考",
    "items": "品目",
    "description": "品名",
    "hsCode": "HSコード",
    "qty": "数量",
    "unit": "単位",
    "unitPrice": "単価",
    "amount": "金額",
    "addItem": "品目追加",
    "removeItem": "削除",
    "additionalCharges": "追加費用",
    "addCharge": "費用追加",
    "removeCharge": "削除",
    "subtotal": "小計",
    "total": "合計",
    "bankInfo": "銀行情報",
    "bankName": "銀行名",
    "bankSwift": "SWIFTコード",
    "accountNo": "口座番号",
    "accountee": "口座名義",
    "bankAddress": "銀行住所",
    "bankTel": "銀行電話番号",
    "bankFax": "銀行FAX",
    "selectBuyer": "保存済み買主を選択",
    "selectProduct": "保存済み品目を選択",
    "noSavedBuyers": "保存済み買主なし",
    "noSavedProducts": "保存済み品目なし"
  },
  "invoice": {
    "proformaInvoice": "プロフォーマインボイス",
    "to": "宛先,",
    "faithfully": "敬具,"
  },
  "auth": {
    "email": "メールアドレス",
    "password": "パスワード",
    "loginTitle": "ログイン",
    "signupTitle": "新規登録",
    "loginButton": "ログイン",
    "signupButton": "新規登録",
    "switchToSignup": "アカウントをお持ちでない方はこちら",
    "switchToLogin": "アカウントをお持ちの方はこちら",
    "loginSuccess": "ログインしました",
    "signupSuccess": "アカウントが作成されました"
  }
}
```

- [ ] **Step 5: Create i18n config**

`src/shared/i18n/config.ts`:

```ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import ko from "./locales/ko.json";
import zh from "./locales/zh.json";
import ja from "./locales/ja.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ko: { translation: ko },
      zh: { translation: zh },
      ja: { translation: ja },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

- [ ] **Step 6: Import i18n in main.tsx**

Add `import "./shared/i18n/config";` as the first import in `src/main.tsx`.

- [ ] **Step 7: Verify i18n loads without errors**

```bash
npm run dev
```

Expected: No console errors. App still renders.

- [ ] **Step 8: Commit**

```bash
git add src/shared/i18n
git commit -m "feat: add i18n setup with ko/en/zh/ja translations"
```

---

### Task 5: Shared UI Components

**Files:**
- Create: `src/shared/lib/cn.ts`, `src/shared/ui/Button.tsx`, `src/shared/ui/Input.tsx`, `src/shared/ui/Select.tsx`, `src/shared/ui/FormSection.tsx`, `src/shared/ui/Layout.tsx`

- [ ] **Step 1: Create class merge utility**

`src/shared/lib/cn.ts`:

```ts
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
```

- [ ] **Step 2: Create Button component**

`src/shared/ui/Button.tsx`:

```tsx
import { cn } from "../lib/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors rounded",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" && "bg-gray-900 text-white hover:bg-gray-800",
        variant === "secondary" && "bg-gray-100 text-gray-900 hover:bg-gray-200",
        variant === "ghost" && "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-sm",
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 3: Create Input component**

`src/shared/ui/Input.tsx`:

```tsx
import { cn } from "../lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-gray-500">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-3 py-2 text-sm border border-gray-200 rounded",
          "focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400",
          "placeholder:text-gray-300",
          className
        )}
        {...props}
      />
    </div>
  );
}
```

- [ ] **Step 4: Create Select component**

`src/shared/ui/Select.tsx`:

```tsx
import { cn } from "../lib/cn";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-gray-500">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "w-full px-3 py-2 text-sm border border-gray-200 rounded",
          "focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 5: Create FormSection component**

`src/shared/ui/FormSection.tsx`:

```tsx
interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
```

- [ ] **Step 6: Create Layout component**

`src/shared/ui/Layout.tsx`:

```tsx
interface LayoutProps {
  toolbar: React.ReactNode;
  children: React.ReactNode;
}

export function Layout({ toolbar, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3">
        {toolbar}
      </header>
      <main className="max-w-screen-2xl mx-auto">{children}</main>
    </div>
  );
}
```

- [ ] **Step 7: Verify components render**

Import and render a Button in App.tsx temporarily, check dev server.

- [ ] **Step 8: Commit**

```bash
git add src/shared/ui src/shared/lib/cn.ts
git commit -m "feat: add shared UI components (Button, Input, Select, FormSection, Layout)"
```

---

### Task 6: Supabase Client & Auth Provider

**Files:**
- Create: `src/shared/lib/supabase.ts`, `src/app/providers/AuthProvider.tsx`, `src/app/providers/index.tsx`, `.env.local`

- [ ] **Step 1: Create .env.local with Supabase credentials**

`.env.local`:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Add `.env.local` to `.gitignore`.

- [ ] **Step 2: Create Supabase client**

`src/shared/lib/supabase.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 3: Create AuthProvider**

`src/app/providers/AuthProvider.tsx`:

```tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../shared/lib/supabase";

interface AuthContext {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContext>({ user: null, loading: true });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

- [ ] **Step 4: Create providers composer**

`src/app/providers/index.tsx`:

```tsx
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
}
```

- [ ] **Step 5: Wire up providers in App.tsx**

`src/app/App.tsx`:

```tsx
import { Providers } from "./providers";
import { AppRouter } from "./router";

export default function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  );
}
```

- [ ] **Step 6: Create router stub**

`src/app/router.tsx`:

```tsx
import { Routes, Route } from "react-router-dom";

function InvoicePageStub() {
  return <div>Invoice Page</div>;
}

function LoginPageStub() {
  return <div>Login Page</div>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<InvoicePageStub />} />
      <Route path="/login" element={<LoginPageStub />} />
    </Routes>
  );
}
```

- [ ] **Step 7: Update main.tsx**

`src/main.tsx`:

```tsx
import "./shared/i18n/config";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 8: Verify routing works**

```bash
npm run dev
```

Expected: `/` shows "Invoice Page", `/login` shows "Login Page".

- [ ] **Step 9: Commit**

```bash
git add src/app src/shared/lib/supabase.ts .env.local .gitignore
git commit -m "feat: add Supabase client, AuthProvider, and routing"
```

---

### Task 7: Login Page & Auth Feature

**Files:**
- Create: `src/features/auth/api.ts`, `src/features/auth/ui/LoginForm.tsx`, `src/features/auth/ui/SignupForm.tsx`, `src/pages/LoginPage.tsx`

- [ ] **Step 1: Create auth API**

`src/features/auth/api.ts`:

```ts
import { supabase } from "../../shared/lib/supabase";

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signup(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
```

- [ ] **Step 2: Create LoginForm**

`src/features/auth/ui/LoginForm.tsx`:

```tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { login } from "../api";

export function LoginForm({ onSwitchToSignup }: { onSwitchToSignup: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t("auth.loginTitle")}</h2>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Input
        label={t("auth.email")}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label={t("auth.password")}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" disabled={loading} className="w-full">
        {t("auth.loginButton")}
      </Button>
      <button
        type="button"
        onClick={onSwitchToSignup}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        {t("auth.switchToSignup")}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create SignupForm**

`src/features/auth/ui/SignupForm.tsx`:

```tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { signup } from "../api";

export function SignupForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t("auth.signupTitle")}</h2>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Input
        label={t("auth.email")}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label={t("auth.password")}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
      <Button type="submit" disabled={loading} className="w-full">
        {t("auth.signupButton")}
      </Button>
      <button
        type="button"
        onClick={onSwitchToLogin}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        {t("auth.switchToLogin")}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Create LoginPage**

`src/pages/LoginPage.tsx`:

```tsx
import { useState } from "react";
import { LoginForm } from "../features/auth/ui/LoginForm";
import { SignupForm } from "../features/auth/ui/SignupForm";

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-lg border border-gray-200 p-8">
        {mode === "login" ? (
          <LoginForm onSwitchToSignup={() => setMode("signup")} />
        ) : (
          <SignupForm onSwitchToLogin={() => setMode("login")} />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Update router to use LoginPage**

In `src/app/router.tsx`, replace `LoginPageStub` import with:

```tsx
import { Routes, Route } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";

function InvoicePageStub() {
  return <div>Invoice Page</div>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<InvoicePageStub />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
```

- [ ] **Step 6: Verify login page renders**

```bash
npm run dev
```

Navigate to `/login`. Expected: Login form with email/password fields, toggle to signup.

- [ ] **Step 7: Commit**

```bash
git add src/features/auth src/pages/LoginPage.tsx src/app/router.tsx
git commit -m "feat: add login/signup page with Supabase auth"
```

---

### Task 8: Invoice Form — State Management & Form Shell

**Files:**
- Create: `src/widgets/InvoiceForm/useInvoiceForm.ts`, `src/widgets/InvoiceForm/index.tsx`

- [ ] **Step 1: Create invoice form hook**

`src/widgets/InvoiceForm/useInvoiceForm.ts`:

```ts
import { useState, useCallback } from "react";
import type { Invoice, InvoiceItem, AdditionalCharge } from "../../entities/invoice/model";
import { createEmptyInvoice, createEmptyItem } from "../../entities/invoice/model";
import { calcItemAmount, calcTotalAmount } from "../../entities/invoice/lib";

type InvoiceForm = Omit<Invoice, "id" | "userId" | "createdAt">;

export function useInvoiceForm() {
  const [form, setForm] = useState<InvoiceForm>(createEmptyInvoice());

  const updateField = useCallback(<K extends keyof InvoiceForm>(
    key: K,
    value: InvoiceForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateBuyer = useCallback(<K extends keyof InvoiceForm["buyerSnapshot"]>(
    key: K,
    value: InvoiceForm["buyerSnapshot"][K]
  ) => {
    setForm((prev) => ({
      ...prev,
      buyerSnapshot: { ...prev.buyerSnapshot, [key]: value },
    }));
  }, []);

  const updateBankInfo = useCallback(<K extends keyof InvoiceForm["bankInfo"]>(
    key: K,
    value: InvoiceForm["bankInfo"][K]
  ) => {
    setForm((prev) => ({
      ...prev,
      bankInfo: { ...prev.bankInfo, [key]: value },
    }));
  }, []);

  const updateItem = useCallback((index: number, field: keyof InvoiceItem, value: string | number) => {
    setForm((prev) => {
      const items = [...prev.items];
      const item = { ...items[index], [field]: value };
      if (field === "qty" || field === "unitPrice") {
        item.amount = calcItemAmount(
          field === "qty" ? (value as number) : item.qty,
          field === "unitPrice" ? (value as number) : item.unitPrice
        );
      }
      items[index] = item;
      const totalAmount = calcTotalAmount(items, prev.additionalCharges);
      return { ...prev, items, totalAmount };
    });
  }, []);

  const addItem = useCallback(() => {
    setForm((prev) => ({ ...prev, items: [...prev.items, createEmptyItem()] }));
  }, []);

  const removeItem = useCallback((index: number) => {
    setForm((prev) => {
      const items = prev.items.filter((_, i) => i !== index);
      const totalAmount = calcTotalAmount(items, prev.additionalCharges);
      return { ...prev, items, totalAmount };
    });
  }, []);

  const updateCharge = useCallback((index: number, field: keyof AdditionalCharge, value: string | number) => {
    setForm((prev) => {
      const charges = [...prev.additionalCharges];
      charges[index] = { ...charges[index], [field]: value };
      const totalAmount = calcTotalAmount(prev.items, charges);
      return { ...prev, additionalCharges: charges, totalAmount };
    });
  }, []);

  const addCharge = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      additionalCharges: [...prev.additionalCharges, { description: "", amount: 0 }],
    }));
  }, []);

  const removeCharge = useCallback((index: number) => {
    setForm((prev) => {
      const charges = prev.additionalCharges.filter((_, i) => i !== index);
      const totalAmount = calcTotalAmount(prev.items, charges);
      return { ...prev, additionalCharges: charges, totalAmount };
    });
  }, []);

  const loadForm = useCallback((data: InvoiceForm) => {
    setForm(data);
  }, []);

  return {
    form,
    updateField,
    updateBuyer,
    updateBankInfo,
    updateItem,
    addItem,
    removeItem,
    updateCharge,
    addCharge,
    removeCharge,
    loadForm,
  };
}
```

- [ ] **Step 2: Create form shell component**

`src/widgets/InvoiceForm/index.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import { FormSection } from "../../shared/ui/FormSection";
import type { useInvoiceForm } from "./useInvoiceForm";

type InvoiceFormProps = ReturnType<typeof useInvoiceForm>;

export function InvoiceForm(props: InvoiceFormProps) {
  const { t } = useTranslation();
  const { form } = props;

  return (
    <div className="space-y-6 p-6">
      <FormSection title={t("form.documentInfo")}>
        <p className="text-sm text-gray-400">Document info fields (Task 9)</p>
      </FormSection>
      <FormSection title={t("form.seller")}>
        <p className="text-sm text-gray-400">Seller fields (Task 9)</p>
      </FormSection>
      <FormSection title={t("form.buyer")}>
        <p className="text-sm text-gray-400">Buyer fields (Task 9)</p>
      </FormSection>
      <FormSection title={t("form.tradeTerms")}>
        <p className="text-sm text-gray-400">Trade terms fields (Task 9)</p>
      </FormSection>
      <FormSection title={t("form.items")}>
        <p className="text-sm text-gray-400">Items table (Task 9)</p>
      </FormSection>
      <FormSection title={t("form.additionalCharges")}>
        <p className="text-sm text-gray-400">Additional charges (Task 9)</p>
      </FormSection>
      <FormSection title={t("form.bankInfo")}>
        <p className="text-sm text-gray-400">Bank info fields (Task 9)</p>
      </FormSection>
      <div className="text-right text-lg font-bold text-gray-900">
        {t("form.total")}: {form.currency} {form.totalAmount.toFixed(2)}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/widgets/InvoiceForm
git commit -m "feat: add invoice form state management hook and form shell"
```

---

### Task 9: Invoice Form — All Sections

**Files:**
- Create: `src/widgets/InvoiceForm/DocumentInfoSection.tsx`, `src/widgets/InvoiceForm/SellerSection.tsx`, `src/widgets/InvoiceForm/BuyerSection.tsx`, `src/widgets/InvoiceForm/TradeTermsSection.tsx`, `src/widgets/InvoiceForm/ItemsTableSection.tsx`, `src/widgets/InvoiceForm/AdditionalChargesSection.tsx`, `src/widgets/InvoiceForm/BankInfoSection.tsx`
- Modify: `src/widgets/InvoiceForm/index.tsx`

- [ ] **Step 1: Create DocumentInfoSection**

`src/widgets/InvoiceForm/DocumentInfoSection.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import { Input } from "../../shared/ui/Input";
import { FormSection } from "../../shared/ui/FormSection";

interface Props {
  invoiceNo: string;
  refNo: string;
  orderNo: string;
  date: string;
  validity: string;
  onUpdate: (key: string, value: string) => void;
}

export function DocumentInfoSection({ invoiceNo, refNo, orderNo, date, validity, onUpdate }: Props) {
  const { t } = useTranslation();

  return (
    <FormSection title={t("form.documentInfo")}>
      <div className="grid grid-cols-2 gap-3">
        <Input label={t("form.invoiceNo")} value={invoiceNo} onChange={(e) => onUpdate("invoiceNo", e.target.value)} />
        <Input label={t("form.date")} type="date" value={date} onChange={(e) => onUpdate("date", e.target.value)} />
        <Input label={t("form.refNo")} value={refNo} onChange={(e) => onUpdate("refNo", e.target.value)} />
        <Input label={t("form.orderNo")} value={orderNo} onChange={(e) => onUpdate("orderNo", e.target.value)} />
        <Input label={t("form.validity")} type="date" value={validity} onChange={(e) => onUpdate("validity", e.target.value)} />
      </div>
    </FormSection>
  );
}
```

- [ ] **Step 2: Create SellerSection**

`src/widgets/InvoiceForm/SellerSection.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import { Input } from "../../shared/ui/Input";
import { FormSection } from "../../shared/ui/FormSection";

interface Props {
  companyName: string;
  address: string;
  tel: string;
  fax: string;
  representative: string;
  onUpdate: (key: string, value: string) => void;
}

export function SellerSection({ companyName, address, tel, fax, representative, onUpdate }: Props) {
  const { t } = useTranslation();

  return (
    <FormSection title={t("form.seller")}>
      <div className="grid grid-cols-2 gap-3">
        <Input label={t("form.companyName")} value={companyName} onChange={(e) => onUpdate("sellerCompanyName", e.target.value)} />
        <Input label={t("form.representative")} value={representative} onChange={(e) => onUpdate("sellerRepresentative", e.target.value)} />
        <Input label={t("form.address")} value={address} onChange={(e) => onUpdate("sellerAddress", e.target.value)} className="col-span-2" />
        <Input label={t("form.tel")} value={tel} onChange={(e) => onUpdate("sellerTel", e.target.value)} />
        <Input label={t("form.fax")} value={fax} onChange={(e) => onUpdate("sellerFax", e.target.value)} />
      </div>
    </FormSection>
  );
}
```

- [ ] **Step 3: Create BuyerSection**

`src/widgets/InvoiceForm/BuyerSection.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import { Input } from "../../shared/ui/Input";
import { FormSection } from "../../shared/ui/FormSection";

interface Props {
  companyName: string;
  address: string;
  tel: string;
  contactPerson: string;
  onUpdate: (key: string, value: string) => void;
}

export function BuyerSection({ companyName, address, tel, contactPerson, onUpdate }: Props) {
  const { t } = useTranslation();

  return (
    <FormSection title={t("form.buyer")}>
      <div className="grid grid-cols-2 gap-3">
        <Input label={t("form.companyName")} value={companyName} onChange={(e) => onUpdate("companyName", e.target.value)} />
        <Input label={t("form.contactPerson")} value={contactPerson} onChange={(e) => onUpdate("contactPerson", e.target.value)} />
        <Input label={t("form.address")} value={address} onChange={(e) => onUpdate("address", e.target.value)} className="col-span-2" />
        <Input label={t("form.tel")} value={tel} onChange={(e) => onUpdate("tel", e.target.value)} />
      </div>
    </FormSection>
  );
}
```

- [ ] **Step 4: Create TradeTermsSection**

`src/widgets/InvoiceForm/TradeTermsSection.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { FormSection } from "../../shared/ui/FormSection";

interface Props {
  commodity: string;
  currency: string;
  paymentTerms: string;
  incoterms: string;
  delivery: string;
  packing: string;
  remarks: string;
  onUpdate: (key: string, value: string) => void;
}

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "KRW", label: "KRW" },
  { value: "JPY", label: "JPY" },
  { value: "CNY", label: "CNY" },
  { value: "GBP", label: "GBP" },
];

const INCOTERMS_OPTIONS = [
  { value: "FOB", label: "FOB" },
  { value: "CIF", label: "CIF" },
  { value: "CFR", label: "CFR" },
  { value: "EXW", label: "EXW" },
  { value: "DDP", label: "DDP" },
  { value: "DAP", label: "DAP" },
];

export function TradeTermsSection({
  commodity, currency, paymentTerms, incoterms, delivery, packing, remarks, onUpdate,
}: Props) {
  const { t } = useTranslation();

  return (
    <FormSection title={t("form.tradeTerms")}>
      <div className="grid grid-cols-2 gap-3">
        <Input label={t("form.commodity")} value={commodity} onChange={(e) => onUpdate("commodity", e.target.value)} className="col-span-2" />
        <Select label={t("form.currency")} options={CURRENCY_OPTIONS} value={currency} onChange={(e) => onUpdate("currency", e.target.value)} />
        <Select label={t("form.incoterms")} options={INCOTERMS_OPTIONS} value={incoterms} onChange={(e) => onUpdate("incoterms", e.target.value)} />
        <Input label={t("form.paymentTerms")} value={paymentTerms} onChange={(e) => onUpdate("paymentTerms", e.target.value)} />
        <Input label={t("form.delivery")} value={delivery} onChange={(e) => onUpdate("delivery", e.target.value)} />
        <Input label={t("form.packing")} value={packing} onChange={(e) => onUpdate("packing", e.target.value)} />
        <Input label={t("form.remarks")} value={remarks} onChange={(e) => onUpdate("remarks", e.target.value)} />
      </div>
    </FormSection>
  );
}
```

- [ ] **Step 5: Create ItemsTableSection**

`src/widgets/InvoiceForm/ItemsTableSection.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import { Button } from "../../shared/ui/Button";
import { FormSection } from "../../shared/ui/FormSection";
import { calcSubtotal } from "../../entities/invoice/lib";
import type { InvoiceItem } from "../../entities/invoice/model";

interface Props {
  items: InvoiceItem[];
  currency: string;
  onUpdateItem: (index: number, field: keyof InvoiceItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

export function ItemsTableSection({ items, currency, onUpdateItem, onAddItem, onRemoveItem }: Props) {
  const { t } = useTranslation();
  const subtotal = calcSubtotal(items);

  return (
    <FormSection title={t("form.items")}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-900 text-left">
              <th className="py-2 pr-2 font-medium text-gray-600">{t("form.description")}</th>
              <th className="py-2 pr-2 font-medium text-gray-600 w-24">{t("form.hsCode")}</th>
              <th className="py-2 pr-2 font-medium text-gray-600 w-16">{t("form.qty")}</th>
              <th className="py-2 pr-2 font-medium text-gray-600 w-16">{t("form.unit")}</th>
              <th className="py-2 pr-2 font-medium text-gray-600 w-24">{t("form.unitPrice")}</th>
              <th className="py-2 pr-2 font-medium text-gray-600 w-24">{t("form.amount")}</th>
              <th className="py-2 pr-2 font-medium text-gray-600">{t("form.remarks")}</th>
              <th className="py-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-1 pr-2">
                  <input className="w-full px-2 py-1 border border-gray-200 rounded text-sm" value={item.description} onChange={(e) => onUpdateItem(i, "description", e.target.value)} />
                </td>
                <td className="py-1 pr-2">
                  <input className="w-full px-2 py-1 border border-gray-200 rounded text-sm" value={item.hsCode} onChange={(e) => onUpdateItem(i, "hsCode", e.target.value)} />
                </td>
                <td className="py-1 pr-2">
                  <input className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right" type="number" min="0" value={item.qty || ""} onChange={(e) => onUpdateItem(i, "qty", Number(e.target.value))} />
                </td>
                <td className="py-1 pr-2">
                  <input className="w-full px-2 py-1 border border-gray-200 rounded text-sm" value={item.unit} onChange={(e) => onUpdateItem(i, "unit", e.target.value)} />
                </td>
                <td className="py-1 pr-2">
                  <input className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right" type="number" min="0" step="0.01" value={item.unitPrice || ""} onChange={(e) => onUpdateItem(i, "unitPrice", Number(e.target.value))} />
                </td>
                <td className="py-1 pr-2 text-right text-sm text-gray-700">
                  {item.amount.toFixed(2)}
                </td>
                <td className="py-1 pr-2">
                  <input className="w-full px-2 py-1 border border-gray-200 rounded text-sm" value={item.remarks} onChange={(e) => onUpdateItem(i, "remarks", e.target.value)} />
                </td>
                <td className="py-1">
                  {items.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => onRemoveItem(i)}>
                      {t("form.removeItem")}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center pt-2">
        <Button variant="secondary" size="sm" onClick={onAddItem}>
          + {t("form.addItem")}
        </Button>
        <div className="text-sm text-gray-600">
          {t("form.subtotal")}: {currency} {subtotal.toFixed(2)}
        </div>
      </div>
    </FormSection>
  );
}
```

- [ ] **Step 6: Create AdditionalChargesSection**

`src/widgets/InvoiceForm/AdditionalChargesSection.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import { Button } from "../../shared/ui/Button";
import { FormSection } from "../../shared/ui/FormSection";
import type { AdditionalCharge } from "../../entities/invoice/model";

interface Props {
  charges: AdditionalCharge[];
  currency: string;
  onUpdateCharge: (index: number, field: keyof AdditionalCharge, value: string | number) => void;
  onAddCharge: () => void;
  onRemoveCharge: (index: number) => void;
}

export function AdditionalChargesSection({
  charges, currency, onUpdateCharge, onAddCharge, onRemoveCharge,
}: Props) {
  const { t } = useTranslation();

  return (
    <FormSection title={t("form.additionalCharges")}>
      {charges.map((charge, i) => (
        <div key={i} className="flex gap-3 items-end">
          <div className="flex-1">
            <input
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded"
              placeholder={t("form.description")}
              value={charge.description}
              onChange={(e) => onUpdateCharge(i, "description", e.target.value)}
            />
          </div>
          <div className="w-32">
            <input
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded text-right"
              type="number"
              min="0"
              step="0.01"
              placeholder={t("form.amount")}
              value={charge.amount || ""}
              onChange={(e) => onUpdateCharge(i, "amount", Number(e.target.value))}
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => onRemoveCharge(i)}>
            {t("form.removeCharge")}
          </Button>
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={onAddCharge}>
        + {t("form.addCharge")}
      </Button>
    </FormSection>
  );
}
```

- [ ] **Step 7: Create BankInfoSection**

`src/widgets/InvoiceForm/BankInfoSection.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import { Input } from "../../shared/ui/Input";
import { FormSection } from "../../shared/ui/FormSection";
import type { BankInfo } from "../../entities/bank-info/model";

interface Props {
  bankInfo: BankInfo;
  onUpdate: (key: keyof BankInfo, value: string) => void;
}

export function BankInfoSection({ bankInfo, onUpdate }: Props) {
  const { t } = useTranslation();

  return (
    <FormSection title={t("form.bankInfo")}>
      <div className="grid grid-cols-2 gap-3">
        <Input label={t("form.bankName")} value={bankInfo.bankName} onChange={(e) => onUpdate("bankName", e.target.value)} />
        <Input label={t("form.bankSwift")} value={bankInfo.bankSwift} onChange={(e) => onUpdate("bankSwift", e.target.value)} />
        <Input label={t("form.accountNo")} value={bankInfo.accountNo} onChange={(e) => onUpdate("accountNo", e.target.value)} />
        <Input label={t("form.accountee")} value={bankInfo.accountee} onChange={(e) => onUpdate("accountee", e.target.value)} />
        <Input label={t("form.bankAddress")} value={bankInfo.bankAddress} onChange={(e) => onUpdate("bankAddress", e.target.value)} className="col-span-2" />
        <Input label={t("form.bankTel")} value={bankInfo.bankTel} onChange={(e) => onUpdate("bankTel", e.target.value)} />
        <Input label={t("form.bankFax")} value={bankInfo.bankFax} onChange={(e) => onUpdate("bankFax", e.target.value)} />
      </div>
    </FormSection>
  );
}
```

- [ ] **Step 8: Update InvoiceForm index to use all sections**

Replace `src/widgets/InvoiceForm/index.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import { DocumentInfoSection } from "./DocumentInfoSection";
import { SellerSection } from "./SellerSection";
import { BuyerSection } from "./BuyerSection";
import { TradeTermsSection } from "./TradeTermsSection";
import { ItemsTableSection } from "./ItemsTableSection";
import { AdditionalChargesSection } from "./AdditionalChargesSection";
import { BankInfoSection } from "./BankInfoSection";
import type { useInvoiceForm } from "./useInvoiceForm";

type InvoiceFormProps = ReturnType<typeof useInvoiceForm>;

export function InvoiceForm({
  form, updateField, updateBuyer, updateBankInfo,
  updateItem, addItem, removeItem,
  updateCharge, addCharge, removeCharge,
}: InvoiceFormProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 p-6 overflow-y-auto">
      <DocumentInfoSection
        invoiceNo={form.invoiceNo} refNo={form.refNo} orderNo={form.orderNo}
        date={form.date} validity={form.validity}
        onUpdate={(key, value) => updateField(key as any, value)}
      />
      <SellerSection
        companyName={form.sellerCompanyName} address={form.sellerAddress}
        tel={form.sellerTel} fax={form.sellerFax} representative={form.sellerRepresentative}
        onUpdate={(key, value) => updateField(key as any, value)}
      />
      <BuyerSection
        companyName={form.buyerSnapshot.companyName} address={form.buyerSnapshot.address}
        tel={form.buyerSnapshot.tel} contactPerson={form.buyerSnapshot.contactPerson}
        onUpdate={(key, value) => updateBuyer(key as any, value)}
      />
      <TradeTermsSection
        commodity={form.commodity} currency={form.currency} paymentTerms={form.paymentTerms}
        incoterms={form.incoterms} delivery={form.delivery} packing={form.packing} remarks={form.remarks}
        onUpdate={(key, value) => updateField(key as any, value)}
      />
      <ItemsTableSection
        items={form.items} currency={form.currency}
        onUpdateItem={updateItem} onAddItem={addItem} onRemoveItem={removeItem}
      />
      <AdditionalChargesSection
        charges={form.additionalCharges} currency={form.currency}
        onUpdateCharge={updateCharge} onAddCharge={addCharge} onRemoveCharge={removeCharge}
      />
      <BankInfoSection bankInfo={form.bankInfo} onUpdate={updateBankInfo} />
      <div className="text-right text-lg font-bold text-gray-900 border-t-2 border-gray-900 pt-3">
        {t("form.total")}: {form.currency} {form.totalAmount.toFixed(2)}
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Verify form renders with all sections**

```bash
npm run dev
```

Expected: All 7 form sections render with input fields. Item add/remove works.

- [ ] **Step 10: Commit**

```bash
git add src/widgets/InvoiceForm
git commit -m "feat: implement all invoice form sections"
```

---

### Task 10: Invoice Preview Widget

**Files:**
- Create: `src/widgets/InvoicePreview/index.tsx`

- [ ] **Step 1: Create InvoicePreview component**

`src/widgets/InvoicePreview/index.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import { calcSubtotal, calcAdditionalChargesTotal } from "../../entities/invoice/lib";
import type { Invoice } from "../../entities/invoice/model";

type PreviewData = Omit<Invoice, "id" | "userId" | "createdAt">;

export function InvoicePreview({ data }: { data: PreviewData }) {
  const { t } = useTranslation();
  const subtotal = calcSubtotal(data.items);
  const chargesTotal = calcAdditionalChargesTotal(data.additionalCharges);

  return (
    <div className="bg-white border border-gray-200 rounded p-8 text-sm leading-relaxed print:border-none print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs text-gray-500">{t("invoice.to")}</p>
          <p className="font-semibold">{data.buyerSnapshot.companyName || "—"}</p>
          <p className="text-gray-600">{data.buyerSnapshot.address}</p>
          <p className="text-gray-600">{data.buyerSnapshot.tel}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{t("form.date")}</p>
          <p>{data.date || "—"}</p>
          <p className="text-xs text-gray-500 mt-2">{t("form.refNo")}</p>
          <p>{data.refNo || "—"}</p>
          <p className="text-xs text-gray-500 mt-2">{t("form.orderNo")}</p>
          <p>{data.orderNo || "—"}</p>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-center text-lg font-bold tracking-wide mb-6 border-b pb-3">
        {t("invoice.proformaInvoice")}
      </h1>

      {/* Invoice No */}
      <p className="text-xs text-gray-500 mb-4">{t("form.invoiceNo")}: {data.invoiceNo || "—"}</p>

      {/* Terms */}
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 mb-6 text-xs">
        {data.delivery && <><span className="text-gray-500">*{t("form.delivery")}</span><span>: {data.delivery}</span></>}
        {data.paymentTerms && <><span className="text-gray-500">*{t("form.paymentTerms")}</span><span>: {data.paymentTerms}</span></>}
        {data.packing && <><span className="text-gray-500">*{t("form.packing")}</span><span>: {data.packing}</span></>}
        {data.validity && <><span className="text-gray-500">*{t("form.validity")}</span><span>: {data.validity}</span></>}
        {data.incoterms && <><span className="text-gray-500">*{t("form.incoterms")}</span><span>: {data.incoterms}</span></>}
        {data.remarks && <><span className="text-gray-500">*{t("form.remarks")}</span><span>: {data.remarks}</span></>}
      </div>

      {/* Commodity */}
      {data.commodity && (
        <p className="text-xs text-gray-600 mb-3">{t("form.commodity")}: {data.commodity}</p>
      )}

      {/* Items Table */}
      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="text-left py-2 text-xs font-semibold text-gray-600">{t("form.description")}</th>
            <th className="text-left py-2 text-xs font-semibold text-gray-600">{t("form.hsCode")}</th>
            <th className="text-center py-2 text-xs font-semibold text-gray-600">{t("form.qty")}</th>
            <th className="text-center py-2 text-xs font-semibold text-gray-600">{t("form.unit")}</th>
            <th className="text-right py-2 text-xs font-semibold text-gray-600">{t("form.unitPrice")}</th>
            <th className="text-right py-2 text-xs font-semibold text-gray-600">{t("form.amount")}</th>
            <th className="text-left py-2 text-xs font-semibold text-gray-600">{t("form.remarks")}</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-1.5">{item.description}</td>
              <td className="py-1.5">{item.hsCode}</td>
              <td className="py-1.5 text-center">{item.qty || ""}</td>
              <td className="py-1.5 text-center">{item.unit}</td>
              <td className="py-1.5 text-right">{item.unitPrice ? item.unitPrice.toFixed(2) : ""}</td>
              <td className="py-1.5 text-right">{item.amount ? item.amount.toFixed(2) : ""}</td>
              <td className="py-1.5">{item.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Additional Charges */}
      {data.additionalCharges.length > 0 && (
        <div className="mb-2">
          {data.additionalCharges.map((charge, i) => (
            <div key={i} className="flex justify-between text-xs py-0.5">
              <span className="text-gray-600">{charge.description}</span>
              <span>{charge.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      <div className="border-t-2 border-gray-900 pt-2 text-right font-bold">
        {t("form.total")}: {data.currency} {data.totalAmount.toFixed(2)}
      </div>

      {/* Closing */}
      <p className="mt-8 text-xs text-gray-500">{t("invoice.faithfully")}</p>

      {/* Seller Info */}
      {data.sellerCompanyName && (
        <div className="mt-4 text-xs text-gray-600">
          <p className="font-semibold text-gray-800">{data.sellerCompanyName}</p>
          <p>{data.sellerAddress}</p>
          {data.sellerTel && <p>Tel: {data.sellerTel}</p>}
          {data.sellerFax && <p>Fax: {data.sellerFax}</p>}
        </div>
      )}

      {/* Bank Info */}
      {data.bankInfo.bankName && (
        <div className="mt-6 border-t border-gray-100 pt-4 text-xs">
          <p className="font-semibold text-gray-700 mb-1">{t("form.bankInfo")}</p>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-gray-600">
            <span>{t("form.bankName")}</span><span>{data.bankInfo.bankName}</span>
            <span>{t("form.bankSwift")}</span><span>{data.bankInfo.bankSwift}</span>
            <span>{t("form.accountNo")}</span><span>{data.bankInfo.accountNo}</span>
            <span>{t("form.accountee")}</span><span>{data.bankInfo.accountee}</span>
            {data.bankInfo.bankAddress && <><span>{t("form.bankAddress")}</span><span>{data.bankInfo.bankAddress}</span></>}
            {data.bankInfo.bankTel && <><span>{t("form.bankTel")}</span><span>{data.bankInfo.bankTel}</span></>}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/widgets/InvoicePreview
git commit -m "feat: add live invoice preview component"
```

---

### Task 11: Invoice Page — Split Layout + Toolbar

**Files:**
- Create: `src/widgets/ExportToolbar/index.tsx`, `src/features/i18n-switch/ui/LanguageSwitcher.tsx`, `src/pages/InvoicePage.tsx`
- Modify: `src/app/router.tsx`

- [ ] **Step 1: Create LanguageSwitcher**

`src/features/i18n-switch/ui/LanguageSwitcher.tsx`:

```tsx
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex gap-1">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            i18n.language === lang.code
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create ExportToolbar (stub — export logic in later tasks)**

`src/widgets/ExportToolbar/index.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/ui/Button";
import { LanguageSwitcher } from "../../features/i18n-switch/ui/LanguageSwitcher";
import { useAuth } from "../../app/providers/AuthProvider";
import { logout } from "../../features/auth/api";
import type { Invoice } from "../../entities/invoice/model";

type FormData = Omit<Invoice, "id" | "userId" | "createdAt">;

interface Props {
  formData: FormData;
}

export function ExportToolbar({ formData }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-lg font-bold text-gray-900">{t("app.title")}</h1>
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => alert("PDF — Task 12")}>
          {t("export.pdf")}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => alert("Excel — Task 13")}>
          {t("export.excel")}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          {t("export.print")}
        </Button>
        <div className="w-px h-6 bg-gray-200" />
        <LanguageSwitcher />
        <div className="w-px h-6 bg-gray-200" />
        {user ? (
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            {t("nav.logout")}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
            {t("nav.login")}
          </Button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create InvoicePage with split layout**

`src/pages/InvoicePage.tsx`:

```tsx
import { Layout } from "../shared/ui/Layout";
import { InvoiceForm } from "../widgets/InvoiceForm";
import { InvoicePreview } from "../widgets/InvoicePreview";
import { ExportToolbar } from "../widgets/ExportToolbar";
import { useInvoiceForm } from "../widgets/InvoiceForm/useInvoiceForm";

export function InvoicePage() {
  const invoiceForm = useInvoiceForm();

  return (
    <Layout toolbar={<ExportToolbar formData={invoiceForm.form} />}>
      <div className="flex h-[calc(100vh-57px)]">
        {/* Left: Form */}
        <div className="w-1/2 overflow-y-auto border-r border-gray-200">
          <InvoiceForm {...invoiceForm} />
        </div>
        {/* Right: Preview */}
        <div className="w-1/2 overflow-y-auto bg-gray-50 p-6">
          <InvoicePreview data={invoiceForm.form} />
        </div>
      </div>
    </Layout>
  );
}
```

- [ ] **Step 4: Update router**

Replace `src/app/router.tsx`:

```tsx
import { Routes, Route } from "react-router-dom";
import { InvoicePage } from "../pages/InvoicePage";
import { LoginPage } from "../pages/LoginPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<InvoicePage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
```

- [ ] **Step 5: Verify split layout in browser**

```bash
npm run dev
```

Expected: Left side shows form with all sections. Right side shows live preview that updates as you type. Toolbar shows export buttons, language switcher, login button.

- [ ] **Step 6: Commit**

```bash
git add src/pages/InvoicePage.tsx src/widgets/ExportToolbar src/features/i18n-switch src/app/router.tsx
git commit -m "feat: add invoice page with split layout, toolbar, and language switcher"
```

---

### Task 12: PDF Export

**Files:**
- Create: `src/features/export-pdf/PdfDocument.tsx`, `src/features/export-pdf/generatePdf.ts`
- Modify: `src/widgets/ExportToolbar/index.tsx`

- [ ] **Step 1: Create PDF document component**

`src/features/export-pdf/PdfDocument.tsx`:

```tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Invoice } from "../../entities/invoice/model";
import { calcSubtotal } from "../../entities/invoice/lib";

type PdfData = Omit<Invoice, "id" | "userId" | "createdAt">;

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: "Helvetica", lineHeight: 1.4 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  title: { textAlign: "center", fontSize: 14, fontWeight: "bold", letterSpacing: 1, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#333", paddingBottom: 8 },
  label: { fontSize: 7, color: "#888" },
  bold: { fontWeight: "bold" },
  row: { flexDirection: "row" },
  termRow: { flexDirection: "row", marginBottom: 2 },
  termLabel: { fontSize: 8, color: "#666", width: 80 },
  termValue: { fontSize: 8 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: "#333", paddingBottom: 4, marginBottom: 4 },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#eee", paddingVertical: 3 },
  colDesc: { width: "25%" },
  colHs: { width: "12%" },
  colQty: { width: "8%", textAlign: "center" },
  colUnit: { width: "8%", textAlign: "center" },
  colPrice: { width: "12%", textAlign: "right" },
  colAmt: { width: "12%", textAlign: "right" },
  colRem: { width: "23%" },
  thText: { fontSize: 8, fontWeight: "bold", color: "#555" },
  totalRow: { borderTopWidth: 2, borderTopColor: "#333", paddingTop: 6, marginTop: 4, flexDirection: "row", justifyContent: "flex-end" },
  totalText: { fontSize: 11, fontWeight: "bold" },
  section: { marginTop: 16 },
  bankGrid: { flexDirection: "row", marginBottom: 1 },
  bankLabel: { width: 80, fontSize: 8, color: "#666" },
  bankValue: { fontSize: 8 },
});

interface Props {
  data: PdfData;
  labels: Record<string, string>;
}

export function PdfDocument({ data, labels }: Props) {
  const subtotal = calcSubtotal(data.items);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.label}>{labels.to}</Text>
            <Text style={s.bold}>{data.buyerSnapshot.companyName}</Text>
            <Text>{data.buyerSnapshot.address}</Text>
            <Text>{data.buyerSnapshot.tel}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.label}>{labels.date}</Text>
            <Text>{data.date}</Text>
            <Text style={[s.label, { marginTop: 4 }]}>{labels.refNo}</Text>
            <Text>{data.refNo}</Text>
            <Text style={[s.label, { marginTop: 4 }]}>{labels.orderNo}</Text>
            <Text>{data.orderNo}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={s.title}>{labels.proformaInvoice}</Text>
        <Text style={{ fontSize: 8, color: "#888", marginBottom: 12 }}>{labels.invoiceNo}: {data.invoiceNo}</Text>

        {/* Terms */}
        <View style={{ marginBottom: 12 }}>
          {data.delivery && <View style={s.termRow}><Text style={s.termLabel}>*{labels.delivery}</Text><Text style={s.termValue}>: {data.delivery}</Text></View>}
          {data.paymentTerms && <View style={s.termRow}><Text style={s.termLabel}>*{labels.paymentTerms}</Text><Text style={s.termValue}>: {data.paymentTerms}</Text></View>}
          {data.packing && <View style={s.termRow}><Text style={s.termLabel}>*{labels.packing}</Text><Text style={s.termValue}>: {data.packing}</Text></View>}
          {data.validity && <View style={s.termRow}><Text style={s.termLabel}>*{labels.validity}</Text><Text style={s.termValue}>: {data.validity}</Text></View>}
          {data.incoterms && <View style={s.termRow}><Text style={s.termLabel}>*{labels.incoterms}</Text><Text style={s.termValue}>: {data.incoterms}</Text></View>}
          {data.remarks && <View style={s.termRow}><Text style={s.termLabel}>*{labels.remarks}</Text><Text style={s.termValue}>: {data.remarks}</Text></View>}
        </View>

        {data.commodity && <Text style={{ fontSize: 8, color: "#666", marginBottom: 8 }}>{labels.commodity}: {data.commodity}</Text>}

        {/* Items Table */}
        <View style={s.tableHeader}>
          <Text style={[s.thText, s.colDesc]}>{labels.description}</Text>
          <Text style={[s.thText, s.colHs]}>{labels.hsCode}</Text>
          <Text style={[s.thText, s.colQty]}>{labels.qty}</Text>
          <Text style={[s.thText, s.colUnit]}>{labels.unit}</Text>
          <Text style={[s.thText, s.colPrice]}>{labels.unitPrice}</Text>
          <Text style={[s.thText, s.colAmt]}>{labels.amount}</Text>
          <Text style={[s.thText, s.colRem]}>{labels.remarks}</Text>
        </View>
        {data.items.map((item, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={s.colDesc}>{item.description}</Text>
            <Text style={s.colHs}>{item.hsCode}</Text>
            <Text style={s.colQty}>{item.qty || ""}</Text>
            <Text style={s.colUnit}>{item.unit}</Text>
            <Text style={s.colPrice}>{item.unitPrice ? item.unitPrice.toFixed(2) : ""}</Text>
            <Text style={s.colAmt}>{item.amount ? item.amount.toFixed(2) : ""}</Text>
            <Text style={s.colRem}>{item.remarks}</Text>
          </View>
        ))}

        {/* Additional Charges */}
        {data.additionalCharges.map((charge, i) => (
          <View key={i} style={[s.row, { justifyContent: "space-between", paddingVertical: 2 }]}>
            <Text style={{ fontSize: 8, color: "#666" }}>{charge.description}</Text>
            <Text style={{ fontSize: 8 }}>{charge.amount.toFixed(2)}</Text>
          </View>
        ))}

        {/* Total */}
        <View style={s.totalRow}>
          <Text style={s.totalText}>{labels.total}: {data.currency} {data.totalAmount.toFixed(2)}</Text>
        </View>

        {/* Closing */}
        <Text style={{ marginTop: 24, fontSize: 8, color: "#888" }}>{labels.faithfully}</Text>

        {/* Seller */}
        {data.sellerCompanyName && (
          <View style={s.section}>
            <Text style={s.bold}>{data.sellerCompanyName}</Text>
            <Text>{data.sellerAddress}</Text>
            {data.sellerTel && <Text>Tel: {data.sellerTel}</Text>}
          </View>
        )}

        {/* Bank */}
        {data.bankInfo.bankName && (
          <View style={[s.section, { borderTopWidth: 0.5, borderTopColor: "#ddd", paddingTop: 8 }]}>
            <Text style={[s.bold, { marginBottom: 4 }]}>{labels.bankInfo}</Text>
            <View style={s.bankGrid}><Text style={s.bankLabel}>{labels.bankName}</Text><Text style={s.bankValue}>{data.bankInfo.bankName}</Text></View>
            <View style={s.bankGrid}><Text style={s.bankLabel}>{labels.bankSwift}</Text><Text style={s.bankValue}>{data.bankInfo.bankSwift}</Text></View>
            <View style={s.bankGrid}><Text style={s.bankLabel}>{labels.accountNo}</Text><Text style={s.bankValue}>{data.bankInfo.accountNo}</Text></View>
            <View style={s.bankGrid}><Text style={s.bankLabel}>{labels.accountee}</Text><Text style={s.bankValue}>{data.bankInfo.accountee}</Text></View>
            {data.bankInfo.bankAddress && <View style={s.bankGrid}><Text style={s.bankLabel}>{labels.bankAddress}</Text><Text style={s.bankValue}>{data.bankInfo.bankAddress}</Text></View>}
          </View>
        )}
      </Page>
    </Document>
  );
}
```

- [ ] **Step 2: Create PDF generation function**

`src/features/export-pdf/generatePdf.ts`:

```ts
import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import { saveAs } from "file-saver";
import { PdfDocument } from "./PdfDocument";
import type { Invoice } from "../../entities/invoice/model";
import type { TFunction } from "i18next";

type FormData = Omit<Invoice, "id" | "userId" | "createdAt">;

export async function generatePdf(data: FormData, t: TFunction) {
  const labels = {
    to: t("invoice.to"),
    proformaInvoice: t("invoice.proformaInvoice"),
    faithfully: t("invoice.faithfully"),
    date: t("form.date"),
    refNo: t("form.refNo"),
    orderNo: t("form.orderNo"),
    invoiceNo: t("form.invoiceNo"),
    delivery: t("form.delivery"),
    paymentTerms: t("form.paymentTerms"),
    packing: t("form.packing"),
    validity: t("form.validity"),
    incoterms: t("form.incoterms"),
    remarks: t("form.remarks"),
    commodity: t("form.commodity"),
    description: t("form.description"),
    hsCode: t("form.hsCode"),
    qty: t("form.qty"),
    unit: t("form.unit"),
    unitPrice: t("form.unitPrice"),
    amount: t("form.amount"),
    total: t("form.total"),
    bankInfo: t("form.bankInfo"),
    bankName: t("form.bankName"),
    bankSwift: t("form.bankSwift"),
    accountNo: t("form.accountNo"),
    accountee: t("form.accountee"),
    bankAddress: t("form.bankAddress"),
  };

  const doc = createElement(PdfDocument, { data, labels });
  const blob = await pdf(doc).toBlob();
  const filename = `PI_${data.invoiceNo || "draft"}_${data.date || "undated"}.pdf`;
  saveAs(blob, filename);
}
```

- [ ] **Step 3: Wire PDF button in ExportToolbar**

In `src/widgets/ExportToolbar/index.tsx`, replace the PDF button alert:

```tsx
import { generatePdf } from "../../features/export-pdf/generatePdf";
```

Replace the PDF `onClick`:

```tsx
<Button variant="secondary" size="sm" onClick={() => generatePdf(formData, t)}>
  {t("export.pdf")}
</Button>
```

Remove the unused `alert` calls. Add `useTranslation` import and `const { t } = useTranslation();` if not already there.

- [ ] **Step 4: Verify PDF download**

```bash
npm run dev
```

Fill in some invoice fields, click "PDF Download". Expected: A PDF file downloads with the invoice content.

- [ ] **Step 5: Commit**

```bash
git add src/features/export-pdf src/widgets/ExportToolbar
git commit -m "feat: add PDF export with @react-pdf/renderer"
```

---

### Task 13: Excel Export

**Files:**
- Create: `src/features/export-excel/generateExcel.ts`
- Modify: `src/widgets/ExportToolbar/index.tsx`

- [ ] **Step 1: Create Excel generation function**

`src/features/export-excel/generateExcel.ts`:

```ts
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { Invoice } from "../../entities/invoice/model";
import type { TFunction } from "i18next";

type FormData = Omit<Invoice, "id" | "userId" | "createdAt">;

export async function generateExcel(data: FormData, t: TFunction) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Proforma Invoice");

  ws.columns = [
    { width: 5 },   // A
    { width: 20 },  // B
    { width: 15 },  // C
    { width: 10 },  // D
    { width: 10 },  // E
    { width: 12 },  // F
    { width: 12 },  // G
    { width: 18 },  // H
  ];

  const thin = { style: "thin" as const, color: { argb: "FF999999" } };
  const thick = { style: "medium" as const, color: { argb: "FF333333" } };

  let row = 1;

  // Title
  ws.mergeCells(`B${row}:H${row}`);
  const titleCell = ws.getCell(`B${row}`);
  titleCell.value = t("invoice.proformaInvoice");
  titleCell.font = { size: 14, bold: true };
  titleCell.alignment = { horizontal: "center" };
  row += 2;

  // Buyer + Date
  ws.getCell(`B${row}`).value = `${t("invoice.to")} ${data.buyerSnapshot.companyName}`;
  ws.getCell(`B${row}`).font = { bold: true };
  ws.getCell(`G${row}`).value = `${t("form.date")}: ${data.date}`;
  row++;
  ws.getCell(`B${row}`).value = data.buyerSnapshot.address;
  ws.getCell(`G${row}`).value = `${t("form.refNo")}: ${data.refNo}`;
  row++;
  ws.getCell(`B${row}`).value = data.buyerSnapshot.tel;
  ws.getCell(`G${row}`).value = `${t("form.orderNo")}: ${data.orderNo}`;
  row += 2;

  // Invoice No
  ws.getCell(`B${row}`).value = `${t("form.invoiceNo")}: ${data.invoiceNo}`;
  row += 2;

  // Terms
  const terms = [
    { label: t("form.delivery"), value: data.delivery },
    { label: t("form.paymentTerms"), value: data.paymentTerms },
    { label: t("form.packing"), value: data.packing },
    { label: t("form.validity"), value: data.validity },
    { label: t("form.incoterms"), value: data.incoterms },
    { label: t("form.remarks"), value: data.remarks },
  ].filter((t) => t.value);

  for (const term of terms) {
    ws.getCell(`B${row}`).value = `*${term.label}`;
    ws.getCell(`B${row}`).font = { color: { argb: "FF666666" } };
    ws.getCell(`C${row}`).value = `: ${term.value}`;
    row++;
  }
  row++;

  if (data.commodity) {
    ws.getCell(`B${row}`).value = `${t("form.commodity")}: ${data.commodity}`;
    row++;
  }
  row++;

  // Items header
  const headerRow = row;
  const headers = [
    { col: "B", label: t("form.description") },
    { col: "C", label: t("form.hsCode") },
    { col: "D", label: t("form.qty") },
    { col: "E", label: t("form.unit") },
    { col: "F", label: t("form.unitPrice") },
    { col: "G", label: t("form.amount") },
    { col: "H", label: t("form.remarks") },
  ];
  for (const h of headers) {
    const cell = ws.getCell(`${h.col}${row}`);
    cell.value = h.label;
    cell.font = { bold: true, size: 9 };
    cell.border = { bottom: thick };
  }
  row++;

  // Items
  for (const item of data.items) {
    ws.getCell(`B${row}`).value = item.description;
    ws.getCell(`C${row}`).value = item.hsCode;
    ws.getCell(`D${row}`).value = item.qty || undefined;
    ws.getCell(`D${row}`).alignment = { horizontal: "center" };
    ws.getCell(`E${row}`).value = item.unit;
    ws.getCell(`E${row}`).alignment = { horizontal: "center" };
    ws.getCell(`F${row}`).value = item.unitPrice || undefined;
    ws.getCell(`F${row}`).numFmt = "#,##0.00";
    ws.getCell(`F${row}`).alignment = { horizontal: "right" };
    ws.getCell(`G${row}`).value = item.amount || undefined;
    ws.getCell(`G${row}`).numFmt = "#,##0.00";
    ws.getCell(`G${row}`).alignment = { horizontal: "right" };
    ws.getCell(`H${row}`).value = item.remarks;
    for (const col of ["B", "C", "D", "E", "F", "G", "H"]) {
      ws.getCell(`${col}${row}`).border = { bottom: thin };
    }
    row++;
  }

  // Additional charges
  for (const charge of data.additionalCharges) {
    ws.getCell(`B${row}`).value = charge.description;
    ws.getCell(`G${row}`).value = charge.amount;
    ws.getCell(`G${row}`).numFmt = "#,##0.00";
    ws.getCell(`G${row}`).alignment = { horizontal: "right" };
    row++;
  }

  // Total
  ws.getCell(`F${row}`).value = t("form.total");
  ws.getCell(`F${row}`).font = { bold: true };
  ws.getCell(`G${row}`).value = data.totalAmount;
  ws.getCell(`G${row}`).numFmt = "#,##0.00";
  ws.getCell(`G${row}`).font = { bold: true };
  ws.getCell(`G${row}`).alignment = { horizontal: "right" };
  ws.getCell(`F${row}`).border = { top: thick };
  ws.getCell(`G${row}`).border = { top: thick };
  row += 2;

  // Bank info
  if (data.bankInfo.bankName) {
    ws.getCell(`B${row}`).value = t("form.bankInfo");
    ws.getCell(`B${row}`).font = { bold: true };
    row++;
    const bankFields = [
      { label: t("form.bankName"), value: data.bankInfo.bankName },
      { label: t("form.bankSwift"), value: data.bankInfo.bankSwift },
      { label: t("form.accountNo"), value: data.bankInfo.accountNo },
      { label: t("form.accountee"), value: data.bankInfo.accountee },
      { label: t("form.bankAddress"), value: data.bankInfo.bankAddress },
      { label: t("form.bankTel"), value: data.bankInfo.bankTel },
    ].filter((f) => f.value);

    for (const field of bankFields) {
      ws.getCell(`B${row}`).value = field.label;
      ws.getCell(`B${row}`).font = { color: { argb: "FF666666" } };
      ws.getCell(`C${row}`).value = field.value;
      row++;
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  const filename = `PI_${data.invoiceNo || "draft"}_${data.date || "undated"}.xlsx`;
  saveAs(new Blob([buf]), filename);
}
```

- [ ] **Step 2: Wire Excel button in ExportToolbar**

In `src/widgets/ExportToolbar/index.tsx`, add import and replace Excel button:

```tsx
import { generateExcel } from "../../features/export-excel/generateExcel";
```

```tsx
<Button variant="secondary" size="sm" onClick={() => generateExcel(formData, t)}>
  {t("export.excel")}
</Button>
```

- [ ] **Step 3: Verify Excel download**

```bash
npm run dev
```

Fill fields, click "Excel Download". Expected: .xlsx file downloads with formatted PI.

- [ ] **Step 4: Commit**

```bash
git add src/features/export-excel src/widgets/ExportToolbar
git commit -m "feat: add Excel export with exceljs"
```

---

### Task 14: Print Feature

**Files:**
- Create: `src/features/print/triggerPrint.ts`
- Modify: `src/index.css`

- [ ] **Step 1: Add print CSS**

Append to `src/index.css`:

```css
@media print {
  body * {
    visibility: hidden;
  }
  #invoice-preview,
  #invoice-preview * {
    visibility: visible;
  }
  #invoice-preview {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
```

- [ ] **Step 2: Add id to preview container**

In `src/pages/InvoicePage.tsx`, wrap the preview div with `id="invoice-preview"`:

```tsx
<div id="invoice-preview" className="w-1/2 overflow-y-auto bg-gray-50 p-6">
  <InvoicePreview data={invoiceForm.form} />
</div>
```

- [ ] **Step 3: Verify print**

```bash
npm run dev
```

Click "Print" button, check print preview. Expected: Only the invoice preview prints.

- [ ] **Step 4: Commit**

```bash
git add src/index.css src/pages/InvoicePage.tsx
git commit -m "feat: add print support with print-only CSS"
```

---

### Task 15: Supabase Database Schema & Data CRUD

**Files:**
- Create: `supabase/schema.sql`, `src/features/seller-management/api.ts`, `src/features/buyer-management/api.ts`, `src/features/product-management/api.ts`, `src/features/invoice-crud/api.ts`

- [ ] **Step 1: Write SQL schema**

`supabase/schema.sql`:

```sql
-- Sellers
create table if not exists sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  company_name text not null default '',
  address text not null default '',
  tel text not null default '',
  fax text not null default '',
  representative text not null default '',
  bank_name text not null default '',
  bank_swift text not null default '',
  account_no text not null default '',
  accountee text not null default '',
  bank_address text not null default '',
  bank_tel text not null default '',
  bank_fax text not null default '',
  created_at timestamptz not null default now()
);

alter table sellers enable row level security;
create policy "Users can manage own sellers" on sellers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Buyers
create table if not exists buyers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  company_name text not null default '',
  address text not null default '',
  tel text not null default '',
  contact_person text not null default '',
  created_at timestamptz not null default now()
);

alter table buyers enable row level security;
create policy "Users can manage own buyers" on buyers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  description text not null default '',
  hs_code text not null default '',
  unit text not null default 'PCS',
  unit_price numeric not null default 0,
  remarks text not null default '',
  created_at timestamptz not null default now()
);

alter table products enable row level security;
create policy "Users can manage own products" on products
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Invoices
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  invoice_no text not null default '',
  ref_no text not null default '',
  order_no text not null default '',
  date date,
  validity date,
  seller_company_name text not null default '',
  seller_address text not null default '',
  seller_tel text not null default '',
  seller_fax text not null default '',
  seller_representative text not null default '',
  buyer_snapshot jsonb not null default '{}',
  commodity text not null default '',
  currency text not null default 'USD',
  payment_terms text not null default '',
  incoterms text not null default 'FOB',
  delivery text not null default '',
  packing text not null default '',
  remarks text not null default '',
  items jsonb not null default '[]',
  additional_charges jsonb not null default '[]',
  total_amount numeric not null default 0,
  bank_info jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table invoices enable row level security;
create policy "Users can manage own invoices" on invoices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

- [ ] **Step 2: Create seller management API**

`src/features/seller-management/api.ts`:

```ts
import { supabase } from "../../shared/lib/supabase";
import type { Seller } from "../../entities/seller/model";
import type { BankInfo } from "../../entities/bank-info/model";

export async function getSeller(userId: string): Promise<(Seller & BankInfo) | null> {
  const { data, error } = await supabase
    .from("sellers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    companyName: data.company_name,
    address: data.address,
    tel: data.tel,
    fax: data.fax,
    representative: data.representative,
    bankName: data.bank_name,
    bankSwift: data.bank_swift,
    accountNo: data.account_no,
    accountee: data.accountee,
    bankAddress: data.bank_address,
    bankTel: data.bank_tel,
    bankFax: data.bank_fax,
  };
}

export async function upsertSeller(userId: string, seller: Omit<Seller, "id" | "userId">, bank: BankInfo) {
  const { error } = await supabase.from("sellers").upsert(
    {
      user_id: userId,
      company_name: seller.companyName,
      address: seller.address,
      tel: seller.tel,
      fax: seller.fax,
      representative: seller.representative,
      bank_name: bank.bankName,
      bank_swift: bank.bankSwift,
      account_no: bank.accountNo,
      accountee: bank.accountee,
      bank_address: bank.bankAddress,
      bank_tel: bank.bankTel,
      bank_fax: bank.bankFax,
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
}
```

- [ ] **Step 3: Create buyer management API**

`src/features/buyer-management/api.ts`:

```ts
import { supabase } from "../../shared/lib/supabase";
import type { Buyer } from "../../entities/buyer/model";

export async function listBuyers(userId: string): Promise<Buyer[]> {
  const { data, error } = await supabase
    .from("buyers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    companyName: row.company_name,
    address: row.address,
    tel: row.tel,
    contactPerson: row.contact_person,
  }));
}

export async function createBuyer(userId: string, buyer: Omit<Buyer, "id" | "userId">) {
  const { error } = await supabase.from("buyers").insert({
    user_id: userId,
    company_name: buyer.companyName,
    address: buyer.address,
    tel: buyer.tel,
    contact_person: buyer.contactPerson,
  });
  if (error) throw error;
}

export async function deleteBuyer(id: string) {
  const { error } = await supabase.from("buyers").delete().eq("id", id);
  if (error) throw error;
}
```

- [ ] **Step 4: Create product management API**

`src/features/product-management/api.ts`:

```ts
import { supabase } from "../../shared/lib/supabase";
import type { Product } from "../../entities/product/model";

export async function listProducts(userId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    description: row.description,
    hsCode: row.hs_code,
    unit: row.unit,
    unitPrice: Number(row.unit_price),
    remarks: row.remarks,
  }));
}

export async function createProduct(userId: string, product: Omit<Product, "id" | "userId">) {
  const { error } = await supabase.from("products").insert({
    user_id: userId,
    description: product.description,
    hs_code: product.hsCode,
    unit: product.unit,
    unit_price: product.unitPrice,
    remarks: product.remarks,
  });
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
```

- [ ] **Step 5: Create invoice CRUD API**

`src/features/invoice-crud/api.ts`:

```ts
import { supabase } from "../../shared/lib/supabase";
import type { Invoice } from "../../entities/invoice/model";

type InvoiceData = Omit<Invoice, "id" | "userId" | "createdAt">;

export async function saveInvoice(userId: string, invoice: InvoiceData) {
  const { error } = await supabase.from("invoices").insert({
    user_id: userId,
    invoice_no: invoice.invoiceNo,
    ref_no: invoice.refNo,
    order_no: invoice.orderNo,
    date: invoice.date || null,
    validity: invoice.validity || null,
    seller_company_name: invoice.sellerCompanyName,
    seller_address: invoice.sellerAddress,
    seller_tel: invoice.sellerTel,
    seller_fax: invoice.sellerFax,
    seller_representative: invoice.sellerRepresentative,
    buyer_snapshot: invoice.buyerSnapshot,
    commodity: invoice.commodity,
    currency: invoice.currency,
    payment_terms: invoice.paymentTerms,
    incoterms: invoice.incoterms,
    delivery: invoice.delivery,
    packing: invoice.packing,
    remarks: invoice.remarks,
    items: invoice.items,
    additional_charges: invoice.additionalCharges,
    total_amount: invoice.totalAmount,
    bank_info: invoice.bankInfo,
  });
  if (error) throw error;
}

export async function listInvoices(userId: string): Promise<(Invoice & { id: string; createdAt: string })[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    invoiceNo: row.invoice_no,
    refNo: row.ref_no,
    orderNo: row.order_no,
    date: row.date ?? "",
    validity: row.validity ?? "",
    sellerCompanyName: row.seller_company_name,
    sellerAddress: row.seller_address,
    sellerTel: row.seller_tel,
    sellerFax: row.seller_fax,
    sellerRepresentative: row.seller_representative,
    buyerSnapshot: row.buyer_snapshot,
    commodity: row.commodity,
    currency: row.currency,
    paymentTerms: row.payment_terms,
    incoterms: row.incoterms,
    delivery: row.delivery,
    packing: row.packing,
    remarks: row.remarks,
    items: row.items,
    additionalCharges: row.additional_charges,
    totalAmount: Number(row.total_amount),
    bankInfo: row.bank_info,
    createdAt: row.created_at,
  }));
}

export async function deleteInvoice(id: string) {
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw error;
}
```

- [ ] **Step 6: Commit**

```bash
git add supabase src/features/seller-management src/features/buyer-management src/features/product-management src/features/invoice-crud
git commit -m "feat: add Supabase schema and CRUD APIs for all entities"
```

---

### Task 16: Logged-in User Features — Auto-fill & Saved Data

**Files:**
- Create: `src/features/buyer-management/ui/BuyerSelect.tsx`, `src/features/product-management/ui/ProductSelect.tsx`
- Modify: `src/pages/InvoicePage.tsx`, `src/widgets/InvoiceForm/BuyerSection.tsx`, `src/widgets/InvoiceForm/ItemsTableSection.tsx`

- [ ] **Step 1: Create BuyerSelect dropdown**

`src/features/buyer-management/ui/BuyerSelect.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../app/providers/AuthProvider";
import { listBuyers } from "../api";
import type { Buyer } from "../../../entities/buyer/model";

interface Props {
  onSelect: (buyer: Buyer) => void;
}

export function BuyerSelect({ onSelect }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [buyers, setBuyers] = useState<Buyer[]>([]);

  useEffect(() => {
    if (user) {
      listBuyers(user.id).then(setBuyers);
    }
  }, [user]);

  if (!user || buyers.length === 0) return null;

  return (
    <select
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded mb-3"
      defaultValue=""
      onChange={(e) => {
        const buyer = buyers.find((b) => b.id === e.target.value);
        if (buyer) onSelect(buyer);
      }}
    >
      <option value="" disabled>{t("form.selectBuyer")}</option>
      {buyers.map((b) => (
        <option key={b.id} value={b.id}>{b.companyName}</option>
      ))}
    </select>
  );
}
```

- [ ] **Step 2: Create ProductSelect dropdown**

`src/features/product-management/ui/ProductSelect.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../app/providers/AuthProvider";
import { listProducts } from "../api";
import type { Product } from "../../../entities/product/model";

interface Props {
  onSelect: (product: Product) => void;
}

export function ProductSelect({ onSelect }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (user) {
      listProducts(user.id).then(setProducts);
    }
  }, [user]);

  if (!user || products.length === 0) return null;

  return (
    <select
      className="text-sm border border-gray-200 rounded px-2 py-1"
      defaultValue=""
      onChange={(e) => {
        const product = products.find((p) => p.id === e.target.value);
        if (product) onSelect(product);
      }}
    >
      <option value="" disabled>{t("form.selectProduct")}</option>
      {products.map((p) => (
        <option key={p.id} value={p.id}>{p.description}</option>
      ))}
    </select>
  );
}
```

- [ ] **Step 3: Add BuyerSelect to BuyerSection**

In `src/widgets/InvoiceForm/BuyerSection.tsx`, add:

```tsx
import { BuyerSelect } from "../../features/buyer-management/ui/BuyerSelect";
import type { Buyer } from "../../entities/buyer/model";
```

Before the grid div, add:

```tsx
<BuyerSelect onSelect={(buyer: Buyer) => {
  onUpdate("companyName", buyer.companyName);
  onUpdate("address", buyer.address);
  onUpdate("tel", buyer.tel);
  onUpdate("contactPerson", buyer.contactPerson);
}} />
```

- [ ] **Step 4: Add auto-fill seller on login in InvoicePage**

In `src/pages/InvoicePage.tsx`, add:

```tsx
import { useEffect } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import { getSeller } from "../features/seller-management/api";
```

Inside the component, after `useInvoiceForm()`:

```tsx
const { user } = useAuth();

useEffect(() => {
  if (user) {
    getSeller(user.id).then((seller) => {
      if (seller) {
        invoiceForm.updateField("sellerCompanyName", seller.companyName);
        invoiceForm.updateField("sellerAddress", seller.address);
        invoiceForm.updateField("sellerTel", seller.tel);
        invoiceForm.updateField("sellerFax", seller.fax);
        invoiceForm.updateField("sellerRepresentative", seller.representative);
        invoiceForm.updateBankInfo("bankName", seller.bankName);
        invoiceForm.updateBankInfo("bankSwift", seller.bankSwift);
        invoiceForm.updateBankInfo("accountNo", seller.accountNo);
        invoiceForm.updateBankInfo("accountee", seller.accountee);
        invoiceForm.updateBankInfo("bankAddress", seller.bankAddress);
        invoiceForm.updateBankInfo("bankTel", seller.bankTel);
        invoiceForm.updateBankInfo("bankFax", seller.bankFax);
      }
    });
  }
}, [user]);
```

- [ ] **Step 5: Verify logged-in features**

```bash
npm run dev
```

Expected: After login, seller fields auto-populate. Buyer dropdown appears if saved buyers exist.

- [ ] **Step 6: Commit**

```bash
git add src/features/buyer-management/ui src/features/product-management/ui src/widgets/InvoiceForm/BuyerSection.tsx src/pages/InvoicePage.tsx
git commit -m "feat: add auto-fill seller and saved buyer/product selection for logged-in users"
```

---

### Task 17: Mobile Responsive Layout

**Files:**
- Modify: `src/pages/InvoicePage.tsx`, `src/widgets/ExportToolbar/index.tsx`

- [ ] **Step 1: Add responsive split layout**

In `src/pages/InvoicePage.tsx`, replace the flex container:

```tsx
<div className="flex flex-col lg:flex-row h-[calc(100vh-57px)]">
  {/* Form */}
  <div className="w-full lg:w-1/2 overflow-y-auto border-r border-gray-200">
    <InvoiceForm {...invoiceForm} />
  </div>
  {/* Preview — hidden on mobile, shown on lg+ */}
  <div id="invoice-preview" className="hidden lg:block w-1/2 overflow-y-auto bg-gray-50 p-6">
    <InvoicePreview data={invoiceForm.form} />
  </div>
</div>
```

- [ ] **Step 2: Make toolbar responsive**

In `src/widgets/ExportToolbar/index.tsx`, wrap the buttons in responsive classes:

```tsx
<div className="flex items-center justify-between">
  <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">{t("app.title")}</h1>
  <div className="flex items-center gap-2 overflow-x-auto">
    <Button variant="secondary" size="sm" onClick={() => generatePdf(formData, t)}>
      {t("export.pdf")}
    </Button>
    <Button variant="secondary" size="sm" onClick={() => generateExcel(formData, t)}>
      {t("export.excel")}
    </Button>
    <Button variant="secondary" size="sm" onClick={() => window.print()}>
      {t("export.print")}
    </Button>
    <div className="w-px h-6 bg-gray-200 hidden sm:block" />
    <div className="hidden sm:flex">
      <LanguageSwitcher />
    </div>
    <div className="w-px h-6 bg-gray-200" />
    {user ? (
      <Button variant="ghost" size="sm" onClick={() => logout()}>
        {t("nav.logout")}
      </Button>
    ) : (
      <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
        {t("nav.login")}
      </Button>
    )}
  </div>
</div>
```

- [ ] **Step 3: Verify responsive layout**

```bash
npm run dev
```

Resize browser. Expected: On small screens, only form shows. On large screens, split layout.

- [ ] **Step 4: Commit**

```bash
git add src/pages/InvoicePage.tsx src/widgets/ExportToolbar
git commit -m "feat: add responsive layout for mobile and desktop"
```

---

### Task 18: Component Tests

**Files:**
- Create: `src/widgets/InvoiceForm/ItemsTableSection.test.tsx`, `src/features/i18n-switch/ui/LanguageSwitcher.test.tsx`

- [ ] **Step 1: Write items table interaction test**

`src/widgets/InvoiceForm/ItemsTableSection.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../shared/i18n/config";
import { ItemsTableSection } from "./ItemsTableSection";
import { createEmptyItem } from "../../entities/invoice/model";

function renderComponent(overrides = {}) {
  const props = {
    items: [createEmptyItem()],
    currency: "USD",
    onUpdateItem: vi.fn(),
    onAddItem: vi.fn(),
    onRemoveItem: vi.fn(),
    ...overrides,
  };
  render(
    <I18nextProvider i18n={i18n}>
      <ItemsTableSection {...props} />
    </I18nextProvider>
  );
  return props;
}

describe("ItemsTableSection", () => {
  it("renders one item row by default", () => {
    renderComponent();
    const descInputs = screen.getAllByRole("textbox");
    expect(descInputs.length).toBeGreaterThan(0);
  });

  it("calls onAddItem when add button is clicked", () => {
    const props = renderComponent();
    fireEvent.click(screen.getByText(/add/i));
    expect(props.onAddItem).toHaveBeenCalledOnce();
  });

  it("calls onUpdateItem when qty changes", () => {
    const props = renderComponent();
    const qtyInput = screen.getByRole("spinbutton", { name: "" });
    fireEvent.change(qtyInput, { target: { value: "5" } });
    expect(props.onUpdateItem).toHaveBeenCalledWith(0, "qty", 5);
  });

  it("does not show remove button when only one item", () => {
    renderComponent();
    expect(screen.queryByText(/remove/i)).toBeNull();
  });

  it("shows remove button when multiple items", () => {
    renderComponent({ items: [createEmptyItem(), createEmptyItem()] });
    expect(screen.getAllByText(/remove/i)).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Write language switcher test**

`src/features/i18n-switch/ui/LanguageSwitcher.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../shared/i18n/config";
import { LanguageSwitcher } from "./LanguageSwitcher";

describe("LanguageSwitcher", () => {
  it("renders all 4 language buttons", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );
    expect(screen.getByText("한국어")).toBeDefined();
    expect(screen.getByText("EN")).toBeDefined();
    expect(screen.getByText("中文")).toBeDefined();
    expect(screen.getByText("日本語")).toBeDefined();
  });

  it("switches language when clicked", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );
    fireEvent.click(screen.getByText("日本語"));
    expect(i18n.language).toBe("ja");
  });
});
```

- [ ] **Step 3: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass (calculation tests + component tests).

- [ ] **Step 4: Commit**

```bash
git add src/widgets/InvoiceForm/ItemsTableSection.test.tsx src/features/i18n-switch/ui/LanguageSwitcher.test.tsx
git commit -m "test: add component tests for items table and language switcher"
```

---

### Task 19: E2E Test Setup & Smoke Test

**Files:**
- Create: `playwright.config.ts`, `e2e/invoice-flow.spec.ts`

- [ ] **Step 1: Install Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Create Playwright config**

`playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "npm run dev",
    port: 5173,
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://localhost:5173",
  },
});
```

- [ ] **Step 3: Write guest invoice flow E2E test**

`e2e/invoice-flow.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("guest can fill invoice and see preview update", async ({ page }) => {
  await page.goto("/");

  // Fill document info
  await page.getByLabel(/invoice no/i).fill("TEST-001");
  await page.getByLabel(/date/i).first().fill("2025-12-30");

  // Fill seller
  await page.getByLabel(/company name/i).first().fill("Test Seller Co.");

  // Fill an item description
  const descInputs = page.locator("table input[type='text']").first();
  await descInputs.fill("Test Product");

  // Check preview updates
  const preview = page.locator("#invoice-preview");
  await expect(preview).toContainText("TEST-001");
  await expect(preview).toContainText("Test Seller Co.");
  await expect(preview).toContainText("Test Product");
});

test("language switcher changes UI labels", async ({ page }) => {
  await page.goto("/");

  // Default should have some English or Korean text
  await page.getByText("日本語").click();

  // Check that Japanese labels appear
  await expect(page.getByText("プロフォーマインボイス")).toBeVisible();
});
```

- [ ] **Step 4: Run E2E tests**

```bash
npx playwright test
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts e2e package.json package-lock.json
git commit -m "test: add Playwright E2E setup and smoke tests"
```

---

### Task 20: Invoice History UI (Logged-in Users)

**Files:**
- Create: `src/widgets/InvoiceHistory/index.tsx`
- Modify: `src/pages/InvoicePage.tsx`, `src/widgets/ExportToolbar/index.tsx`

- [ ] **Step 1: Create InvoiceHistory panel**

`src/widgets/InvoiceHistory/index.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../app/providers/AuthProvider";
import { listInvoices, deleteInvoice } from "../../features/invoice-crud/api";
import { Button } from "../../shared/ui/Button";
import type { Invoice } from "../../entities/invoice/model";

interface Props {
  onLoad: (invoice: Omit<Invoice, "id" | "userId" | "createdAt">) => void;
  onClose: () => void;
}

export function InvoiceHistory({ onLoad, onClose }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (user) {
      listInvoices(user.id).then(setInvoices);
    }
  }, [user]);

  async function handleDelete(id: string) {
    await deleteInvoice(id);
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  }

  function handleLoad(inv: Invoice) {
    const { id, userId, createdAt, ...formData } = inv;
    onLoad(formData);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-20 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg border border-gray-200 w-full max-w-lg max-h-[70vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Invoice History</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        {invoices.length === 0 ? (
          <p className="text-sm text-gray-400">No saved invoices.</p>
        ) : (
          <ul className="space-y-2">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between border border-gray-100 rounded p-3">
                <div>
                  <p className="text-sm font-medium">{inv.invoiceNo || "No number"}</p>
                  <p className="text-xs text-gray-500">{inv.date} — {inv.buyerSnapshot.companyName || "No buyer"}</p>
                  <p className="text-xs text-gray-400">{inv.currency} {inv.totalAmount.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleLoad(inv)}>Load</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(inv.id)}>Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add save & history buttons to ExportToolbar**

In `src/widgets/ExportToolbar/index.tsx`, add a "Save" button (for logged-in users) and a "History" button:

```tsx
import { saveInvoice } from "../../features/invoice-crud/api";
```

Add props: `onShowHistory: () => void`. Add after export buttons, before the language switcher divider:

```tsx
{user && (
  <>
    <div className="w-px h-6 bg-gray-200" />
    <Button variant="secondary" size="sm" onClick={async () => {
      await saveInvoice(user.id, formData);
      alert("Saved!");
    }}>
      Save
    </Button>
    <Button variant="ghost" size="sm" onClick={onShowHistory}>
      History
    </Button>
  </>
)}
```

- [ ] **Step 3: Wire history modal in InvoicePage**

In `src/pages/InvoicePage.tsx`, add state and render:

```tsx
const [showHistory, setShowHistory] = useState(false);
```

After the layout div:

```tsx
{showHistory && (
  <InvoiceHistory
    onLoad={(data) => invoiceForm.loadForm(data)}
    onClose={() => setShowHistory(false)}
  />
)}
```

Pass `onShowHistory={() => setShowHistory(true)}` to ExportToolbar.

- [ ] **Step 4: Verify save and load flow**

```bash
npm run dev
```

Login, fill invoice, click Save. Click History, verify invoice appears. Click Load, verify form populates.

- [ ] **Step 5: Commit**

```bash
git add src/widgets/InvoiceHistory src/widgets/ExportToolbar src/pages/InvoicePage.tsx
git commit -m "feat: add invoice history with save, load, and delete"
```

---

### Task 21: Final Polish & Cleanup

**Files:**
- Modify: `src/app/App.tsx`, `package.json`
- Create: `.env.example`

- [ ] **Step 1: Create .env.example**

`.env.example`:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- [ ] **Step 2: Add scripts to package.json**

Ensure these scripts exist in `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 3: Verify full build**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 4: Run all tests**

```bash
npm run test && npm run test:e2e
```

Expected: All unit, component, and E2E tests pass.

- [ ] **Step 5: Commit**

```bash
git add .env.example package.json
git commit -m "chore: add env example and finalize scripts"
```
