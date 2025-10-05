# 개인 사업소득 원천징수 온라인 프로그램 PRD

## 📋 프로젝트 개요

프리랜서, 강사, 외주직원 등에게 지급하는 사업소득(3.3%)을 관리하는 웹 기반 원천징수 관리 시스템

### 프로젝트 정보
- **버전**: MVP (Minimum Viable Product)
- **배포 환경**: Vercel (Git 자동 배포)
- **데이터베이스**: Supabase (PostgreSQL)
- **개발 언어**: TypeScript
- **예상 개발 기간**: 6주

---

## 🎯 핵심 기능 요구사항

### A. 지급 대상자 관리

#### 기능 상세
- **인적사항 등록**
  - 성명 (필수)
  - 주민등록번호 (필수, 암호화 저장)
  - 주소
  - 연락처
  - 이메일

- **계좌정보 관리**
  - 은행명
  - 계좌번호 (암호화 저장)

- **사업자 구분**
  - 프리랜서
  - 강사
  - 외주직원
  - 기타 유형

- **계약 정보**
  - 계약 시작일
  - 계약 종료일
  - 계약서 파일 업로드 (Supabase Storage)

- **중복 검증**
  - 주민등록번호 기반 중복 등록 방지
  - 동일 회사 내 중복 체크

#### 화면 구성
- 대상자 목록 (테이블 뷰)
- 대상자 등록 폼
- 대상자 상세 정보
- 대상자 수정/삭제

---

### B. 지급 관리

#### 기능 상세
- **지급 내역 입력**
  - 지급 대상자 선택 (드롭다운)
  - 지급일자 (날짜 선택기)
  - 지급액 (숫자 입력)
  - 지급 사유 (텍스트)

- **자동 세액 계산**
  - 소득세 3% 자동 계산
  - 지방소득세 0.3% 자동 계산
  - 총 원천징수세액 3.3% 표시
  - 실지급액 자동 산출 (지급액 - 총세액)

- **계산 공식**
  ```
  지급액: 1,000,000원
  소득세 (3%): 30,000원
  지방소득세 (0.3%): 3,000원
  총 세액 (3.3%): 33,000원
  실지급액: 967,000원
  ```

- **일괄 지급 처리**
  - 엑셀 파일 업로드 (xlsx, xls)
  - 다수 지급 건 동시 처리
  - 엑셀 템플릿 다운로드 제공
  - 업로드 전 데이터 검증

- **지급 이력 조회**
  - 전체 지급 내역 테이블
  - 기간별 필터링 (시작일~종료일)
  - 대상자별 필터링
  - 지급 유형별 필터링
  - 검색 기능 (대상자명)
  - 정렬 기능 (날짜, 금액)

#### 화면 구성
- 지급 목록 (테이블 뷰)
- 지급 등록 폼
- 일괄 지급 페이지
- 지급 상세 정보

---

### C. 원천징수영수증 발급

#### 기능 상세
- **자동 양식 생성**
  - 국세청 표준 서식 준수
  - 필수 정보 자동 입력
    - 원천징수의무자 정보 (회사)
    - 소득자 정보 (대상자)
    - 지급액 및 세액 정보
    - 발급 번호 자동 생성

- **PDF 다운로드**
  - 개별 영수증 PDF 생성
  - 일괄 PDF 생성 (ZIP 압축)
  - 한글 폰트 지원
  - A4 용지 규격

- **이메일 자동 발송**
  - 대상자 이메일로 PDF 전송
  - 발송 이력 저장
  - 재발송 기능
  - 이메일 템플릿 사용

- **재발급 기능**
  - 발급 이력 관리
  - 재출력 가능
  - 발급 일시 기록
  - 발급자 기록

#### 화면 구성
- 영수증 목록
- 영수증 미리보기
- 일괄 발급 페이지
- 발급 이력 조회

---

## 🔍 추가 고려사항 (향후 확장)

### D. 원천징수이행상황신고서 관리
- 월별/반기별/연간 신고서 자동 생성
- 국세청 홈택스 제출용 파일 생성 (XML/TXT)
- 신고 기한 알림 기능
- 수정신고 기능

### E. 보안 관리
- 주민등록번호 AES-256 암호화 저장
- 접근 권한 관리 (관리자/실무자)
- 감사 로그 (조회/수정 이력)
- 개인정보 보유기간 설정 (5년)
- 마스킹 처리 (주민번호 뒷자리 *****)

### F. 회사(원천징수의무자) 정보 관리
- 사업자등록번호
- 상호/법인명
- 대표자명
- 사업장 주소
- 담당자 정보

### G. 지급명세서 제출
- 사업소득 지급명세서 자동 생성 (연 1회)
- 국세청 제출용 파일 생성
- 제출 이력 관리

### H. 통계 및 대시보드
- 월별/연도별 지급 총액 통계
- 소득자 유형별 통계
- 세액 납부 현황
- 연간 지급액 상위 소득자 목록

### I. 편의 기능
- 지급 템플릿 저장
- 엑셀 다운로드 (전체 데이터)
- 자동 백업 기능
- 지급 예정 알림
- 모바일 반응형 UI

---

## 🛠 기술 스택 (MVP)

### 배포 환경
```yaml
배포: Vercel (Git 자동 배포)
데이터베이스: Supabase (PostgreSQL + Auth + Storage)
아키텍처: Full-stack Next.js (App Router + API Routes)
```

### 프론트엔드 & 백엔드
```typescript
Framework: Next.js 14 (App Router) + TypeScript
Runtime: Node.js (Vercel Serverless)
Language: TypeScript 5.x
```

**선정 이유:**
- Vercel은 Next.js 제작사로 최고의 성능 및 최적화
- API Routes로 별도 백엔드 서버 불필요
- Edge Functions 지원으로 빠른 응답
- 자동 SSR/ISR 최적화
- Git 푸시만으로 자동 배포

### 데이터베이스 & 인증
```typescript
Database: Supabase PostgreSQL
Auth: Supabase Auth (JWT)
Storage: Supabase Storage (파일 저장)
Security: Row Level Security (RLS)
Client: @supabase/supabase-js
```

**선정 이유:**
- PostgreSQL 기반으로 안정적
- 실시간 기능 내장
- 암호화 및 보안 기능 강력
- RLS로 데이터 접근 제어
- 무료 티어로 시작 가능 (500MB DB)

### UI & 스타일링
```typescript
CSS Framework: Tailwind CSS
Component Library: shadcn/ui
Icons: Lucide React
Base Components: Radix UI
Utilities: clsx, tailwind-merge
```

**선정 이유:**
- 빠른 개발 속도
- 반응형 자동 지원
- 다크모드 쉬운 구현
- 접근성 표준 준수
- 커스터마이징 용이

### 폼 & 유효성 검사
```typescript
Form Management: React Hook Form
Schema Validation: Zod
Custom Validators: 주민번호, 사업자번호 검증
```

**선정 이유:**
- 타입 안전성
- 성능 최적화 (리렌더 최소화)
- Supabase와 스키마 공유 가능
- 직관적인 API

### 상태 관리
```typescript
Global State: Zustand (사용자 정보 등)
Server State: TanStack Query (React Query)
Real-time: Supabase Realtime (옵션)
```

**선정 이유:**
- 가벼움 (Redux 대비)
- 간단한 API
- 캐싱 및 동기화 자동화
- Optimistic Update 지원

### 파일 처리
```typescript
PDF Generation: jsPDF + jspdf-autotable
Excel: xlsx (SheetJS)
File Storage: Supabase Storage
```

**선정 이유:**
- 클라이언트 사이드에서 빠른 생성
- 서버 부하 최소화
- 한글 폰트 지원
- 브라우저에서 직접 생성 가능

### 이메일 발송
```typescript
Email Service: Resend (Vercel 공식 파트너)
Alternative: SendGrid
```

**선정 이유:**
- Vercel과 완벽한 통합
- Next.js API Routes에서 쉽게 사용
- 무료 티어 제공 (월 100통)
- 간단한 API

### 유틸리티
```typescript
Date: date-fns (한국 로케일 지원)
Classnames: clsx, cn utility
Encryption: crypto-js (추가 암호화 시)
```

### 테스트
```typescript
E2E Testing: Playwright
Unit Testing: Vitest
Component Testing: Testing Library
```

**선정 이유:**
- 실제 사용자 시나리오 테스트
- 크로스 브라우저 테스트
- CI/CD 통합 용이

---

## 📁 프로젝트 구조

```
tax-withholding-mvp/
├── app/
│   ├── (auth)/                     # 인증 레이아웃 그룹
│   │   ├── login/
│   │   │   └── page.tsx           # 로그인 페이지
│   │   └── register/
│   │       └── page.tsx           # 회원가입 페이지
│   │
│   ├── (dashboard)/                # 대시보드 레이아웃 그룹
│   │   ├── layout.tsx             # 공통 레이아웃 (사이드바)
│   │   ├── page.tsx               # 대시보드 홈
│   │   │
│   │   ├── payees/                # 지급 대상자 관리
│   │   │   ├── page.tsx          # 목록
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # 신규 등록
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # 상세 정보
│   │   │       └── edit/
│   │   │           └── page.tsx  # 수정
│   │   │
│   │   ├── payments/              # 지급 관리
│   │   │   ├── page.tsx          # 목록
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # 신규 지급
│   │   │   ├── bulk/
│   │   │   │   └── page.tsx      # 일괄 지급
│   │   │   └── [id]/
│   │   │       └── page.tsx      # 상세 정보
│   │   │
│   │   └── receipts/              # 원천징수영수증
│   │       ├── page.tsx          # 목록
│   │       ├── generate/
│   │       │   └── page.tsx      # 일괄 생성
│   │       └── [id]/
│   │           └── page.tsx      # 상세 (미리보기)
│   │
│   ├── api/                        # API Routes
│   │   ├── payees/
│   │   │   ├── route.ts          # GET (목록), POST (생성)
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET, PUT, DELETE
│   │   │
│   │   ├── payments/
│   │   │   ├── route.ts          # GET, POST
│   │   │   ├── [id]/
│   │   │   │   └── route.ts      # GET, PUT, DELETE
│   │   │   └── bulk/
│   │   │       └── route.ts      # POST (일괄 처리)
│   │   │
│   │   ├── receipts/
│   │   │   ├── route.ts          # GET (목록)
│   │   │   ├── generate/
│   │   │   │   └── route.ts      # POST (PDF 생성)
│   │   │   └── send-email/
│   │   │       └── route.ts      # POST (이메일 발송)
│   │   │
│   │   └── upload/
│   │       └── excel/
│   │           └── route.ts      # POST (엑셀 업로드)
│   │
│   ├── layout.tsx                  # 루트 레이아웃
│   └── globals.css                 # 글로벌 스타일
│
├── components/
│   ├── ui/                         # shadcn/ui 컴포넌트
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Navigation.tsx
│   │
│   ├── payees/
│   │   ├── PayeeForm.tsx          # 대상자 등록/수정 폼
│   │   ├── PayeeList.tsx          # 대상자 목록 테이블
│   │   ├── PayeeDetail.tsx        # 대상자 상세 정보
│   │   └── PayeeSearch.tsx        # 검색 컴포넌트
│   │
│   ├── payments/
│   │   ├── PaymentForm.tsx        # 지급 등록 폼
│   │   ├── PaymentList.tsx        # 지급 목록 테이블
│   │   ├── TaxCalculator.tsx      # 세액 계산 컴포넌트
│   │   ├── BulkUpload.tsx         # 일괄 업로드
│   │   └── PaymentFilter.tsx      # 필터링 컴포넌트
│   │
│   └── receipts/
│       ├── ReceiptTemplate.tsx    # 영수증 템플릿
│       ├── ReceiptPDF.tsx         # PDF 생성 컴포넌트
│       ├── ReceiptList.tsx        # 영수증 목록
│       └── EmailForm.tsx          # 이메일 발송 폼
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # 클라이언트용 Supabase
│   │   ├── server.ts              # 서버용 Supabase
│   │   └── middleware.ts          # 인증 미들웨어
│   │
│   ├── utils/
│   │   ├── tax-calculator.ts      # 3.3% 세액 계산 로직
│   │   ├── validators.ts          # 유효성 검증 (주민번호 등)
│   │   ├── formatters.ts          # 금액, 날짜 포맷팅
│   │   ├── encryption.ts          # 암호화/복호화
│   │   └── cn.ts                  # 클래스명 유틸리티
│   │
│   ├── constants/
│   │   ├── business-types.ts      # 사업자 유형 상수
│   │   ├── banks.ts               # 은행 목록
│   │   └── routes.ts              # 라우트 경로
│   │
│   └── pdf/
│       └── receipt-generator.ts   # PDF 생성 로직
│
├── types/
│   ├── index.ts                    # 공통 타입
│   ├── payee.ts                    # 지급 대상자 타입
│   ├── payment.ts                  # 지급 타입
│   ├── receipt.ts                  # 영수증 타입
│   └── database.ts                 # Supabase 타입
│
├── hooks/
│   ├── usePayees.ts                # 대상자 관련 훅
│   ├── usePayments.ts              # 지급 관련 훅
│   ├── useReceipts.ts              # 영수증 관련 훅
│   ├── useAuth.ts                  # 인증 관련 훅
│   └── useToast.ts                 # 토스트 알림 훅
│
├── store/
│   └── auth-store.ts               # Zustand 인증 스토어
│
├── tests/                          # Playwright E2E 테스트
│   ├── e2e/
│   │   ├── auth.spec.ts           # 인증 테스트
│   │   ├── payee-management.spec.ts
│   │   ├── payment-process.spec.ts
│   │   ├── bulk-upload.spec.ts
│   │   └── receipt-generation.spec.ts
│   │
│   ├── fixtures/
│   │   └── test-data.ts           # 테스트 데이터
│   │
│   └── playwright.config.ts
│
├── supabase/
│   ├── migrations/                 # 데이터베이스 마이그레이션
│   │   └── 001_initial_schema.sql
│   │
│   └── seed.sql                    # 테스트 데이터 시드
│
├── public/
│   ├── fonts/                      # PDF용 한글 폰트
│   │   └── NanumGothic.ttf
│   │
│   └── templates/
│       └── payment-template.xlsx   # 엑셀 템플릿
│
├── .env.local                      # 환경 변수 (로컬)
├── .env.example                    # 환경 변수 예제
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── postcss.config.js
├── components.json                 # shadcn/ui 설정
├── README.md
└── prd.md                          # 이 문서
```

---

## 🗄 데이터베이스 스키마 (Supabase)

### ERD 개요
```
companies (회사)
    ↓ 1:N
payees (지급 대상자)
    ↓ 1:N
payments (지급 내역)
    ↓ 1:N
receipts (원천징수영수증)
```

### 테이블 상세 설계

#### 1. companies (회사 정보)
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  business_number VARCHAR(10) NOT NULL UNIQUE,
  company_name VARCHAR(200) NOT NULL,
  representative_name VARCHAR(100) NOT NULL,
  address TEXT,
  contact VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE companies IS '원천징수의무자(회사) 정보';
COMMENT ON COLUMN companies.user_id IS '인증된 사용자 ID (Supabase Auth)';
COMMENT ON COLUMN companies.business_number IS '사업자등록번호 (10자리)';
```

#### 2. payees (지급 대상자)
```sql
CREATE TABLE payees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  resident_number_encrypted TEXT NOT NULL,
  address TEXT,
  contact VARCHAR(20),
  email VARCHAR(255),
  bank_name VARCHAR(50),
  account_number_encrypted TEXT,
  business_type VARCHAR(50) NOT NULL,
  contract_start_date DATE,
  contract_end_date DATE,
  contract_file_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_payee_per_company UNIQUE(company_id, resident_number_encrypted)
);

COMMENT ON TABLE payees IS '사업소득 지급 대상자';
COMMENT ON COLUMN payees.resident_number_encrypted IS '암호화된 주민등록번호';
COMMENT ON COLUMN payees.business_type IS '프리랜서, 강사, 외주직원 등';
COMMENT ON COLUMN payees.contract_file_url IS 'Supabase Storage URL';
```

#### 3. payments (지급 내역)
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  payee_id UUID REFERENCES payees(id) ON DELETE CASCADE NOT NULL,
  payment_date DATE NOT NULL,
  payment_amount DECIMAL(15, 2) NOT NULL CHECK (payment_amount >= 0),
  income_tax DECIMAL(15, 2) NOT NULL,
  local_income_tax DECIMAL(15, 2) NOT NULL,
  total_tax DECIMAL(15, 2) NOT NULL,
  net_amount DECIMAL(15, 2) NOT NULL,
  payment_reason TEXT,
  receipt_issued BOOLEAN DEFAULT FALSE,
  receipt_issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE payments IS '사업소득 지급 내역';
COMMENT ON COLUMN payments.income_tax IS '소득세 3%';
COMMENT ON COLUMN payments.local_income_tax IS '지방소득세 0.3%';
COMMENT ON COLUMN payments.total_tax IS '총 원천징수세액 3.3%';
COMMENT ON COLUMN payments.net_amount IS '실지급액 (지급액 - 총세액)';
```

#### 4. receipts (원천징수영수증)
```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE NOT NULL,
  payee_id UUID REFERENCES payees(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  pdf_url TEXT,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  issued_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE receipts IS '원천징수영수증 발급 이력';
COMMENT ON COLUMN receipts.receipt_number IS '영수증 고유 번호 (자동 생성)';
COMMENT ON COLUMN receipts.pdf_url IS 'Supabase Storage에 저장된 PDF URL';
COMMENT ON COLUMN receipts.issued_by IS '발급한 사용자';
```

### Row Level Security (RLS) 정책

```sql
-- RLS 활성화
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE payees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- 회사: 자신의 데이터만 접근
CREATE POLICY "Users can only access their own company"
  ON companies FOR ALL
  USING (auth.uid() = user_id);

-- 지급 대상자: 자신의 회사 소속만 접근
CREATE POLICY "Users can only access their company's payees"
  ON payees FOR ALL
  USING (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));

-- 지급 내역: 자신의 회사 소속만 접근
CREATE POLICY "Users can only access their company's payments"
  ON payments FOR ALL
  USING (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));

-- 영수증: 자신의 회사 소속만 접근
CREATE POLICY "Users can only access their company's receipts"
  ON receipts FOR ALL
  USING (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));
```

### 인덱스 (성능 최적화)

```sql
-- 외래 키 인덱스
CREATE INDEX idx_payees_company_id ON payees(company_id);
CREATE INDEX idx_payments_company_id ON payments(company_id);
CREATE INDEX idx_payments_payee_id ON payments(payee_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_receipts_payment_id ON receipts(payment_id);
CREATE INDEX idx_receipts_company_id ON receipts(company_id);

-- 검색 최적화 인덱스
CREATE INDEX idx_payees_name ON payees(name);
CREATE INDEX idx_payees_is_active ON payees(is_active);
CREATE INDEX idx_payments_receipt_issued ON payments(receipt_issued);
```

### 트리거 (자동화)

```sql
-- 업데이트 시각 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payees_updated_at BEFORE UPDATE ON payees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 📦 주요 의존성 (package.json)

```json
{
  "name": "tax-withholding-mvp",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:debug": "playwright test --debug"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "@tanstack/react-query": "^5.56.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",
    "jspdf": "^2.5.2",
    "jspdf-autotable": "^3.8.0",
    "xlsx": "^0.18.5",
    "date-fns": "^3.6.0",
    "resend": "^4.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.445.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "class-variance-authority": "^0.7.0",
    "crypto-js": "^4.2.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/crypto-js": "^4.2.0",
    "@playwright/test": "^1.47.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

---

## 🔐 환경 변수

### .env.local (개발 환경)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (이메일)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# 암호화 (주민번호, 계좌번호)
ENCRYPTION_SECRET_KEY=your-256-bit-secret-key-here

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### .env.production (Vercel 배포 환경)
```bash
# Vercel 환경 변수 설정에서 입력
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
ENCRYPTION_SECRET_KEY=
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app
```

---

## 🚀 개발 우선순위 및 일정

### Week 1-2: 프로젝트 초기 설정
- [ ] Next.js 프로젝트 생성 및 기본 설정
- [ ] Supabase 프로젝트 생성 및 데이터베이스 스키마 구축
- [ ] Tailwind CSS + shadcn/ui 설치 및 설정
- [ ] 인증 시스템 구축 (Supabase Auth)
- [ ] 기본 레이아웃 구성 (사이드바, 헤더)
- [ ] Git 저장소 생성 및 Vercel 연결

### Week 3-4: 핵심 기능 개발
- [ ] **지급 대상자 관리 (A 기능)**
  - [ ] 대상자 등록 폼
  - [ ] 대상자 목록 테이블
  - [ ] 대상자 상세/수정/삭제
  - [ ] 주민번호 암호화 로직
  - [ ] 중복 검증 로직
  - [ ] 계약서 파일 업로드 (Supabase Storage)

- [ ] **지급 관리 (B 기능)**
  - [ ] 지급 등록 폼
  - [ ] 3.3% 자동 세액 계산 로직
  - [ ] 지급 목록 테이블
  - [ ] 기간별/대상자별 필터링
  - [ ] 검색 기능

### Week 5: 일괄 처리 및 엑셀
- [ ] **엑셀 처리**
  - [ ] 엑셀 템플릿 생성
  - [ ] 엑셀 파일 업로드 기능
  - [ ] 데이터 검증 로직
  - [ ] 일괄 지급 처리
  - [ ] 엑셀 다운로드 기능

### Week 6: 영수증 발급 및 배포
- [ ] **원천징수영수증 (C 기능)**
  - [ ] 영수증 템플릿 디자인
  - [ ] PDF 생성 로직 (jsPDF)
  - [ ] 개별 PDF 다운로드
  - [ ] 일괄 PDF 생성 (ZIP)
  - [ ] 이메일 발송 기능 (Resend)
  - [ ] 발급 이력 관리

- [ ] **테스트 및 배포**
  - [ ] Playwright E2E 테스트 작성
  - [ ] 주요 기능 테스트 (로그인, CRUD, 영수증 발급)
  - [ ] Vercel 프로덕션 배포
  - [ ] 환경 변수 설정
  - [ ] 도메인 연결 (옵션)

---

## 🧪 테스트 시나리오 (Playwright)

### 1. 인증 테스트
```typescript
// tests/e2e/auth.spec.ts
- 회원가입 프로세스
- 로그인/로그아웃
- 인증 상태 유지
- 비인증 접근 차단
```

### 2. 대상자 관리 테스트
```typescript
// tests/e2e/payee-management.spec.ts
- 대상자 등록 (필수 필드 검증)
- 주민번호 중복 검증
- 대상자 목록 조회
- 대상자 검색 및 필터링
- 대상자 수정
- 대상자 삭제
- 계약서 파일 업로드
```

### 3. 지급 처리 테스트
```typescript
// tests/e2e/payment-process.spec.ts
- 지급 등록
- 세액 자동 계산 검증 (3.3%)
- 지급 내역 조회
- 기간별 필터링
- 대상자별 필터링
```

### 4. 일괄 업로드 테스트
```typescript
// tests/e2e/bulk-upload.spec.ts
- 엑셀 템플릿 다운로드
- 엑셀 파일 업로드
- 데이터 검증 에러 처리
- 일괄 지급 성공 시나리오
```

### 5. 영수증 발급 테스트
```typescript
// tests/e2e/receipt-generation.spec.ts
- 개별 영수증 PDF 생성
- 일괄 영수증 생성
- PDF 다운로드
- 이메일 발송
- 재발급
```

---

## 📊 핵심 계산 로직

### 세액 계산 공식
```typescript
// lib/utils/tax-calculator.ts

interface TaxCalculation {
  paymentAmount: number;      // 지급액
  incomeTax: number;          // 소득세 (3%)
  localIncomeTax: number;     // 지방소득세 (0.3%)
  totalTax: number;           // 총 세액 (3.3%)
  netAmount: number;          // 실지급액
}

export function calculateTax(paymentAmount: number): TaxCalculation {
  // 소득세 3%
  const incomeTax = Math.round(paymentAmount * 0.03);
  
  // 지방소득세 0.3%
  const localIncomeTax = Math.round(paymentAmount * 0.003);
  
  // 총 원천징수세액 3.3%
  const totalTax = incomeTax + localIncomeTax;
  
  // 실지급액 = 지급액 - 총세액
  const netAmount = paymentAmount - totalTax;
  
  return {
    paymentAmount,
    incomeTax,
    localIncomeTax,
    totalTax,
    netAmount
  };
}

// 사용 예시
const result = calculateTax(1000000);
// {
//   paymentAmount: 1000000,
//   incomeTax: 30000,
//   localIncomeTax: 3000,
//   totalTax: 33000,
//   netAmount: 967000
// }
```

### 주민번호 검증
```typescript
// lib/utils/validators.ts

export function validateResidentNumber(residentNumber: string): boolean {
  // 형식 검증: 000000-0000000
  const regex = /^\d{6}-\d{7}$/;
  if (!regex.test(residentNumber)) return false;
  
  // 체크섬 검증 로직 (생략 가능)
  const numbers = residentNumber.replace('-', '').split('').map(Number);
  const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += numbers[i] * weights[i];
  }
  
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === numbers[12];
}
```

---

## 🔒 보안 고려사항

### 1. 개인정보 암호화
- 주민등록번호: AES-256 암호화 저장
- 계좌번호: AES-256 암호화 저장
- 암호화 키: 환경 변수로 관리 (ENCRYPTION_SECRET_KEY)

### 2. 데이터 접근 제어
- Supabase Row Level Security (RLS) 활용
- 사용자는 자신의 회사 데이터만 접근 가능
- API Routes에서 추가 권한 검증

### 3. 입력 검증
- Zod 스키마를 통한 타입 안전성
- XSS 방지 (React 자동 이스케이프)
- SQL Injection 방지 (Supabase 자동 방지)

### 4. HTTPS 통신
- Vercel 자동 HTTPS 적용
- Supabase 모든 통신 HTTPS

### 5. 개인정보 마스킹
- 주민번호 뒷자리 마스킹 표시 (*******)
- 계좌번호 중간 마스킹 (****-**-*****)

---

## 📱 반응형 디자인

### 브레이크포인트 (Tailwind CSS 기준)
```typescript
sm: 640px   // 모바일
md: 768px   // 태블릿
lg: 1024px  // 데스크톱
xl: 1280px  // 와이드 데스크톱
```

### 우선순위
- Desktop-first 개발
- 모바일 조회 기능 지원
- 태블릿 최적화

---

## 🎨 디자인 가이드

### 컬러 팔레트
```css
Primary: Blue (#3B82F6)     /* 주요 액션 */
Success: Green (#10B981)    /* 성공 메시지 */
Warning: Yellow (#F59E0B)   /* 경고 */
Danger: Red (#EF4444)       /* 에러, 삭제 */
Gray: Slate (#64748B)       /* 텍스트, 배경 */
```

### 타이포그래피
- 기본 폰트: system-ui, sans-serif
- 제목: font-bold, text-2xl ~ text-4xl
- 본문: font-normal, text-sm ~ text-base
- 숫자(금액): font-mono (가독성)

---

## 📄 API 엔드포인트 설계

### 지급 대상자 (Payees)
```
GET    /api/payees          # 목록 조회
POST   /api/payees          # 신규 등록
GET    /api/payees/:id      # 상세 조회
PUT    /api/payees/:id      # 수정
DELETE /api/payees/:id      # 삭제
```

### 지급 관리 (Payments)
```
GET    /api/payments        # 목록 조회 (필터링 지원)
POST   /api/payments        # 신규 지급
GET    /api/payments/:id    # 상세 조회
PUT    /api/payments/:id    # 수정
DELETE /api/payments/:id    # 삭제
POST   /api/payments/bulk   # 일괄 지급 (엑셀 업로드)
```

### 영수증 (Receipts)
```
GET    /api/receipts                  # 목록 조회
POST   /api/receipts/generate         # PDF 생성
POST   /api/receipts/send-email       # 이메일 발송
GET    /api/receipts/:id              # 상세 조회
```

### 파일 업로드 (Upload)
```
POST   /api/upload/excel              # 엑셀 업로드
POST   /api/upload/contract           # 계약서 업로드
```

---

## ⚠️ 법적 준수 사항

### 1. 개인정보보호법
- 개인정보 수집 동의 필수
- 암호화 저장 의무
- 보유기간 명시 (5년)
- 파기 절차 마련

### 2. 소득세법
- 3.3% 원천징수 정확성
- 원천징수영수증 양식 준수
- 지급명세서 제출 의무 (연 1회)

### 3. 전자문서법
- 전자문서 보관 요건
- PDF 무결성 보장

---

## 🎯 성공 지표 (KPI)

### MVP 목표
- [ ] 회원가입 및 로그인 기능 작동
- [ ] 지급 대상자 10명 이상 등록 가능
- [ ] 지급 내역 100건 이상 등록 가능
- [ ] 원천징수영수증 PDF 생성 성공률 100%
- [ ] 엑셀 일괄 업로드 성공률 95% 이상
- [ ] 페이지 로딩 시간 3초 이내
- [ ] 모바일 반응형 지원
- [ ] E2E 테스트 통과율 100%

---

## 📚 참고 자료

### 국세청 관련
- 소득세법 시행령 (사업소득 원천징수)
- 원천징수영수증 표준 서식
- 홈택스 API 문서 (향후 연동 시)

### 기술 문서
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Playwright Documentation](https://playwright.dev)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

## 📞 문의 및 지원

프로젝트 관련 문의사항은 개발팀에 연락하시기 바랍니다.

---

**문서 버전**: 1.0.0  
**최종 수정일**: 2025-09-30  
**작성자**: AI Product Manager  
**상태**: Draft → Review → **Approved**
